"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("[CartPage] Initializing cart fetch");
    const controller = new AbortController();

    const fetchCart = async () => {
      try {
        setLoading(true);

        // Get current user
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (!user) {
          setError("Please log in to view your cart");
          return;
        }

        console.log("[CartPage] Fetching cart data");
        const response = await fetch("/api/store/cart", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const cartData = await response.json();
        setCart(cartData);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error fetching cart:", err);
          setError("Failed to load cart. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();

    // Cleanup function
    return () => {
      console.log("[CartPage] Cleaning up cart fetch");
      controller.abort();
    };
  }, []); // Empty dependency array means this only runs once on mount

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch("/api/store/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          item: { id, quantity: newQuantity },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating cart:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await fetch("/api/store/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "remove",
          item: { id },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      const updatedCart = await response.json();
      setCart(updatedCart);

      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const applyPromoCode = () => {
    setIsApplyingPromo(true);
    // Simulate API call
    setTimeout(() => {
      setIsApplyingPromo(false);
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is invalid or expired",
        variant: "destructive",
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard/marketplace"
          className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">
          Your Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="h-7 bg-muted animate-pulse rounded-md w-40"></div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="mb-6 last:mb-0">
                      <div className="flex items-start">
                        <div className="w-20 h-20 bg-muted animate-pulse rounded"></div>
                        <div className="flex-grow ml-4">
                          <div className="h-5 bg-muted animate-pulse rounded-md w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted animate-pulse rounded-md w-1/3 mb-4"></div>
                          <div className="flex items-center">
                            <div className="h-8 w-24 bg-muted animate-pulse rounded-md"></div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="h-5 bg-muted animate-pulse rounded-md w-16"></div>
                        </div>
                      </div>
                      {i < 2 && <Separator className="my-6" />}
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <div className="h-7 bg-muted animate-pulse rounded-md w-36"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-muted animate-pulse rounded-md w-20"></div>
                      <div className="h-4 bg-muted animate-pulse rounded-md w-16"></div>
                    </div>
                  ))}
                <Separator />
                <div className="flex justify-between">
                  <div className="h-6 bg-muted animate-pulse rounded-md w-16"></div>
                  <div className="h-6 bg-muted animate-pulse rounded-md w-20"></div>
                </div>
                <div className="pt-4">
                  <div className="h-10 bg-muted animate-pulse rounded-md w-full"></div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50">
                <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
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
          href="/dashboard/marketplace"
          className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Continue Shopping
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
        href="/dashboard/marketplace"
        className="flex items-center text-teal-600 hover:text-teal-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">
        Your Shopping Cart
      </h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-medium text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link href="/dashboard/marketplace">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cart.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cart.items.map((item, index) => (
                  <div key={item.cart_item_id}>
                    <div className="flex items-start p-4 md:p-6">
                      <div className="w-20 h-20 flex-shrink-0 mr-4">
                        <img
                          src={
                            item.image_url ||
                            "/placeholder.svg?height=80&width=80&query=pet%20product"
                          }
                          alt={item.name}
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                      <div className="flex flex-col flex-grow min-w-0">
                        <Link
                          href={`/dashboard/marketplace/product/${item.product_id}`}
                        >
                          <h3 className="font-medium text-foreground hover:text-teal-600 text-base md:text-lg line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="text-muted-foreground text-sm mt-1">
                          Item #: {item.product_id}
                        </div>
                        <div className="mt-auto flex items-center pt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                            className="p-1 text-muted-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity + 1)
                            }
                            className="p-1 text-muted-foreground hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="ml-4 p-1 text-muted-foreground hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <div className="font-medium text-foreground text-right">
                          $
                          {Number.parseFloat(
                            item.price_at_addition.toString()
                          ).toFixed(2)}
                        </div>
                        <div className="text-muted-foreground text-sm mt-1 text-right">
                          Subtotal: $
                          {(
                            Number.parseFloat(
                              item.price_at_addition.toString()
                            ) * item.quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {index < cart.items.length - 1 && <Separator />}
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

                <div className="pt-4">
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={!promoCode || isApplyingPromo}
                    >
                      Apply
                    </Button>
                  </div>
                  <Link href="/dashboard/marketplace/checkout">
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 text-sm text-muted-foreground rounded-b-lg">
                <p>
                  We accept credit cards, PayPal, and cash on delivery. All
                  prices are in USD.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
