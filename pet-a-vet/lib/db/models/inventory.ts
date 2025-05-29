import { query } from "../connection"
import type { Inventory } from "./interfaces"

export async function findInventoryByProductId(productId: number): Promise<Inventory | null> {
  try {
    const inventoryItems = await query<Inventory[]>("SELECT * FROM Inventory WHERE product_id = ?", [productId])
    return inventoryItems.length > 0 ? inventoryItems[0] : null
  } catch (error) {
    console.error("Error finding inventory by product ID:", error)
    throw error
  }
}

export async function findLowStockItems(): Promise<Inventory[]> {
  try {
    return await query<Inventory[]>(
      "SELECT i.*, p.name as product_name FROM Inventory i JOIN Product p ON i.product_id = p.product_id WHERE i.quantity_in_stock_registered <= i.min_stock_level",
    )
  } catch (error) {
    console.error("Error finding low stock items:", error)
    throw error
  }
}

export async function findExpiringItems(daysThreshold = 30): Promise<Inventory[]> {
  try {
    return await query<Inventory[]>(
      "SELECT i.*, p.name as product_name FROM Inventory i JOIN Product p ON i.product_id = p.product_id WHERE i.expiry_date IS NOT NULL AND i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)",
      [daysThreshold],
    )
  } catch (error) {
    console.error("Error finding expiring items:", error)
    throw error
  }
}

export async function updateInventoryQuantity(productId: number, quantityChange: number): Promise<boolean> {
  try {
    const result = await query<any>(
      "UPDATE Inventory SET quantity_in_stock_registered = quantity_in_stock_registered + ? WHERE product_id = ?",
      [quantityChange, productId],
    )

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating inventory quantity:", error)
    throw error
  }
}

export async function updateRealQuantity(productId: number, realQuantity: number): Promise<boolean> {
  try {
    const result = await query<any>(
      "UPDATE Inventory SET real_quantity_stock = ?, last_count_date = CURDATE() WHERE product_id = ?",
      [realQuantity, productId],
    )

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating real quantity:", error)
    throw error
  }
}

export async function createInventoryItem(
  inventoryData: Omit<Inventory, "inventory_id" | "last_updated">,
): Promise<number> {
  try {
    const result = await query<any>(
      `INSERT INTO Inventory (product_id, quantity_in_stock_registered, real_quantity_stock, min_stock_level, max_stock_level, location, last_count_date, expiry_date, lot_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inventoryData.product_id,
        inventoryData.quantity_in_stock_registered,
        inventoryData.real_quantity_stock,
        inventoryData.min_stock_level,
        inventoryData.max_stock_level,
        inventoryData.location || null,
        inventoryData.last_count_date || null,
        inventoryData.expiry_date || null,
        inventoryData.lot_number || null,
      ],
    )

    return result.insertId
  } catch (error) {
    console.error("Error creating inventory item:", error)
    throw error
  }
}

export async function updateInventoryItem(inventoryId: number, inventoryData: Partial<Inventory>): Promise<boolean> {
  try {
    // Build the SET part of the query dynamically
    const fields = Object.keys(inventoryData)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(inventoryData)

    if (fields.length === 0) {
      return false // Nothing to update
    }

    const result = await query<any>(`UPDATE Inventory SET ${fields} WHERE inventory_id = ?`, [...values, inventoryId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating inventory item:", error)
    throw error
  }
}
