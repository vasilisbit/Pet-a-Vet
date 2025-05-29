import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, Pill, Scissors, Utensils, Gift, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock categories for the store
const categories = [
  {
    id: "medications",
    name: "Medications",
    description: "Prescription and over-the-counter medications for pets",
    icon: <Pill className="h-8 w-8 text-teal-600" />,
    image: "/pet-medications.png",
  },
  {
    id: "food",
    name: "Food & Nutrition",
    description: "Premium pet food, supplements, and treats",
    icon: <Utensils className="h-8 w-8 text-teal-600" />,
    image: "/placeholder.svg?height=200&width=300&query=pet%20food",
  },
  {
    id: "grooming",
    name: "Grooming Supplies",
    description: "Shampoos, brushes, and grooming tools",
    icon: <Scissors className="h-8 w-8 text-teal-600" />,
    image: "/placeholder.svg?height=200&width=300&query=pet%20grooming",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Collars, leashes, beds, and toys",
    icon: <PawPrint className="h-8 w-8 text-teal-600" />,
    image: "/placeholder.svg?height=200&width=300&query=pet%20accessories",
  },
  {
    id: "gifts",
    name: "Pet Gifts",
    description: "Special items for your beloved pets",
    icon: <Gift className="h-8 w-8 text-teal-600" />,
    image: "/placeholder.svg?height=200&width=300&query=pet%20gifts",
  },
]

export default function StorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pet Store</h1>
          <p className="text-gray-600 mt-2">Browse our selection of premium pet products and supplies</p>
        </div>
        <div className="mt-4 md:mt-0 relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input type="search" placeholder="Search products..." className="pl-10 w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link href={`/store/category/${category.id}`} key={category.id}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {category.icon}
                  <CardTitle>{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Browse Products
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-teal-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">Need Veterinary Supplies?</h2>
            <p className="text-gray-600 mt-2">We offer special discounts for veterinary clinics and professionals.</p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700">Contact for Wholesale</Button>
        </div>
      </div>
    </div>
  )
}
