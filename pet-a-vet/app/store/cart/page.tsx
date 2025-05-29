"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Minus, Plus, ShoppingBag, Trash2, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

// Mock cart data - in a real app, this would come from a state management solution or API
const initialCartItems = [
  {
    id: "med-1",
    name: "Flea & Tick Prevention",
    price: 29.99,
    quantity: 1,
    image: "/placeholder.svg?height=80&width=80&query=flea%20tick%20medicine",
  },
  {
    id: "food-1",
    name: "Premium Dry Dog Food",
    price: 49.99,
    quantity: 2,
    image: "/placeholder.svg?height=80&width=80&query=premium%20dog%20food",
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const { toast } = useToast()

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    })
  }

  const applyPromoCode = () => {
    setIsApplyingPromo(true)
    // Simulate API call
    setTimeout(() => {
      setIsApplyingPromo(false)
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is invalid or expired",
        variant: "destructive",
      })
    }, 1000)
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + shipping + tax

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/store" className="flex items-center text-teal-600 hover:text-teal-700 mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-medium text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/store">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center p-4 md:p-6">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <Link href={`/store/product/${item.id}`}>
                          <h3 className="font-medium text-gray-900 hover:text-teal-600">{item.name}</h3>
                        </Link>
                        <div className="text-gray-600 text-sm mt-1">Item #: {item.id}</div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <div className="font-medium text-gray-900">${item.price.toFixed(2)}</div>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-4 p-1 text-gray-500 hover:text-red-500"
                            aria-label="Remove item from cart"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {index < cartItems.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="pt-4">
                  <div className="flex gap-2 mb-4">
                    <Input placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                    <Button variant="outline" onClick={applyPromoCode} disabled={!promoCode || isApplyingPromo}>
                      Apply
                    </Button>
                  </div>
                  <Link href="/store/checkout">
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 text-sm text-gray-600 rounded-b-lg">
                <p>We accept credit cards, PayPal, and cash on delivery. All prices are in USD.</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
