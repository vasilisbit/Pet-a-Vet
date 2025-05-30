"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { MarketplaceHeader } from "@/components/marketplace-header"

// Mock search results
const allProducts = [
  {
    id: "med-1",
    name: "Flea & Tick Prevention",
    price: 29.99,
    rating: 4.5,
    image: "/placeholder-l2kce.png",
    inStock: true,
    category: "medications",
  },
  {
    id: "med-2",
    name: "Joint Supplement",
    price: 34.99,
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300&query=joint%20supplement%20for%20dogs",
    inStock: true,
    category: "medications",
  },
  {
    id: "food-1",
    name: "Premium Dry Dog Food",
    price: 49.99,
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300&query=premium%20dog%20food",
    inStock: true,
    category: "food",
  },
  {
    id: "groom-3",
    name: "Oatmeal Shampoo",
    price: 14.99,
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300&query=pet%20shampoo",
    inStock: true,
    category: "grooming",
  },
  {
    id: "acc-1",
    name: "Adjustable Collar",
    price: 14.99,
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=300&query=dog%20collar",
    inStock: true,
    category: "accessories",
  },
  {
    id: "gift-1",
    name: "Birthday Gift Box",
    price: 34.99,
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300&query=pet%20birthday%20gift",
    inStock: true,
    category: "gifts",
  },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  // Filter products based on search query
  const searchResults = allProducts.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <MarketplaceHeader title={`Search Results: "${query}"`} description={`${searchResults.length} products found`} />

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {searchResults.map((product) => (
            <Link href={`/dashboard/marketplace/product/${product.id}`} key={product.id}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  {!product.inStock && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 mb-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <div className="text-xl font-bold">${product.price.toFixed(2)}</div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={product.inStock ? "default" : "outline"}
                    className="w-full"
                    disabled={!product.inStock}
                  >
                    {product.inStock ? "Add to Cart" : "Notify Me"}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">We couldn't find any products matching your search.</p>
          <Link href="/dashboard/marketplace">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
