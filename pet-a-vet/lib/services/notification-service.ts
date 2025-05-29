// Mock notification data
const mockNotifications = [
  {
    id: "1",
    message: "Your appointment with Dr. Smith has been confirmed for tomorrow at 2:00 PM.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
  },
  {
    id: "2",
    message: "Reminder: Fluffy's vaccination is due next week.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    message: "Your order #12345 has been shipped and will arrive in 2-3 business days.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "4",
    message: "New product alert: Check out our new premium pet food collection!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    read: true,
  },
]

export interface Notification {
  id: string
  message: string
  timestamp: string
  read: boolean
}

// Simulate API call to get notifications
export async function getNotifications(): Promise<Notification[]> {
  try {
    // In a real app, this would be an API call
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return mock data
    return [...mockNotifications]
  } catch (error) {
    console.error("Error fetching notifications:", error)
    // Return empty array instead of throwing error
    return []
  }
}

// Simulate API call to mark notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    // In a real app, this would be an API call
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Find and update the notification in our mock data
    const index = mockNotifications.findIndex((notification) => notification.id === id)
    if (index !== -1) {
      mockNotifications[index].read = true
    }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    // Silently fail instead of throwing error
  }
}
