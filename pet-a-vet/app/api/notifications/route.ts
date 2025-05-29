import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock database for notifications
const notifications = [
  {
    id: "1",
    userId: "1",
    title: "Appointment Confirmed",
    message: "Your appointment for Max on June 10, 2023 at 10:00 AM has been confirmed.",
    read: false,
    createdAt: "2023-06-05T10:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    title: "Appointment Reminder",
    message: "Reminder: You have an appointment for Luna tomorrow at 2:30 PM.",
    read: true,
    createdAt: "2023-06-14T09:00:00Z",
  },
  {
    id: "3",
    userId: "2",
    title: "Appointment Rejected",
    message:
      "Your appointment request for Buddy on June 12, 2023 has been rejected. Reason: Veterinarian unavailable on this date",
    read: false,
    createdAt: "2023-06-05T15:30:00Z",
  },
]

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get notifications for the current user
  const userNotifications = notifications.filter((notification) => notification.userId === user.id)

  return NextResponse.json(userNotifications)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.userId || !data.title || !data.message) {
      return NextResponse.json({ error: "User ID, title, and message are required" }, { status: 400 })
    }

    // Create new notification
    const newNotification = {
      id: String(notifications.length + 1),
      userId: data.userId,
      title: data.title,
      message: data.message,
      read: false,
      createdAt: new Date().toISOString(),
    }

    // In a real app, this would be saved to a database
    notifications.push(newNotification)

    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    // Find the notification
    const notificationIndex = notifications.findIndex((notification) => notification.id === data.id)

    if (notificationIndex === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Check permissions
    const notification = notifications[notificationIndex]
    if (user.id !== notification.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to update this notification" }, { status: 403 })
    }

    // Update notification
    const updatedNotification = {
      ...notification,
      ...data,
    }

    notifications[notificationIndex] = updatedNotification

    return NextResponse.json(updatedNotification)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
