import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock subscription plans
const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential features for pet owners",
    price: 9.99,
    interval: "monthly",
    features: ["Pet profile management", "Appointment scheduling", "Medical history access", "Basic notifications"],
    isActive: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Enhanced features for dedicated pet owners",
    price: 19.99,
    interval: "monthly",
    features: [
      "All Basic features",
      "Priority appointment booking",
      "24/7 online vet consultation",
      "Personalized pet care reminders",
      "Exclusive discounts on products",
    ],
    isActive: true,
  },
  {
    id: "clinic",
    name: "Clinic",
    description: "Comprehensive solution for veterinary clinics",
    price: 49.99,
    interval: "monthly",
    features: [
      "All Premium features",
      "Staff management",
      "Inventory tracking",
      "Advanced analytics",
      "Client management",
      "Multi-location support",
    ],
    isActive: true,
  },
]

export async function GET() {
  // Get current user for authorization
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(subscriptionPlans)
}
