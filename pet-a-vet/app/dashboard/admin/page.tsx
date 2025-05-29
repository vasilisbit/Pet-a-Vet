"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Calendar, BarChart3, Database, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { isAdmin } from "@/lib/auth-utils"

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (!user) {
          setError("Please log in to view the admin dashboard")
          return
        }

        // Check if user is admin
        if (!isAdmin(user.role)) {
          setError("You do not have permission to access this page")
          return
        }
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err)
        setError("Failed to load admin dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome, {currentUser?.name || "Administrator"}! Manage your veterinary clinic.
          </p>
        </div>
      </div>

      <Tabs defaultValue="system">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <p>All systems operational</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Server Load</CardTitle>
                <CardDescription>Current server performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>CPU</span>
                    <span>23%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-teal-500 rounded-full" style={{ width: "23%" }}></div>
                  </div>

                  <div className="flex justify-between">
                    <span>Memory</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-teal-500 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Storage</CardTitle>
                <CardDescription>Database storage usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Used</span>
                    <span>1.2 GB / 10 GB</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-teal-500 rounded-full" style={{ width: "12%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/dashboard/admin/database">
                  <Database className="h-6 w-6" />
                  <span>Database</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/dashboard/customers">
                  <Users className="h-6 w-6" />
                  <span>Customers</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/dashboard/appointments">
                  <Calendar className="h-6 w-6" />
                  <span>Appointments</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/dashboard/reports">
                  <BarChart3 className="h-6 w-6" />
                  <span>Reports</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/dashboard/admin/users">Manage Users</Link>
                </Button>
                <p className="text-sm text-gray-500">
                  Add, edit, or deactivate user accounts. Manage roles and permissions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Manage database operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/dashboard/admin/database">Database Administration</Link>
                </Button>
                <p className="text-sm text-gray-500">Initialize database, run migrations, or perform backups.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage system security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/dashboard/admin/security">Security Settings</Link>
                </Button>
                <p className="text-sm text-gray-500">
                  Configure authentication settings, password policies, and access controls.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
