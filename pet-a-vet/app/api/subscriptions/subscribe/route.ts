import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  // Get current user for authorization
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    // In a real app, you would create a subscription in your database
    // and process payment through a payment provider
    const newSubscription = {
      id: `sub-${Date.now()}`,
      userId: currentUser.id,
      planId: planId,
      planName: getPlanName(planId),
      status: "active",
      startDate: new Date().toISOString(),
      endDate: getEndDate(),
      renewalDate: getEndDate(),
      paymentMethod: "credit_card",
    }

    return NextResponse.json(newSubscription)
  } catch (error) {
    console.error("Error subscribing to plan:", error)
    return NextResponse.json({ error: "Failed to subscribe to plan" }, { status: 500 })
  }
}

function getPlanName(planId: string): string {
  const plans = {
    basic: "Basic",
    premium: "Premium",
    clinic: "Clinic",
  }
  return plans[planId] || "Unknown"
}

function getEndDate(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString()
}
