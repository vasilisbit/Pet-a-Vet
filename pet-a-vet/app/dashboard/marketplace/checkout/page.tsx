"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  CreditCard,
  Truck,
  DollarSign,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth";

interface CartItem {
  cart_item_id: string;
  product_id: string;
  name: string;
  price_at_addition: number;
  quantity: number;
  image_url: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    shippingBillingSame: true,
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get current user
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (!user) {
          setError("Please log in to proceed with checkout");
          return;
        }

        // Fetch user profile
        const profileResponse = await fetch("/api/user/profile");
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const profileData = await profileResponse.json();
        setUserProfile(profileData);

        // Pre-fill form with user data
        if (profileData) {
          const nameParts = profileData.full_name?.split(" ") || ["", ""];
          const addressParts = profileData.address?.split(", ") || ["", "", ""];

          setFormData({
            ...formData,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            address: addressParts[0] || "",
            city: addressParts[1] || "",
            state: addressParts[2] || "",
            zip: addressParts[3] || "",
          });
        }

        // Fetch cart
        const cartResponse = await fetch("/api/store/cart");
        if (!cartResponse.ok) {
          throw new Error("Failed to fetch cart");
        }

        const cartData = await cartResponse.json();
        setCart(cartData);

        if (cartData.items.length === 0) {
          setError(
            "Your cart is empty. Add items to your cart before checkout."
          );
        }
      } catch (err) {
        console.error("Error fetching checkout data:", err);
        setError("Failed to load checkout data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.items.length === 0) {
      toast({
        title: "Empty Cart",
        description:
          "Your cart is empty. Add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Save cart items for confirmation page to prevent data loss
      const cartItemsForConfirmation = JSON.stringify(cart.items);
      sessionStorage.setItem("checkoutCartItems", cartItemsForConfirmation);

      // Create order
      const orderData = {
        paymentMethod,
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        billingAddress: formData.shippingBillingSame
          ? {
              name: `${formData.firstName} ${formData.lastName}`,
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zip: formData.zip,
              country: formData.country,
            }
          : {
              // Would need additional form fields for billing address if different
              name: `${formData.firstName} ${formData.lastName}`,
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zip: formData.zip,
              country: formData.country,
            },
        orderDetails: {
          subtotal: cart.subtotal,
          shipping: cart.shipping,
          tax: cart.tax,
          total: cart.total,
          items: cart.items,
        },
      };

      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();

      // Clear cart
      await fetch("/api/store/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clear",
        }),
      });

      // Redirect to confirmation page with order data for accurate display
      router.push(
        `/dashboard/marketplace/confirmation?orderId=${
          data.order.id
        }&items=${encodeURIComponent(cartItemsForConfirmation)}`
      );
    } catch (error) {
      console.error("Error processing order:", error);
      toast({
        title: "Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard/marketplace/cart"
          className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="h-6 w-48 bg-muted animate-pulse rounded-md"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                          <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                        </div>
                      ))}
                  </div>
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded-md"></div>
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                      </div>
                    ))}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 w-20 bg-muted animate-pulse rounded-md"></div>
                          <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-6 w-40 bg-muted animate-pulse rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div className="h-5 w-5 rounded-full bg-muted animate-pulse"></div>
                          <div className="h-5 w-32 bg-muted animate-pulse rounded-md"></div>
                        </div>
                      ))}
                    <div className="mt-6 space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-4 w-28 bg-muted animate-pulse rounded-md"></div>
                            <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded-md"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex items-start mb-3 pb-3 border-b border-border last:border-0 last:mb-0 last:pb-0"
                      >
                        <div className="w-10 h-10 bg-muted animate-pulse rounded"></div>
                        <div className="flex-grow min-w-0 mx-3">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded-md mb-1"></div>
                          <div className="h-3 w-20 bg-muted animate-pulse rounded-md"></div>
                        </div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded-md"></div>
                      </div>
                    ))}
                </div>
                <Separator />
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded-md"></div>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded-md"></div>
                    </div>
                  ))}
                <Separator />
                <div className="flex justify-between">
                  <div className="h-5 w-12 bg-muted animate-pulse rounded-md"></div>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard/marketplace/cart"
          className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>

        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>

        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/dashboard/marketplace/cart"
        className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

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
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shipping-billing-same"
                      checked={formData.shippingBillingSame}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          shippingBillingSame: checked as boolean,
                        })
                      }
                    />
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
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label
                        htmlFor="credit-card"
                        className="flex items-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="cash-on-delivery"
                        id="cash-on-delivery"
                      />
                      <Label
                        htmlFor="cash-on-delivery"
                        className="flex items-center"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit-card" && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                          />
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
                        You will pay the delivery person when your order
                        arrives. Please have the exact amount ready. Additional
                        delivery fee may apply.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 lg:hidden">
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing
                  ? "Processing..."
                  : `Complete Order • $${cart.total.toFixed(2)}`}
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
              <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2">
                {cart.items.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex items-start mb-3 pb-3 border-b border-border last:border-0 last:mb-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-10 h-10 mr-3 bg-muted rounded overflow-hidden">
                      <img
                        src={
                          item.image_url ||
                          "/placeholder.svg?height=40&width=40&query=pet%20product"
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-sm line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        $
                        {Number.parseFloat(
                          item.price_at_addition.toString()
                        ).toFixed(2)}{" "}
                        × {item.quantity}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2 text-right">
                      <span className="font-medium">
                        $
                        {(
                          Number.parseFloat(item.price_at_addition.toString()) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">
                  {cart.shipping === 0
                    ? "Free"
                    : `$${cart.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">
                  ${cart.tax.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full hidden lg:flex"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Complete Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
