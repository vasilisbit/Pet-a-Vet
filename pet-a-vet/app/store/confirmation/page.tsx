import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Package, Truck, Calendar, Home, FileText } from "lucide-react"

// Mock order data
const order = {
  id: "ORD-12345-ABCDE",
  date: "May 21, 2025",
  status: "Processing",
  paymentMethod: "Credit Card (ending in 4242)",
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
  shippingAddress: {
    name: "John Doe",
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
    country: "United States",
  },
  estimatedDelivery: "May 25-27, 2025",
}

export default function ConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.id}</span>
              <span className="text-sm font-normal text-gray-500">Placed on {order.date}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Status
                </h3>
                <p className="text-gray-600">{order.status}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Estimated Delivery
                </h3>
                <p className="text-gray-600">{order.estimatedDelivery}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Shipping Address
                </h3>
                <p className="text-gray-600">
                  {order.shippingAddress.name}
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Payment Method
                </h3>
                <p className="text-gray-600">{order.paymentMethod}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              View Invoice
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Truck className="h-4 w-4 mr-2" />
              Track Order
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center">
          <p className="text-gray-600 mb-4">We've sent a confirmation email to your registered email address.</p>
          <Link href="/store">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
