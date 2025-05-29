// Customer service for handling API calls

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  registrationDate: string
  lastVisit: string
  status: string
  pets: number
  totalSpent: number
}

export interface CustomerFormData {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
}

// Get all customers with optional filters
export async function getCustomers(
  search?: string,
  status?: string,
  sortBy?: string,
  sortOrder?: string,
): Promise<Customer[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (status) params.append("status", status)
    if (sortBy) params.append("sortBy", sortBy)
    if (sortOrder) params.append("sortOrder", sortOrder)

    const response = await fetch(`/api/customers?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Failed to fetch customers")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const response = await fetch(`/api/customers/${id}`)

    if (!response.ok) {
      throw new Error("Failed to fetch customer")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

// Create new customer
export async function createCustomer(data: CustomerFormData): Promise<Customer | null> {
  try {
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create customer")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating customer:", error)
    return null
  }
}

// Update customer
export async function updateCustomer(id: string, data: CustomerFormData): Promise<Customer | null> {
  try {
    const response = await fetch("/api/customers", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...data }),
    })

    if (!response.ok) {
      throw new Error("Failed to update customer")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating customer:", error)
    return null
  }
}

// Delete customer
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/customers?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete customer")
    }

    return true
  } catch (error) {
    console.error("Error deleting customer:", error)
    return false
  }
}

// Send welcome email to customer
export async function sendWelcomeEmail(email: string): Promise<boolean> {
  try {
    const response = await fetch("/api/email/welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error("Failed to send welcome email")
    }

    return true
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return false
  }
}
