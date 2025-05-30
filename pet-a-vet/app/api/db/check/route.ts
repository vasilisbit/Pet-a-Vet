import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db/connection"

export async function GET() {
  try {
    const connected = await testConnection()

    if (connected) {
      return NextResponse.json({
        connected: true,
        message: "Database connection successful",
      })
    } else {
      return NextResponse.json({
        connected: false,
        message: "Failed to connect to the database. Please check your configuration.",
      })
    }
  } catch (error) {
    console.error("Database connection check error:", error)
    return NextResponse.json(
      {
        connected: false,
        message: "An error occurred while checking the database connection",
      },
      { status: 500 },
    )
  }
}
