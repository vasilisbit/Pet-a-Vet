import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import * as userModel from "@/lib/db/models/user"

export async function GET() {
  try {
    // Get the current user from the auth token
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Fetch the full user data from the database
    const userData = await userModel.findUserById(currentUser.id)

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return a sanitized version of the user data (without password)
    const { password, ...userDataWithoutPassword } = userData

    return NextResponse.json({
      id: userDataWithoutPassword.user_id,
      name: userDataWithoutPassword.full_name,
      email: userDataWithoutPassword.email,
      username: userDataWithoutPassword.username,
      phone: userDataWithoutPassword.phone,
      address: userDataWithoutPassword.address,
      role: userDataWithoutPassword.role.toLowerCase(),
      avatar: "/abstract-geometric-shapes.png", // Default avatar for now
      created_at: userDataWithoutPassword.created_at,
      status: userDataWithoutPassword.status,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the current user from the auth token
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Parse the request body
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if the user exists
    const user = await userModel.findUserById(currentUser.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Handle password change if requested
    if (data.currentPassword && data.newPassword) {
      // Verify current password
      const isPasswordValid = await userModel.verifyPassword(user, data.currentPassword)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      // Update password
      await userModel.updateUserPassword(currentUser.id, data.newPassword)
    }

    // Update user data
    const updateData = {
      full_name: data.name,
      email: data.email,
      phone: data.phone || user.phone,
      address: data.address || user.address,
    }

    await userModel.updateUser(currentUser.id, updateData)

    return NextResponse.json({ success: true, message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
