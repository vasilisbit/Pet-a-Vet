import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    if (!data.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // In a real app, this would send an actual email
    // For now, we'll just simulate a successful email send
    console.log(`Welcome email sent to ${data.email}`)

    return NextResponse.json({ success: true, message: "Welcome email sent successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }
}
