import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock database for inventory items
const inventoryItems = [
  {
    id: 1,
    name: "Rabies Vaccine",
    category: "Vaccine",
    currentStock: 45,
    unit: "vial",
    location: "Refrigerator 1",
    barcode: "VAC-RB-001",
  },
  {
    id: 2,
    name: "Antibiotics - Amoxicillin",
    category: "Medication",
    currentStock: 12,
    unit: "bottle",
    location: "Cabinet 3, Shelf 2",
    barcode: "MED-AM-002",
  },
  {
    id: 3,
    name: "Flea & Tick Treatment",
    category: "Medication",
    currentStock: 32,
    unit: "pack",
    location: "Cabinet 2, Shelf 1",
    barcode: "MED-FT-003",
  },
  {
    id: 4,
    name: "Surgical Gloves",
    category: "Equipment",
    currentStock: 150,
    unit: "pair",
    location: "Storage Room, Bin 5",
    barcode: "EQ-SG-004",
  },
  {
    id: 5,
    name: "Distemper Vaccine",
    category: "Vaccine",
    currentStock: 28,
    unit: "vial",
    location: "Refrigerator 1",
    barcode: "VAC-DT-005",
  },
]

// Mock database for inventory counts
const inventoryCounts = [
  {
    id: "INV-2023-05-10-001",
    countDate: "2023-05-10",
    countType: "full",
    status: "completed",
    items: [
      {
        id: 1,
        name: "Rabies Vaccine",
        category: "Vaccine",
        systemQuantity: 50,
        countedQuantity: 45,
        unit: "vial",
      },
      {
        id: 2,
        name: "Antibiotics - Amoxicillin",
        category: "Medication",
        systemQuantity: 15,
        countedQuantity: 12,
        unit: "bottle",
      },
    ],
    discrepancies: 2,
  },
]

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    const count = inventoryCounts.find((count) => count.id === id)
    if (!count) {
      return NextResponse.json({ error: "Inventory count not found" }, { status: 404 })
    }
    return NextResponse.json(count)
  }

  return NextResponse.json(inventoryCounts)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.countType) {
      return NextResponse.json({ error: "Count type is required" }, { status: 400 })
    }

    // Filter items by category if partial count
    let itemsToCount = [...inventoryItems]
    if (data.countType === "partial" && data.categoryFilter) {
      itemsToCount = itemsToCount.filter((item) => item.category === data.categoryFilter)
    }

    // Create inventory count items
    const countItems = itemsToCount.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      systemQuantity: item.currentStock,
      countedQuantity: null,
      unit: item.unit,
      location: item.location,
      barcode: item.barcode,
    }))

    // Create new inventory count
    const newCount = {
      id: `INV-${new Date().toISOString().split("T")[0]}-${inventoryCounts.length + 1}`.padStart(3, "0"),
      countDate: new Date().toISOString().split("T")[0],
      countType: data.countType,
      status: "in-progress",
      items: countItems,
      discrepancies: 0,
    }

    // In a real app, this would be saved to a database
    // inventoryCounts.push(newCount);

    return NextResponse.json(newCount, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
