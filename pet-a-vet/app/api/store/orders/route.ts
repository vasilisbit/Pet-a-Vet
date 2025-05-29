import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import * as cartModel from "@/lib/db/models/cart";
import * as orderModel from "@/lib/db/models/order";

// Mock orders data (for backward compatibility with existing GET requests)
const orders = [
  {
    id: "ORD-12345-ABCDE",
    userId: "user-123",
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
    billingAddress: {
      name: "John Doe",
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345",
      country: "United States",
    },
    estimatedDelivery: "May 25-27, 2025",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  if (orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.paymentMethod || !data.shippingAddress || !data.orderDetails) {
      return NextResponse.json(
        {
          error:
            "Payment method, shipping address, and order details are required",
        },
        { status: 400 }
      );
    }

    // Get or create cart for user
    const cart = await cartModel.getOrCreateCart(user.id);

    // Get cart items to ensure we have items to order
    const cartItems = await cartModel.getCartItems(cart.cart_id);
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Add items to cart before placing order." },
        { status: 400 }
      );
    }

    // Format shipping address for database storage
    const shippingAddressString = `${data.shippingAddress.name}\n${data.shippingAddress.street}\n${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}\n${data.shippingAddress.country}`;

    // Map payment method to database format
    const paymentMethod =
      data.paymentMethod === "credit-card" ? "CARD" : "CASH";

    // Create order in database
    const orderId = await orderModel.createOrderFromCart(
      user.id,
      cart.cart_id,
      paymentMethod,
      shippingAddressString,
      `Payment Method: ${data.paymentMethod}`
    );

    // Get the created order for response
    const createdOrder = await orderModel.findOrderById(orderId);
    if (!createdOrder) {
      throw new Error("Failed to retrieve created order");
    }

    // Get order items for response
    const orderItems = await orderModel.getOrderItems(orderId);

    // Generate a user-friendly order ID for frontend
    const displayOrderId = `ORD-${
      Math.floor(Math.random() * 90000) + 10000
    }-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Format response to match expected frontend structure
    const orderResponse = {
      id: displayOrderId,
      orderId: orderId,
      userId: user.id.toString(),
      date: new Date(createdOrder.order_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status: "Processing",
      paymentMethod: data.paymentMethod,
      items: orderItems.map((item) => ({
        id: item.product_id.toString(),
        name: (item as any).product_name || "Product",
        // Use price instead of non-existent price_at_purchase in the interface
        price: parseFloat((item as any).price?.toString() || "0"),
        quantity: item.quantity,
      })),
      subtotal: data.orderDetails.subtotal || 0,
      shipping: data.orderDetails.shipping || 0,
      tax: data.orderDetails.tax || 0,
      total: parseFloat(createdOrder.total_amount.toString()),
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress || data.shippingAddress,
      estimatedDelivery: `${new Date(
        Date.now() + 4 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })}-${new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        {
          day: "numeric",
          year: "numeric",
        }
      )}`,
    };

    // Add to mock orders array for backward compatibility with GET requests
    orders.push(orderResponse);

    return NextResponse.json({ order: orderResponse });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
