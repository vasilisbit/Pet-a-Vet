"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FilterDialog } from "@/components/ui/filter-dialog"
import { ChevronLeft, ShoppingCart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for category information
const categoryData = {
  medications: {
    name: "Medications",
    description: "Prescription and over-the-counter medications for pets",
  },
  food: {
    name: "Food & Nutrition",
    description: "Premium pet food, supplements, and treats",
  },
  grooming: {
    name: "Grooming Supplies",
    description: "Shampoos, brushes, and grooming tools",
  },
  accessories: {
    name: "Accessories",
    description: "Collars, leashes, beds, and toys",
  },
  gifts: {
    name: "Pet Gifts",
    description: "Special items for your beloved pets",
  },
}

// Mock products data
const productsData = {
  medications: [
    {
      id: "med-1",
      name: "Flea & Tick Prevention",
      price: 29.99,
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=200&query=flea%20tick%20medicine",
      inStock: true,
      tags: ["dogs", "cats", "prevention"],
    },
    {
      id: "med-2",
      name: "Joint Support Supplement",
      price: 34.99,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=200&query=joint%20supplement",
      inStock: true,
      tags: ["dogs", "senior", "health"],
    },
    {
      id: "med-3",
      name: "Calming Aid Chews",
      price: 19.99,
      rating: 4.2,
      image: "/placeholder.svg?height=200&width=200&query=calming%20chews",
      inStock: true,
      tags: ["dogs", "anxiety", "behavioral"],
    },
    {
      id: "med-4",
      name: "Antibiotic Ointment",
      price: 12.99,
      rating: 4.0,
      image: "/placeholder.svg?height=200&width=200&query=antibiotic%20ointment",
      inStock: false,
      tags: ["dogs", "cats", "first aid"],
    },
    {
      id: "med-5",
      name: "Ear Cleaning Solution",
      price: 14.99,
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=200&query=ear%20cleaning%20solution",
      inStock: true,
      tags: ["dogs", "cats", "hygiene"],
    },
    {
      id: "med-6",
      name: "Heartworm Prevention",
      price: 39.99,
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=200&query=heartworm%20medicine",
      inStock: true,
      tags: ["dogs", "prevention", "health"],
    },
  ],
  food: [
    {
      id: "food-1",
      name: "Premium Dry Dog Food",
      price: 49.99,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=200&query=premium%20dog%20food",
      inStock: true,
      tags: ["dogs", "dry food", "adult"],
    },
    {
      id: "food-2",
      name: "Grain-Free Cat Food",
      price: 32.99,
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=200&query=grain%20free%20cat%20food",
      inStock: true,
      tags: ["cats", "grain-free", "adult"],
    },
    // More food products...
  ],
  // More categories with their products...
}

// Filter options for the filter dialog
const filterGroups = [
  {
    id: "pet-type",
    label: "Pet Type",
    type: "multi-select",
    options: [
      { id: "dogs", label: "Dogs", value: "dogs" },
      { id: "cats", label: "Cats", value: "cats" },
      { id: "birds", label: "Birds", value: "birds" },
      { id: "small-pets", label: "Small Pets", value: "small-pets" },
    ],
    value: [],
  },
  {
    id: "price-range",
    label: "Price Range",
    type: "single-select",
    options: [
      { id: "under-25", label: "Under $25", value: "under-25" },
      { id: "25-50", label: "$25 - $50", value: "25-50" },
      { id: "50-100", label: "$50 - $100", value: "50-100" },
      { id: "over-100", label: "Over $100", value: "over-100" },
    ],
    value: "any",
  },
  {
    id: "availability",
    label: "Availability",
    type: "single-select",
    options: [
      { id: "in-stock", label: "In Stock", value: "in-stock" },
      { id: "out-of-stock", label: "Out of Stock", value: "out-of-stock" },
    ],
    value: "any",
  },
]

const sortOptions = [
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Rating" },
  { id: "newest", label: "Newest" },
]

export default function CategoryPage({ params }: { params: { categoryId: string } }) {
  const { categoryId } = params
  const category = categoryData[categoryId as keyof typeof categoryData]
  const products = productsData[categoryId as keyof typeof productsData] || []

  if (!category) {
    return <div>Category not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/store" className="flex items-center text-teal-600 hover:text-teal-700 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Categories
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-gray-600 mt-2">{category.description}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Filter Products</h2>
              <FilterDialog
                filterGroups={filterGroups}
                sortOptions={sortOptions}
                onFilterChange={() => {}}
                onSortChange={() => {}}
                onReset={() => {}}
                buttonLabel="Filter & Sort"
              />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link href={`/store/product/${product.id}`} key={product.id}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative p-4">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-contain mb-4"
                    />
                    {!product.inStock && (
                      <Badge variant="destructive" className="absolute top-6 right-6">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={!product.inStock}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
