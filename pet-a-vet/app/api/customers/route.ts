import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import * as customerModel from "@/lib/db/models/customer"
import * as userModel from "@/lib/db/models/user"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const sortBy = searchParams.get("sortBy") || "full_name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // Get all customers from database
    const customers = await customerModel.getAllCustomers()

    let filteredCustomers = customers

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCustomers = filteredCustomers.filter(
        (customer) =>
          customer.full_name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.phone.includes(search),
      )
    }

    // Apply status filter
    if (status) {
      filteredCustomers = filteredCustomers.filter((customer) => customer.status === status)
    }

    // Apply sorting
    filteredCustomers.sort((a, b) => {
      let comparison = 0

      if (sortBy === "full_name") {
        comparison = a.full_name.localeCompare(b.full_name)
      } else if (sortBy === "created_at") {
        // Handle date comparison safely
        const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at)
        const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at)
        comparison = dateA.getTime() - dateB.getTime()
      } else if (sortBy === "email") {
        comparison = a.email.localeCompare(b.email)
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    // Transform data for frontend
    const transformedCustomers = filteredCustomers.map((customer) => {
      // Format dates safely
      const formatDate = (date: string | Date | null) => {
        if (!date) return "-"
        try {
          const d = date instanceof Date ? date : new Date(date)
          return d.toISOString().split("T")[0]
        } catch (e) {
          return "-"
        }
      }

      return {
        id: customer.customer_id.toString(),
        name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        registrationDate: formatDate(customer.created_at),
        lastVisit: formatDate(customer.last_login),
        status: customer.status.toLowerCase(),
        pets: 0, // TODO: Count pets for this customer
        totalSpent: 0, // TODO: Calculate total spent
      }
    })

    return NextResponse.json(transformedCustomers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if customer with this email already exists
    const existingUser = await userModel.findUserByEmail(data.email)
    if (existingUser) {
      return NextResponse.json({ error: "Customer with this email already exists" }, { status: 400 })
    }

    // Create username from email
    const username = data.email.split("@")[0]

    // Format address
    const fullAddress = [data.address, data.city, data.state, data.postalCode].filter(Boolean).join(", ")

    // Create user first
    const userId = await userModel.createUser({
      username,
      password: "defaultPassword123", // In a real app, you'd generate a temporary password
      email: data.email,
      full_name: data.name,
      phone: data.phone || "",
      address: fullAddress,
      role: "CUSTOMER",
    })

    // Create customer record
    await customerModel.createCustomer(userId)

    // Get the created customer
    const newCustomer = await customerModel.getCustomerByUserId(userId)

    if (!newCustomer) {
      throw new Error("Failed to create customer")
    }

    // Format dates safely
    const formatDate = (date: string | Date | null) => {
      if (!date) return "-"
      try {
        const d = date instanceof Date ? date : new Date(date)
        return d.toISOString().split("T")[0]
      } catch (e) {
        return "-"
      }
    }

    // Transform data for frontend
    const transformedCustomer = {
      id: newCustomer.customer_id.toString(),
      name: newCustomer.full_name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      registrationDate: formatDate(newCustomer.created_at),
      lastVisit: "-",
      status: newCustomer.status.toLowerCase(),
      pets: 0,
      totalSpent: 0,
    }

    return NextResponse.json(transformedCustomer, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.id || !data.name || !data.email) {
      return NextResponse.json({ error: "ID, name, and email are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Get customer
    const customer = await customerModel.getCustomerById(Number.parseInt(data.id))
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Format address
    const fullAddress = [data.address, data.city, data.state, data.postalCode].filter(Boolean).join(", ")

    // Update user data
    await userModel.updateUser(customer.user_id, {
      full_name: data.name,
      email: data.email,
      phone: data.phone || customer.phone,
      address: fullAddress,
    })

    // Get updated customer
    const updatedCustomer = await customerModel.getCustomerById(Number.parseInt(data.id))

    if (!updatedCustomer) {
      throw new Error("Failed to get updated customer")
    }

    // Format dates safely
    const formatDate = (date: string | Date | null) => {
      if (!date) return "-"
      try {
        const d = date instanceof Date ? date : new Date(date)
        return d.toISOString().split("T")[0]
      } catch (e) {
        return "-"
      }
    }

    // Transform data for frontend
    const transformedCustomer = {
      id: updatedCustomer.customer_id.toString(),
      name: updatedCustomer.full_name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      address: updatedCustomer.address,
      registrationDate: formatDate(updatedCustomer.created_at),
      lastVisit: formatDate(updatedCustomer.last_login),
      status: updatedCustomer.status.toLowerCase(),
      pets: 0,
      totalSpent: 0,
    }

    return NextResponse.json(transformedCustomer)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
  }

  try {
    // Get customer
    const customer = await customerModel.getCustomerById(Number.parseInt(id))
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Deactivate user instead of deleting
    await userModel.deactivateUser(customer.user_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}
