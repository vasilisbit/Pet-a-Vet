import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Mock database for inventory items
const inventoryItems = [
  {
    id: 1,
    name: "Rabies Vaccine",
    category: "Vaccine",
    currentStock: 45,
    minStock: 20,
    expiryDate: "2024-06-15",
    supplier: "MedVet Supplies",
    price: 25.99,
    cost: 18.5,
    location: "Refrigerator 1",
    barcode: "VAC-RB-001",
    status: "normal", // normal, low, expiring
  },
  {
    id: 2,
    name: "Antibiotics - Amoxicillin",
    category: "Medication",
    currentStock: 12,
    minStock: 15,
    expiryDate: "2023-12-10",
    supplier: "PharmaVet",
    price: 18.5,
    cost: 12.75,
    location: "Cabinet 3, Shelf 2",
    barcode: "MED-AM-002",
    status: "low",
  },
  {
    id: 3,
    name: "Flea & Tick Treatment",
    category: "Medication",
    currentStock: 32,
    minStock: 10,
    expiryDate: "2023-08-22",
    supplier: "PetHealth Inc.",
    price: 35.75,
    cost: 24.5,
    location: "Cabinet 2, Shelf 1",
    barcode: "MED-FT-003",
    status: "expiring",
  },
  {
    id: 4,
    name: "Surgical Gloves",
    category: "Equipment",
    currentStock: 150,
    minStock: 50,
    expiryDate: "2025-01-30",
    supplier: "MedVet Supplies",
    price: 8.99,
    cost: 5.25,
    location: "Storage Room, Bin 5",
    barcode: "EQ-SG-004",
    status: "normal",
  },
  {
    id: 5,
    name: "Distemper Vaccine",
    category: "Vaccine",
    currentStock: 28,
    minStock: 15,
    expiryDate: "2024-03-18",
    supplier: "PharmaVet",
    price: 22.5,
    cost: 16.75,
    location: "Refrigerator 1",
    barcode: "VAC-DT-005",
    status: "normal",
  },
]

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const category = searchParams.get("category")
  const status = searchParams.get("status")

  let filteredItems = [...inventoryItems]

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase()
    filteredItems = filteredItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.barcode?.toLowerCase().includes(searchLower) ||
        item.supplier.toLowerCase().includes(searchLower),
    )
  }

  // Apply category filter
  if (category && category !== "all") {
    filteredItems = filteredItems.filter((item) => item.category.toLowerCase() === category.toLowerCase())
  }

  // Apply status filter
  if (status) {
    filteredItems = filteredItems.filter((item) => item.status === status)
  }

  return NextResponse.json(filteredItems)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.category || data.currentStock === undefined || data.minStock === undefined) {
      return NextResponse.json(
        { error: "Name, category, current stock, and minimum stock are required" },
        { status: 400 },
      )
    }

    // Determine status
    let status = "normal"
    if (data.currentStock < data.minStock) {
      status = "low"
    } else if (data.expiryDate) {
      const expiryDate = new Date(data.expiryDate)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      if (expiryDate <= thirtyDaysFromNow) {
        status = "expiring"
      }
    }

    // Create new inventory item
    const newItem = {
      id: inventoryItems.length + 1,
      name: data.name,
      category: data.category,
      currentStock: data.currentStock,
      minStock: data.minStock,
      expiryDate: data.expiryDate || null,
      supplier: data.supplier || "",
      price: data.price || 0,
      cost: data.cost || 0,
      location: data.location || "",
      barcode: data.barcode || "",
      status,
    }

    // In a real app, this would be saved to a database
    // inventoryItems.push(newItem);

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
