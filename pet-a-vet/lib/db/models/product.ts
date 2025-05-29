import { query } from "../connection"
import type { Product } from "./interfaces"

export async function findProductById(productId: number): Promise<Product | null> {
  try {
    const products = await query<Product[]>("SELECT * FROM Product WHERE product_id = ?", [productId])
    return products.length > 0 ? products[0] : null
  } catch (error) {
    console.error("Error finding product by ID:", error)
    throw error
  }
}

export async function findProductsByCategory(category: string): Promise<Product[]> {
  try {
    // First get the category_id from the ProductCategory table
    const categories = await query<{ category_id: number }[]>(
      "SELECT category_id FROM ProductCategory WHERE name = ?",
      [category],
    )

    if (categories.length === 0) {
      return []
    }

    const categoryId = categories[0].category_id

    // Then get products with that category_id
    return await query<Product[]>('SELECT * FROM Product WHERE category_id = ? AND status = "ACTIVE" ORDER BY name', [
      categoryId,
    ])
  } catch (error) {
    console.error("Error finding products by category:", error)
    throw error
  }
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    return await query<Product[]>(
      'SELECT * FROM Product WHERE (name LIKE ? OR description LIKE ?) AND status = "ACTIVE" ORDER BY name',
      [`%${searchTerm}%`, `%${searchTerm}%`],
    )
  } catch (error) {
    console.error("Error searching products:", error)
    throw error
  }
}

export async function createProduct(productData: Omit<Product, "product_id">): Promise<number> {
  try {
    const result = await query<any>(
      `INSERT INTO Product (category_id, name, description, price, cost, image_url, stock_quantity, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productData.category_id,
        productData.name,
        productData.description || null,
        productData.price,
        productData.cost,
        productData.image_url || null,
        productData.stock_quantity || 0,
        productData.status,
      ],
    )

    return result.insertId
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(productId: number, productData: Partial<Product>): Promise<boolean> {
  try {
    // Build the SET part of the query dynamically
    const fields = Object.keys(productData)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(productData)

    if (fields.length === 0) {
      return false // Nothing to update
    }

    const result = await query<any>(`UPDATE Product SET ${fields} WHERE product_id = ?`, [...values, productId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(productId: number): Promise<boolean> {
  try {
    // In a real application, you might want to implement soft delete instead
    const result = await query<any>('UPDATE Product SET status = "DISCONTINUED" WHERE product_id = ?', [productId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function getAllProducts(limit?: number): Promise<Product[]> {
  try {
    let sql = 'SELECT * FROM Product WHERE status = "ACTIVE" ORDER BY name'

    if (limit) {
      sql += ` LIMIT ${limit}`
    }

    return await query<Product[]>(sql, [])
  } catch (error) {
    console.error("Error getting all products:", error)
    throw error
  }
}
