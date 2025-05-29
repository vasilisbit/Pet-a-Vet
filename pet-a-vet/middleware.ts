import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAdmin } from "./lib/auth-utils"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/forgot-password"]
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const authCookie = request.cookies.get("auth-token")
  if (!authCookie) {
    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Parse user data from cookie
  let userData = null
  try {
    userData = JSON.parse(authCookie.value)
  } catch (error) {
    // Redirect to login if cookie is invalid
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin users can access all paths
  if (isAdmin(userData.role)) {
    return NextResponse.next()
  }

  // Role-based path restrictions
  const restrictedPaths = {
    "/dashboard/customers": ["VETERINARIAN", "SECRETARY"],
    "/dashboard/warehouse": ["VETERINARIAN", "SECRETARY", "PETGROOMER"],
    "/dashboard/reports": ["VETERINARIAN", "SECRETARY"],
    "/dashboard/admin": ["ADMINISTRATOR", "ADMIN"],
  }

  // Check if the current path is restricted
  for (const [restrictedPath, allowedRoles] of Object.entries(restrictedPaths)) {
    if (path.startsWith(restrictedPath)) {
      // Check if user role is allowed
      const userRole = userData.role.toUpperCase()
      if (!allowedRoles.includes(userRole)) {
        // Redirect to dashboard if not allowed
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
