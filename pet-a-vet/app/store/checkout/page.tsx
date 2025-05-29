"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, CreditCard, Truck, DollarSign, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

// Mock cart summary data
const cartSummary = {
  items: [
    {
      id: "med-1",
      name: "Flea & Tick Prevention",
      price: 29.99,
      quantity: 1,
    },
    {
      id: "food-1",
      name: "Premium Dry Dog Food",
      price: 49.99,
      quantity: 2,
    },
  ],
  subtotal: 129.97,
  shipping: 0,
  tax: 10.4,
  total: 140.37,
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)

      // Redirect to confirmation page on success
      window.location.href = "/store/confirmation"
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/store/cart" className="flex items-center text-teal-600 hover:text-teal-700 mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" required />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input id="zip" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" defaultValue="United States" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="shipping-billing-same" defaultChecked />
                    <label
                      htmlFor="shipping-billing-same"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Billing address is the same as shipping address
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                      <Label htmlFor="cash-on-delivery" className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit-card" && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" required />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input id="expiryDate" placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" required />
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Your payment information is encrypted and secure.
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash-on-delivery" && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-md text-sm text-yellow-800">
                      <p>
                        You will pay the delivery person when your order arrives. Please have the exact amount ready.
                        Additional delivery fee may apply.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 lg:hidden">
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Complete Order • $${cartSummary.total.toFixed(2)}`}
              </Button>
            </div>
          </form>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartSummary.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cartSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {cartSummary.shipping === 0 ? "Free" : `$${cartSummary.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${cartSummary.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartSummary.total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full hidden lg:flex" onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Complete Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
