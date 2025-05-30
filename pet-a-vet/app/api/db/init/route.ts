import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db/init"
import { getCurrentUser } from "@/lib/auth"

export async function POST() {
  try {
    // Check if user is authorized (admin only)
    const user = await getCurrentUser()

    if (!user || user.role !== "administrator") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Only administrators can initialize the database.",
        },
        { status: 403 },
      )
    }

    const success = await initializeDatabase()

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Database initialized successfully",
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to initialize database. Check server logs for details.",
      })
    }
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during database initialization",
      },
      { status: 500 },
    )
  }
}
