import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Create a response object
  const response = NextResponse.json({ success: true });

  // Set the cookie to expire in the response
  response.cookies.set({
    name: "auth-token",
    value: "",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
