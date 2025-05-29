import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const data = await request.json()

  // In a real application, this would integrate with a payment processor like Stripe
  // For this example, we'll simulate a payment processing delay and success/failure

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Validate payment data
  if (!data.paymentMethod) {
    return NextResponse.json({ success: false, message: "Payment method is required" }, { status: 400 })
  }

  // For demonstration, we'll randomly succeed or fail card payments
  // Cash on delivery always succeeds
  let success = true
  let message = "Payment processed successfully"

  if (data.paymentMethod === "credit-card") {
    // Validate card details
    if (!data.cardNumber || !data.expiryDate || !data.cvv) {
      return NextResponse.json({ success: false, message: "Invalid card details" }, { status: 400 })
    }

    // Simulate some failures for testing
    if (data.cardNumber === "4111111111111111") {
      success = false
      message = "Card declined. Insufficient funds."
    }
  }

  if (success) {
    // Generate a fake transaction ID
    const transactionId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      transactionId,
      orderId: data.orderId,
    })
  } else {
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
