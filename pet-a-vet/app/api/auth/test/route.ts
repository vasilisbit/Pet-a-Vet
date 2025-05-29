import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { hasPageAccess } from "@/lib/role-access"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth-token")

  if (!authToken) {
    return NextResponse.json(
      {
        authenticated: false,
        message: "Not authenticated",
      },
      { status: 401 },
    )
  }

  try {
    const userData = JSON.parse(authToken.value)
    const { searchParams } = new URL(request.url)
    const testPath = searchParams.get("path")

    const response = {
      authenticated: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
      permissions: userData.permissions,
    }

    if (testPath) {
      response.hasAccess = hasPageAccess(userData.role, testPath)
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        message: "Invalid auth token",
      },
      { status: 401 },
    )
  }
}
