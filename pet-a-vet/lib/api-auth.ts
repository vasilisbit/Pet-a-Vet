import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isAdminRole } from "./role-access"

export interface AuthUser {
  user_id: number
  username: string
  email: string
  full_name: string
  role: string
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth-token")

    if (!authToken) {
      return null
    }

    const userData = JSON.parse(authToken.value)
    return userData
  } catch (error) {
    console.error("Error parsing auth token:", error)
    return null
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Add user to request for handler to use
    ;(request as any).user = user

    return handler(request, ...args)
  }
}

export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest, ...args: any[]) => {
      const user = await getAuthUser(request)

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const normalizedRole = user.role.toUpperCase()
      const normalizedRoles = roles.map((r) => r.toUpperCase())

      // Check if user has required role or is admin
      if (!normalizedRoles.includes(normalizedRole) && !isAdminRole(normalizedRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      // Add user to request for handler to use
      ;(request as any).user = user

      return handler(request, ...args)
    }
  }
}

export function requireAdmin(handler: Function) {
  return requireRole(["ADMINISTRATOR", "ADMIN"])(handler)
}
