import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findOrdersByCustomerId } from "@/lib/db/models/order";
import { query } from "@/lib/db/connection";

// Mock database for supplier orders
const supplierOrders = [
  {
    id: "ORD-2023-001",
    supplier: "MedVet Supplies",
    orderDate: "2023-06-01",
    expectedDelivery: "2023-06-10",
    status: "pending",
    totalItems: 5,
    totalCost: 450.75,
    type: "supplier",
    items: [
      {
        id: 1,
        name: "Rabies Vaccine",
        quantity: 20,
        unit: "vial",
        price: 25.99,
      },
      {
        id: 4,
        name: "Surgical Gloves",
        quantity: 100,
        unit: "pair",
        price: 8.99,
      },
    ],
  },
  {
    id: "ORD-2023-002",
    supplier: "PharmaVet",
    orderDate: "2023-06-03",
    expectedDelivery: "2023-06-12",
    status: "shipped",
    totalItems: 3,
    totalCost: 275.5,
    type: "supplier",
    items: [
      {
        id: 2,
        name: "Antibiotics - Amoxicillin",
        quantity: 15,
        unit: "bottle",
        price: 18.5,
      },
    ],
  },
  {
    id: "ORD-2023-003",
    supplier: "PetHealth Inc.",
    orderDate: "2023-05-25",
    expectedDelivery: "2023-06-05",
    status: "delivered",
    totalItems: 2,
    totalCost: 180.25,
    type: "supplier",
    items: [
      {
        id: 3,
        name: "Flea & Tick Treatment",
        quantity: 10,
        unit: "pack",
        price: 35.75,
      },
    ],
  },
];

// Get customer orders from database
async function getCustomerOrders() {
  try {
    const orders = await query<any[]>(
      `SELECT o.*, u.full_name as customer_name, u.email as customer_email
       FROM \`Order\` o 
       JOIN Customer c ON o.customer_id = c.customer_id
       JOIN User u ON c.customer_id = u.user_id
       ORDER BY o.order_date DESC`,
      []
    );

    return orders.map((order) => ({
      id: order.order_id.toString(),
      customer: order.customer_name,
      customerEmail: order.customer_email,
      orderDate: new Date(order.order_date).toISOString().split("T")[0],
      expectedDelivery: order.estimated_delivery_date
        ? new Date(order.estimated_delivery_date).toISOString().split("T")[0]
        : "TBD",
      status: order.status.toLowerCase(),
      totalItems: 0, // Will be calculated from order items
      totalCost: parseFloat(order.total_amount),
      type: "customer",
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      shippingAddress: order.shipping_address,
      items: [], // Will be populated if needed
    }));
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const supplier = searchParams.get("supplier");
  const orderType = searchParams.get("type") || "supplier"; // Default to supplier orders

  let filteredOrders: any[] = [];

  // Get orders based on type
  if (orderType === "customer") {
    const customerOrders = await getCustomerOrders();
    filteredOrders = [...customerOrders];
  } else {
    filteredOrders = [...supplierOrders];
  }

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredOrders = filteredOrders.filter((order) => {
      if (orderType === "customer") {
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.customer.toLowerCase().includes(searchLower) ||
          order.customerEmail.toLowerCase().includes(searchLower)
        );
      } else {
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.supplier.toLowerCase().includes(searchLower)
        );
      }
    });
  }

  // Apply status filter
  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status === status);
  }

  // Apply supplier filter (only for supplier orders)
  if (supplier && orderType === "supplier") {
    filteredOrders = filteredOrders.filter(
      (order) => order.supplier === supplier
    );
  }

  return NextResponse.json(filteredOrders);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.supplier ||
      !data.expectedDelivery ||
      !data.items ||
      data.items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Supplier, expected delivery date, and at least one item are required",
        },
        { status: 400 }
      );
    }

    // Calculate total items and cost
    const totalItems = data.items.reduce(
      (total: number, item: any) => total + item.quantity,
      0
    );
    const totalCost = data.items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );

    // Create new order
    const newOrder = {
      id: `ORD-${new Date().getFullYear()}-${
        supplierOrders.length + 1
      }`.padStart(10, "0"),
      supplier: data.supplier,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: data.expectedDelivery,
      status: "pending",
      totalItems,
      totalCost,
      type: "supplier",
      items: data.items,
    };

    // In a real app, this would be saved to a database
    // supplierOrders.push(newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
