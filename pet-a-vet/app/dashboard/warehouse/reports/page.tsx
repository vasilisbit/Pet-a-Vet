"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, TrendingDown, Calendar, DollarSign } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function WarehouseReportsPage() {
  const router = useRouter()
  const [reportType, setReportType] = useState("inventory")
  const [dateRange, setDateRange] = useState("last30days")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Return to warehouse management
  const returnToWarehouse = () => {
    router.push("/dashboard/warehouse")
  }

  // Mock inventory summary data
  const inventorySummary = [
    { category: "Vaccine", itemCount: 5, totalValue: 2450.75, lowStockItems: 0, expiringItems: 1 },
    { category: "Medication", itemCount: 12, totalValue: 3275.5, lowStockItems: 2, expiringItems: 3 },
    { category: "Equipment", itemCount: 8, totalValue: 1850.25, lowStockItems: 1, expiringItems: 0 },
    { category: "Supplies", itemCount: 15, totalValue: 980.0, lowStockItems: 3, expiringItems: 0 },
    { category: "Food", itemCount: 6, totalValue: 1200.5, lowStockItems: 0, expiringItems: 2 },
    { category: "Grooming", itemCount: 4, totalValue: 450.75, lowStockItems: 0, expiringItems: 0 },
  ]

  // Mock inventory movement data
  const inventoryMovement = [
    { month: "January", received: 45, consumed: 38, adjusted: -2 },
    { month: "February", received: 52, consumed: 45, adjusted: 0 },
    { month: "March", received: 38, consumed: 42, adjusted: -1 },
    { month: "April", received: 65, consumed: 50, adjusted: -3 },
    { month: "May", received: 48, consumed: 52, adjusted: 1 },
    { month: "June", received: 55, consumed: 48, adjusted: 0 },
  ]

  // Mock top moving items
  const topMovingItems = [
    { name: "Rabies Vaccine", category: "Vaccine", consumed: 120, value: 3118.8 },
    { name: "Antibiotics - Amoxicillin", category: "Medication", consumed: 85, value: 1572.5 },
    { name: "Flea & Tick Treatment", category: "Medication", consumed: 78, value: 2788.5 },
    { name: "Surgical Gloves", category: "Equipment", consumed: 450, value: 4045.5 },
    { name: "Cat Food - Premium", category: "Food", consumed: 65, value: 1950.0 },
  ]

  // Mock expiring items
  const expiringItems = [
    { name: "Rabies Vaccine", category: "Vaccine", quantity: 10, expiryDate: "2023-08-15", value: 259.9 },
    { name: "Flea & Tick Treatment", category: "Medication", quantity: 15, expiryDate: "2023-08-22", value: 536.25 },
    { name: "Dog Food - Prescription", category: "Food", quantity: 8, expiryDate: "2023-09-05", value: 320.0 },
    { name: "Antibiotics - Cephalexin", category: "Medication", quantity: 5, expiryDate: "2023-09-10", value: 125.5 },
    { name: "Cat Food - Urinary Care", category: "Food", quantity: 6, expiryDate: "2023-09-18", value: 210.0 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={returnToWarehouse}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Warehouse Reports</h1>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventory Summary</SelectItem>
              <SelectItem value="movement">Inventory Movement</SelectItem>
              <SelectItem value="expiring">Expiring Items</SelectItem>
              <SelectItem value="topMoving">Top Moving Items</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex items-center space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {dateRange === "custom" && (
              <>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
                <span>to</span>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${inventorySummary.reduce((total, item) => total + item.totalValue, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {inventorySummary.reduce((total, item) => total + item.itemCount, 0)} items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventorySummary.reduce((total, item) => total + item.lowStockItems, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Items below minimum threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventorySummary.reduce((total, item) => total + item.expiringItems, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Items expiring within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {reportType === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Summary by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Item Count</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Low Stock Items</TableHead>
                  <TableHead>Expiring Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventorySummary.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell>{item.itemCount}</TableCell>
                    <TableCell>${item.totalValue.toFixed(2)}</TableCell>
                    <TableCell>{item.lowStockItems}</TableCell>
                    <TableCell>{item.expiringItems}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>{inventorySummary.reduce((total, item) => total + item.itemCount, 0)}</TableCell>
                  <TableCell>
                    ${inventorySummary.reduce((total, item) => total + item.totalValue, 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{inventorySummary.reduce((total, item) => total + item.lowStockItems, 0)}</TableCell>
                  <TableCell>{inventorySummary.reduce((total, item) => total + item.expiringItems, 0)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "movement" && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Consumed</TableHead>
                  <TableHead>Adjusted</TableHead>
                  <TableHead>Net Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryMovement.map((item) => (
                  <TableRow key={item.month}>
                    <TableCell className="font-medium">{item.month}</TableCell>
                    <TableCell>{item.received}</TableCell>
                    <TableCell>{item.consumed}</TableCell>
                    <TableCell>{item.adjusted}</TableCell>
                    <TableCell
                      className={item.received - item.consumed + item.adjusted > 0 ? "text-green-600" : "text-red-600"}
                    >
                      {item.received - item.consumed + item.adjusted > 0 ? "+" : ""}
                      {item.received - item.consumed + item.adjusted}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "topMoving" && (
        <Card>
          <CardHeader>
            <CardTitle>Top Moving Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Consumed</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMovingItems.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.consumed}</TableCell>
                    <TableCell>${item.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "expiring" && (
        <Card>
          <CardHeader>
            <CardTitle>Expiring Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringItems.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                    <TableCell>${item.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell>{expiringItems.reduce((total, item) => total + item.quantity, 0)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell>${expiringItems.reduce((total, item) => total + item.value, 0).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
