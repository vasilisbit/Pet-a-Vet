"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Calendar,
  PawPrint,
  ShoppingCart,
  FileText,
  BarChart3,
  Package,
  Scissors,
  Stethoscope,
  Shield,
} from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
  permissions: Record<string, boolean>
}

interface DashboardProps {
  user: User
}

export function RoleBasedDashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<Record<string, number>>({})

  useEffect(() => {
    // Fetch role-specific statistics
    fetchStats()
  }, [user.role])

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?role=${user.role}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMINISTRATOR":
        return <Shield className="h-6 w-6" />
      case "VETERINARIAN":
        return <Stethoscope className="h-6 w-6" />
      case "SECRETARY":
        return <FileText className="h-6 w-6" />
      case "PETGROOMER":
        return <Scissors className="h-6 w-6" />
      case "CUSTOMER":
        return <PawPrint className="h-6 w-6" />
      default:
        return <Users className="h-6 w-6" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMINISTRATOR":
        return "bg-red-100 text-red-800"
      case "VETERINARIAN":
        return "bg-blue-100 text-blue-800"
      case "SECRETARY":
        return "bg-green-100 text-green-800"
      case "PETGROOMER":
        return "bg-purple-100 text-purple-800"
      case "CUSTOMER":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderCustomerDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Pets</CardTitle>
          <PawPrint className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pets || 0}</div>
          <p className="text-xs text-muted-foreground">Registered pets</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">Next 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentOrders || 0}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderStaffDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">Scheduled for today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <PawPrint className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPets || 0}</div>
          <p className="text-xs text-muted-foreground">Active pets</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCustomers || 0}</div>
          <p className="text-xs text-muted-foreground">Registered customers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.monthlyRevenue || 0}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">All system users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inventoryItems || 0}</div>
          <p className="text-xs text-muted-foreground">Products in stock</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.monthlyOrders || 0}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Good</div>
          <p className="text-xs text-muted-foreground">All systems operational</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* User Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user.role)}
                <div>
                  <CardTitle>Welcome back, {user.name}!</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Badge className={getRoleColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Role-specific Dashboard Content */}
      {user.role.toUpperCase() === "CUSTOMER" && renderCustomerDashboard()}
      {["VETERINARIAN", "SECRETARY", "PETGROOMER"].includes(user.role.toUpperCase()) && renderStaffDashboard()}
      {user.role.toUpperCase() === "ADMINISTRATOR" && renderAdminDashboard()}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.role.toUpperCase() === "CUSTOMER" && (
              <>
                <Button variant="outline" size="sm">
                  <PawPrint className="mr-2 h-4 w-4" />
                  Add Pet
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Shop Products
                </Button>
              </>
            )}

            {["VETERINARIAN", "SECRETARY"].includes(user.role.toUpperCase()) && (
              <>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <PawPrint className="mr-2 h-4 w-4" />
                  Patient Records
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Customer List
                </Button>
              </>
            )}

            {user.role.toUpperCase() === "PETGROOMER" && (
              <>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Grooming Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <Scissors className="mr-2 h-4 w-4" />
                  Service History
                </Button>
              </>
            )}

            {user.role.toUpperCase() === "ADMINISTRATOR" && (
              <>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  User Management
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="mr-2 h-4 w-4" />
                  Inventory
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
