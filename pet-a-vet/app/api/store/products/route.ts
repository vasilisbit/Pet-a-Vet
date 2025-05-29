import { NextResponse } from "next/server"
import * as productModel from "@/lib/db/models/product"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const id = searchParams.get("id")
    const featured = searchParams.get("featured")

    if (id) {
      // Get product by ID
      const product = await productModel.findProductById(Number.parseInt(id))
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      return NextResponse.json(product)
    } else if (category) {
      // Get products by category
      const products = await productModel.findProductsByCategory(category)
      return NextResponse.json({ products })
    } else if (search) {
      // Search products
      const products = await productModel.searchProducts(search)
      return NextResponse.json({ products })
    } else if (featured) {
      // Get featured products (for now, just return some products)
      const products = await productModel.getAllProducts(8) // Limit to 8 products
      return NextResponse.json({ products })
    } else {
      // Get all products
      const products = await productModel.getAllProducts()
      return NextResponse.json({ products })
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
