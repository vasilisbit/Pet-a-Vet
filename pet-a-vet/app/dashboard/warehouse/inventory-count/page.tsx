"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, CheckCircle, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function InventoryCountPage() {
  const router = useRouter()
  const [inventoryType, setInventoryType] = useState<"full" | "partial">("full")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [discrepancies, setDiscrepancies] = useState<any[]>([])

  // Mock inventory items
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: "Rabies Vaccine",
      category: "Vaccine",
      systemQuantity: 45,
      countedQuantity: null,
      unit: "vial",
      location: "Refrigerator 1",
      barcode: "VAC-RB-001",
      lastCounted: "2023-05-10",
    },
    {
      id: 2,
      name: "Antibiotics - Amoxicillin",
      category: "Medication",
      systemQuantity: 12,
      countedQuantity: null,
      unit: "bottle",
      location: "Cabinet 3, Shelf 2",
      barcode: "MED-AM-002",
      lastCounted: "2023-05-10",
    },
    {
      id: 3,
      name: "Flea & Tick Treatment",
      category: "Medication",
      systemQuantity: 32,
      countedQuantity: null,
      unit: "pack",
      location: "Cabinet 2, Shelf 1",
      barcode: "MED-FT-003",
      lastCounted: "2023-05-10",
    },
    {
      id: 4,
      name: "Surgical Gloves",
      category: "Equipment",
      systemQuantity: 150,
      countedQuantity: null,
      unit: "pair",
      location: "Storage Room, Bin 5",
      barcode: "EQ-SG-004",
      lastCounted: "2023-05-10",
    },
    {
      id: 5,
      name: "Distemper Vaccine",
      category: "Vaccine",
      systemQuantity: 28,
      countedQuantity: null,
      unit: "vial",
      location: "Refrigerator 1",
      barcode: "VAC-DT-005",
      lastCounted: "2023-05-10",
    },
    {
      id: 6,
      name: "Cat Food - Premium",
      category: "Food",
      systemQuantity: 15,
      countedQuantity: null,
      unit: "bag",
      location: "Storage Room, Shelf 3",
      barcode: "FD-CT-006",
      lastCounted: "2023-05-10",
    },
    {
      id: 7,
      name: "Dog Shampoo",
      category: "Grooming",
      systemQuantity: 22,
      countedQuantity: null,
      unit: "bottle",
      location: "Cabinet 4, Shelf 1",
      barcode: "GR-DS-007",
      lastCounted: "2023-05-10",
    },
  ])

  // Filter inventory items based on search query and category
  const filteredItems = inventoryItems.filter(
    (item) =>
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase()),
  )

  // Handle quantity change
  const handleQuantityChange = (id: number, value: string) => {
    const numValue = value === "" ? null : Number.parseInt(value)
    setInventoryItems(inventoryItems.map((item) => (item.id === id ? { ...item, countedQuantity: numValue } : item)))
  }

  // Calculate discrepancies
  const calculateDiscrepancies = () => {
    const discrepancyItems = inventoryItems
      .filter((item) => item.countedQuantity !== null && item.countedQuantity !== item.systemQuantity)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        systemQuantity: item.systemQuantity,
        countedQuantity: item.countedQuantity,
        difference: (item.countedQuantity || 0) - item.systemQuantity,
        unit: item.unit,
      }))

    setDiscrepancies(discrepancyItems)
    setIsConfirmDialogOpen(true)
  }

  // Complete inventory count
  const completeInventoryCount = () => {
    // In a real app, this would update the database with the new quantities
    setIsConfirmDialogOpen(false)
    setIsCompleted(true)
  }

  // Save inventory progress
  const saveInventoryProgress = () => {
    // In a real app, this would save the current progress without finalizing
    setIsSaveDialogOpen(false)
    // Show success message or redirect
  }

  // Return to warehouse management
  const returnToWarehouse = () => {
    router.push("/dashboard/warehouse")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={returnToWarehouse}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Inventory Count</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsSaveDialogOpen(true)} disabled={isCompleted}>
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
          <Button onClick={calculateDiscrepancies} disabled={isCompleted}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Count
          </Button>
        </div>
      </div>

      {isCompleted ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>Inventory count completed successfully. Discrepancies have been recorded.</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Count Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col space-y-2">
              <Label>Count Type</Label>
              <Tabs value={inventoryType} onValueChange={(value) => setInventoryType(value as "full" | "partial")}>
                <TabsList>
                  <TabsTrigger value="full">Full Inventory</TabsTrigger>
                  <TabsTrigger value="partial">Partial Inventory</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Count Date</Label>
              <div className="font-medium">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Count ID</Label>
              <div className="font-medium">INV-{new Date().toISOString().slice(0, 10)}-001</div>
            </div>
          </div>

          {inventoryType === "partial" && (
            <div className="flex items-center space-x-2">
              <Label>Category Filter:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vaccine">Vaccine</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setIsFilterOpen(true)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>System Qty</TableHead>
                <TableHead>Counted Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const difference = item.countedQuantity !== null ? item.countedQuantity - item.systemQuantity : null
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.barcode}</TableCell>
                    <TableCell>{item.systemQuantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.countedQuantity === null ? "" : item.countedQuantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-20"
                        disabled={isCompleted}
                      />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      {difference !== null && (
                        <Badge
                          variant="outline"
                          className={
                            difference === 0
                              ? "bg-green-50 text-green-700 border-green-200"
                              : difference > 0
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {difference > 0 ? "+" : ""}
                          {difference}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Inventory Count</DialogTitle>
            <DialogDescription>
              Please review the discrepancies before finalizing the inventory count.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {discrepancies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>System Qty</TableHead>
                    <TableHead>Counted Qty</TableHead>
                    <TableHead>Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discrepancies.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.systemQuantity}</TableCell>
                      <TableCell>{item.countedQuantity}</TableCell>
                      <TableCell
                        className={
                          item.difference === 0
                            ? "text-green-600"
                            : item.difference > 0
                              ? "text-blue-600"
                              : "text-red-600"
                        }
                      >
                        {item.difference > 0 ? "+" : ""}
                        {item.difference} {item.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4">No discrepancies found.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={completeInventoryCount}>Confirm and Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Progress Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Inventory Progress</DialogTitle>
            <DialogDescription>
              This will save your current progress without finalizing the inventory count.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveInventoryProgress}>Save Progress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
