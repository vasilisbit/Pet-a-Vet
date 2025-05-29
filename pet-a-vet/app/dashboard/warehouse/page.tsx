"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  AlertTriangle,
  Package2,
  TrendingDown,
  ShoppingCart,
  ClipboardList,
  Truck,
  BarChart2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

export default function WarehousePage() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Mock data for inventory items
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
      status: "normal",
    },
  ]

  // Mock data for alerts
  const alerts = [
    {
      id: 1,
      type: "low-stock",
      item: "Antibiotics - Amoxicillin",
      message: "Stock below minimum threshold (12/15)",
      date: "2023-06-05",
    },
    {
      id: 2,
      type: "expiring",
      item: "Flea & Tick Treatment",
      message: "Expiring soon (08/22/2023)",
      date: "2023-06-04",
    },
    {
      id: 3,
      type: "order",
      item: "Surgical Masks",
      message: "Order #12345 delivered",
      date: "2023-06-03",
    },
  ]

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      action: "Stock Added",
      item: "Rabies Vaccine",
      quantity: 20,
      user: "Dr. Smith",
      date: "2023-06-05 14:30",
    },
    {
      id: 2,
      action: "Stock Removed",
      item: "Antibiotics - Amoxicillin",
      quantity: 3,
      user: "Dr. Johnson",
      date: "2023-06-05 11:15",
    },
    {
      id: 3,
      action: "Order Placed",
      item: "Surgical Gloves",
      quantity: 100,
      user: "Admin",
      date: "2023-06-04 16:45",
    },
  ]

  // Filter inventory items based on search query
  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Navigate to inventory count page
  const navigateToInventoryCount = () => {
    router.push("/dashboard/warehouse/inventory-count")
  }

  // Navigate to orders page
  const navigateToOrders = () => {
    router.push("/dashboard/warehouse/orders")
  }

  // Navigate to reports page
  const navigateToReports = () => {
    router.push("/dashboard/warehouse/reports")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Warehouse Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={navigateToInventoryCount}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Perform Inventory
          </Button>
          <Button variant="outline" onClick={navigateToOrders}>
            <Truck className="mr-2 h-4 w-4" />
            Manage Orders
          </Button>
          <Button variant="outline" onClick={navigateToReports}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Inventory Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>Enter the details of the new inventory item.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Item Name
                  </Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccine">Vaccine</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="grooming">Grooming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input id="quantity" type="number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="min-stock" className="text-right">
                    Min Stock
                  </Label>
                  <Input id="min-stock" type="number" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry" className="text-right">
                    Expiry Date
                  </Label>
                  <Input id="expiry" type="date" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">
                    Supplier
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medvet">MedVet Supplies</SelectItem>
                      <SelectItem value="pharmavet">PharmaVet</SelectItem>
                      <SelectItem value="pethealth">PetHealth Inc.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price ($)
                  </Label>
                  <Input id="price" type="number" step="0.01" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right">
                    Cost ($)
                  </Label>
                  <Input id="cost" type="number" step="0.01" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Storage Location
                  </Label>
                  <Input id="location" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="barcode" className="text-right">
                    Barcode
                  </Label>
                  <Input id="barcode" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddItemOpen(false)}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(inventoryItems.map((item) => item.category)).size} categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.filter((item) => item.status === "low").length}</div>
            <p className="text-xs text-muted-foreground">Items below minimum threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryItems.filter((item) => item.status === "expiring").length}
            </div>
            <p className="text-xs text-muted-foreground">Items expiring within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4 mt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vaccine">Vaccine</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="grooming">Grooming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.currentStock} units</span>
                            <span className="text-gray-500">Min: {item.minStock}</span>
                          </div>
                          <Progress
                            value={(item.currentStock / Math.max(item.minStock * 2, 1)) * 100}
                            className={`h-2 ${
                              item.status === "low"
                                ? "bg-red-200"
                                : item.status === "expiring"
                                  ? "bg-amber-200"
                                  : "bg-gray-200"
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{item.expiryDate}</TableCell>
                      <TableCell>
                        {item.status === "low" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Low Stock
                          </Badge>
                        )}
                        {item.status === "expiring" && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Expiring Soon
                          </Badge>
                        )}
                        {item.status === "normal" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Set the selected item for editing
                              const itemToEdit = item
                              // Here you would typically open a dialog to edit the item
                              // For now, we'll just show a toast
                              toast({
                                title: "Edit Item",
                                description: `Editing ${item.name}`,
                              })
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-teal-600"
                            onClick={() => {
                              // Add item to cart
                              // For now, we'll just show a toast
                              toast({
                                title: "Added to Cart",
                                description: `${item.name} added to cart`,
                              })
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4 mt-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4 flex items-start">
                  {alert.type === "low-stock" && <TrendingDown className="h-5 w-5 text-red-500 mr-4 mt-0.5" />}
                  {alert.type === "expiring" && <AlertTriangle className="h-5 w-5 text-amber-500 mr-4 mt-0.5" />}
                  {alert.type === "order" && <Package2 className="h-5 w-5 text-teal-500 mr-4 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium">{alert.item}</p>
                    <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.date}</p>
                  </div>
                  <Button size="sm">Take Action</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.action}</TableCell>
                      <TableCell>{activity.item}</TableCell>
                      <TableCell>{activity.quantity}</TableCell>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
