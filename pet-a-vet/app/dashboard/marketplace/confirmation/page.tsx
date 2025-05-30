"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Truck,
  Calendar,
  FileText,
  Home,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrderItem {
  id?: string;
  product_id?: string;
  cart_item_id?: string;
  name: string;
  price?: number;
  price_at_addition?: number;
  quantity: number;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const itemsParam = searchParams.get("items");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);

        // First try to get items from sessionStorage (most reliable)
        const storedItems = sessionStorage.getItem("checkoutCartItems");
        if (storedItems) {
          try {
            const parsedStoredItems = JSON.parse(storedItems);
            setOrderItems(parsedStoredItems);
            // Clean up after reading
            sessionStorage.removeItem("checkoutCartItems");
          } catch (e) {
            console.error("Error parsing items from sessionStorage:", e);
          }
        }
        // Next try URL parameters
        else if (itemsParam) {
          try {
            const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
            setOrderItems(parsedItems);
          } catch (e) {
            console.error("Error parsing items from URL:", e);
          }
        }

        // If we have an order ID, fetch the order details
        if (orderId) {
          const controller = new AbortController();

          try {
            const response = await fetch(`/api/store/orders?id=${orderId}`, {
              signal: controller.signal,
            });

            if (!response.ok) {
              throw new Error("Failed to fetch order details");
            }

            const orderData = await response.json();

            setOrderNumber(orderData.id || `ORD-${orderId}`);
            setOrderDate(
              new Date(orderData.orderDate || Date.now()).toLocaleDateString()
            );
            setOrderData(orderData);

            // If we couldn't get items from sessionStorage or URL, use the ones from the order
            if (
              orderItems.length === 0 &&
              orderData.items &&
              orderData.items.length > 0
            ) {
              setOrderItems(orderData.items);
            }

            // If order has shipping information
            if (orderData.estimatedDelivery) {
              setEstimatedDelivery(
                new Date(orderData.estimatedDelivery).toLocaleDateString()
              );
            } else {
              setEstimatedDelivery(
                new Date(
                  Date.now() + 5 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()
              );
            }
          } catch (error: any) {
            if (error.name !== "AbortError") {
              throw error;
            }
          } finally {
            controller.abort();
          }
        } else {
          // Fallback to generated data if no order ID
          setOrderNumber("ORD-" + Math.floor(100000 + Math.random() * 900000));
          setOrderDate(new Date().toLocaleDateString());

          // If we still don't have items, use these defaults
          if (orderItems.length === 0) {
            setOrderItems([
              {
                id: "med-1",
                name: "Flea & Tick Prevention",
                price_at_addition: 29.99,
                quantity: 1,
              },
              {
                id: "food-2",
                name: "Grain-Free Cat Food",
                price_at_addition: 39.99,
                quantity: 2,
              },
            ]);
          }

          // Set estimated delivery date
          setEstimatedDelivery(
            new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
          );
        }
      } catch (err) {
        console.error("Error fetching order data:", err);
        setError(
          "Failed to load order details. Your order was processed, but we couldn't retrieve the details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, itemsParam, orderItems.length]);

  // Calculate order totals using price_at_addition for consistency
  const subtotal = orderItems.reduce(
    (sum, item) =>
      sum + (item.price_at_addition || item.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted animate-pulse mb-4"></div>
          <div className="h-8 bg-muted animate-pulse rounded-md w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-muted animate-pulse rounded-md w-96 max-w-full mx-auto"></div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded-md w-32"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-muted animate-pulse rounded-md w-24 mb-2"></div>
                    <div className="h-5 bg-muted animate-pulse rounded-md w-32"></div>
                  </div>
                ))}
            </div>

            <Separator />

            <div>
              <div className="h-5 bg-muted animate-pulse rounded-md w-16 mb-3"></div>
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex justify-between mb-2 last:mb-0">
                    <div className="h-4 bg-muted animate-pulse rounded-md w-48"></div>
                    <div className="h-4 bg-muted animate-pulse rounded-md w-16"></div>
                  </div>
                ))}
            </div>

            <Separator />

            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-muted animate-pulse rounded-md w-20"></div>
                  <div className="h-4 bg-muted animate-pulse rounded-md w-16"></div>
                </div>
              ))}
            <div className="flex justify-between">
              <div className="h-5 bg-muted animate-pulse rounded-md w-16"></div>
              <div className="h-5 bg-muted animate-pulse rounded-md w-20"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded-md w-40"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(2)
                .fill(0)
                .map((_, i) => (
                  <div key={i}>
                    <div className="h-5 bg-muted animate-pulse rounded-md w-32 mb-2"></div>
                    <div className="space-y-1">
                      {Array(4)
                        .fill(0)
                        .map((_, j) => (
                          <div
                            key={j}
                            className="h-4 bg-muted animate-pulse rounded-md w-full"
                          ></div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-10 bg-muted animate-pulse rounded-md w-full"></div>
          <div className="h-10 bg-muted animate-pulse rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. We've received your order and will
            process it right away.
          </p>
        </div>
        <Button asChild className="mt-4">
          <Link href="/dashboard/marketplace">Return to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. We've received your order and will
          process it right away.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Order Number</div>
              <div className="font-medium text-foreground">{orderNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Order Date</div>
              <div className="font-medium text-foreground">{orderDate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Payment Method
              </div>
              <div className="font-medium text-foreground">
                Credit Card (ending in 3456)
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Shipping Method
              </div>
              <div className="font-medium text-foreground">
                Standard Shipping
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="font-medium mb-2 text-foreground">Items</div>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div
                  key={item.id || item.cart_item_id || item.name}
                  className="flex justify-between"
                >
                  <div>
                    {item.name}{" "}
                    <span className="text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="text-foreground">
                    $
                    {(
                      (item.price_at_addition || item.price || 0) *
                      item.quantity
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-foreground mb-2">
                <Truck className="h-5 w-5 mr-2 text-teal-600" />
                <div className="font-medium">Shipping Address</div>
              </div>
              <div className="text-muted-foreground">
                <p>{orderData?.shippingAddress?.name || "John Doe"}</p>
                <p>{orderData?.shippingAddress?.street || "123 Main Street"}</p>
                <p>
                  {orderData?.shippingAddress?.city || "Anytown"},{" "}
                  {orderData?.shippingAddress?.state || "CA"}{" "}
                  {orderData?.shippingAddress?.zip || "12345"}
                </p>
                <p>{orderData?.shippingAddress?.country || "United States"}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center text-foreground mb-2">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                <div className="font-medium">Estimated Delivery</div>
              </div>
              <p className="text-muted-foreground">{estimatedDelivery}</p>
              <p className="text-sm text-muted-foreground mt-2">
                You will receive tracking information via email once your order
                ships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <Button asChild className="flex-1">
          <Link href="/dashboard/marketplace">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/dashboard/orders">
            <FileText className="h-4 w-4 mr-2" />
            View All Orders
          </Link>
        </Button>
      </div>
    </div>
  );
}
