import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import * as veterinarianModel from "@/lib/db/models/veterinarian"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const veterinarians = await veterinarianModel.findAllVeterinarians()

    return NextResponse.json({ veterinarians })
  } catch (error) {
    console.error("Error fetching veterinarians:", error)
    return NextResponse.json({ error: "Failed to fetch veterinarians" }, { status: 500 })
  }
}
