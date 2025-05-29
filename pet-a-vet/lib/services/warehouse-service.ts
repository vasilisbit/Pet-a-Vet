// Warehouse service for handling API calls

export interface InventoryItem {
  id: number
  name: string
  category: string
  currentStock: number
  minStock: number
  expiryDate: string
  supplier: string
  price: number
  cost: number
  location?: string
  barcode?: string
  status: "normal" | "low" | "expiring"
}

export interface Order {
  id: string
  supplier: string
  orderDate: string
  expectedDelivery: string
  status: "pending" | "shipped" | "delivered" | "completed"
  totalItems: number
  totalCost: number
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  name: string
  quantity: number
  unit: string
  price: number
}

export interface InventoryCount {
  id: string
  countDate: string
  countType: "full" | "partial"
  status: "in-progress" | "completed"
  items: InventoryCountItem[]
  discrepancies: number
}

export interface InventoryCountItem {
  id: number
  name: string
  category: string
  systemQuantity: number
  countedQuantity: number | null
  unit: string
  location?: string
  barcode?: string
}

// Get all inventory items with optional filters
export async function getInventoryItems(search?: string, category?: string, status?: string): Promise<InventoryItem[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (category) params.append("category", category)
    if (status) params.append("status", status)

    const response = await fetch(`/api/warehouse/inventory?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Failed to fetch inventory items")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching inventory items:", error)
    return []
  }
}

// Get inventory item by ID
export async function getInventoryItemById(id: number): Promise<InventoryItem | null> {
  try {
    const response = await fetch(`/api/warehouse/inventory/${id}`)

    if (!response.ok) {
      throw new Error("Failed to fetch inventory item")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return null
  }
}

// Create new inventory item
export async function createInventoryItem(data: Omit<InventoryItem, "id" | "status">): Promise<InventoryItem | null> {
  try {
    const response = await fetch("/api/warehouse/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create inventory item")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating inventory item:", error)
    return null
  }
}

// Update inventory item
export async function updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
  try {
    const response = await fetch(`/api/warehouse/inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update inventory item")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return null
  }
}

// Get all orders with optional filters
export async function getOrders(search?: string, status?: string, supplier?: string): Promise<Order[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (status) params.append("status", status)
    if (supplier) params.append("supplier", supplier)

    const response = await fetch(`/api/warehouse/orders?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

// Create new order
export async function createOrder(data: Omit<Order, "id" | "status">): Promise<Order | null> {
  try {
    const response = await fetch("/api/warehouse/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create order")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating order:", error)
    return null
  }
}

// Update order status
export async function updateOrderStatus(
  id: string,
  status: "pending" | "shipped" | "delivered" | "completed",
): Promise<Order | null> {
  try {
    const response = await fetch(`/api/warehouse/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error("Failed to update order status")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating order status:", error)
    return null
  }
}

// Receive order
export async function receiveOrder(
  id: string,
  receivedItems: { id: number; receivedQuantity: number; expiryDate?: string }[],
): Promise<Order | null> {
  try {
    const response = await fetch(`/api/warehouse/orders/${id}/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ receivedItems }),
    })

    if (!response.ok) {
      throw new Error("Failed to receive order")
    }

    return await response.json()
  } catch (error) {
    console.error("Error receiving order:", error)
    return null
  }
}

// Create inventory count
export async function createInventoryCount(
  countType: "full" | "partial",
  categoryFilter?: string,
): Promise<InventoryCount | null> {
  try {
    const response = await fetch("/api/warehouse/inventory-count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ countType, categoryFilter }),
    })

    if (!response.ok) {
      throw new Error("Failed to create inventory count")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating inventory count:", error)
    return null
  }
}

// Save inventory count progress
export async function saveInventoryCountProgress(
  id: string,
  items: { id: number; countedQuantity: number | null }[],
): Promise<InventoryCount | null> {
  try {
    const response = await fetch(`/api/warehouse/inventory-count/${id}/save`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    })

    if (!response.ok) {
      throw new Error("Failed to save inventory count progress")
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving inventory count progress:", error)
    return null
  }
}

// Complete inventory count
export async function completeInventoryCount(
  id: string,
  items: { id: number; countedQuantity: number }[],
): Promise<InventoryCount | null> {
  try {
    const response = await fetch(`/api/warehouse/inventory-count/${id}/complete`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    })

    if (!response.ok) {
      throw new Error("Failed to complete inventory count")
    }

    return await response.json()
  } catch (error) {
    console.error("Error completing inventory count:", error)
    return null
  }
}

// Get warehouse reports
export async function getWarehouseReports(
  reportType: "inventory" | "movement" | "expiring" | "topMoving",
  dateRange: "last30days" | "last90days" | "lastYear" | "custom",
  startDate?: string,
  endDate?: string,
): Promise<any> {
  try {
    const params = new URLSearchParams()
    params.append("reportType", reportType)
    params.append("dateRange", dateRange)
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    const response = await fetch(`/api/warehouse/reports?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Failed to fetch warehouse reports")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching warehouse reports:", error)
    return null
  }
}
