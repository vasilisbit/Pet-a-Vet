// Subscription service for handling API calls

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: "monthly" | "yearly"
  features: string[]
  isActive: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  planName: string
  status: "active" | "cancelled" | "expired"
  startDate: string
  endDate: string
  renewalDate: string | null
  paymentMethod: string | null
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetch("/api/subscriptions/plans")

    if (!response.ok) {
      throw new Error("Failed to fetch subscription plans")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching subscription plans:", error)
    return []
  }
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  try {
    const response = await fetch("/api/subscriptions/current")

    if (!response.ok) {
      throw new Error("Failed to fetch current subscription")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching current subscription:", error)
    return null
  }
}

export async function subscribeToNewPlan(planId: string): Promise<Subscription | null> {
  try {
    const response = await fetch("/api/subscriptions/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planId }),
    })

    if (!response.ok) {
      throw new Error("Failed to subscribe to plan")
    }

    return await response.json()
  } catch (error) {
    console.error("Error subscribing to plan:", error)
    return null
  }
}

export async function cancelSubscription(): Promise<boolean> {
  try {
    const response = await fetch("/api/subscriptions/cancel", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to cancel subscription")
    }

    return true
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return false
  }
}
