import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db/connection";
import * as orderModel from "@/lib/db/models/order";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow customers to access this endpoint
    if (user.role !== "customer") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Get customer's orders from database
    let orders = await orderModel.findOrdersByCustomerId(Number(user.id));

    // Apply status filter if provided
    if (status && status !== "all") {
      orders = orders.filter(
        (order: any) => order.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(
        (order: any) =>
          order.order_id.toString().includes(searchLower) ||
          order.status.toLowerCase().includes(searchLower) ||
          order.payment_method?.toLowerCase().includes(searchLower)
      );
    }

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        try {
          const items = await orderModel.getOrderItems(order.order_id);
          return {
            ...order,
            items: items,
          };
        } catch (err) {
          console.error(
            `Error fetching items for order ${order.order_id}:`,
            err
          );
          return {
            ...order,
            items: [],
          };
        }
      })
    );

    // Transform orders for frontend
    const transformedOrders = ordersWithItems.map((order: any) => ({
      _id: order.order_id.toString(),
      id: order.order_id.toString(),
      orderId: order.order_id.toString(),
      status: order.status.toLowerCase(),
      total: parseFloat(String(order.total_amount)) || 0,
      totalAmount: parseFloat(String(order.total_amount)) || 0,
      orderDate: order.order_date,
      items: order.items.map((item: any) => ({
        id: item.order_item_id.toString(),
        name: item.product_name || `Product #${item.product_id}`,
        quantity: item.quantity,
        price: parseFloat(String(item.price)) || 0,
        total: parseFloat(String(item.price)) * item.quantity,
        imageUrl: item.image_url || null,
        productId: item.product_id.toString(),
      })),
      customerName: user.name || "Unknown",
      customerEmail: user.email || "",
      createdAt: order.order_date,
      updatedAt: order.order_date,
      shippingAddress: order.shipping_address
        ? {
            street: order.shipping_address,
            city: "",
            state: "",
            zipCode: "",
            country: "",
          }
        : null,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status?.toLowerCase() || "pending",
      estimatedDeliveryDate: order.estimated_delivery_date,
      notes: order.notes,
      type: "customer",
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}
