import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DbInitializer } from "@/components/db-initializer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DatabaseAdminPage() {
  const user = await getCurrentUser()

  // Check if user is authorized
  if (!user || user.role !== "administrator") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Database Administration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Database Connection Status</CardTitle>
          <CardDescription>Check the connection status to the MySQL database and initialize if needed</CardDescription>
        </CardHeader>
        <CardContent>
          <DbInitializer />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Schema</CardTitle>
          <CardDescription>The Pet-à-Vet database schema includes the following tables</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1">
            <li>User - Base user entity with authentication details</li>
            <li>Customer - Pet owners with subscription information</li>
            <li>Veterinarian - Doctors with specializations and availability</li>
            <li>Secretary - Administrative staff with department assignments</li>
            <li>PetGroomer - Grooming specialists with services offered</li>
            <li>Administrator - System administrators with access rights</li>
            <li>Pet - Pet profiles linked to owners</li>
            <li>MedicalRecord - Health records for pets</li>
            <li>Product - Inventory items, medications, and retail products</li>
            <li>Appointment - Scheduled visits for medical or grooming services</li>
            <li>Inventory - Stock management for products</li>
            <li>Cart - Shopping carts for customers</li>
            <li>Order - Completed purchases</li>
            <li>Subscription - Membership plans</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
