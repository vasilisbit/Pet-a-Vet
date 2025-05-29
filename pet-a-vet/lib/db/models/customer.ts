import { query } from "../connection"
import type { Customer } from "./interfaces"

export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const customers = await query<Customer[]>(`
      SELECT c.*, u.username, u.email, u.full_name, u.phone, u.address, u.created_at, u.last_login, u.status
      FROM Customer c
      JOIN User u ON c.customer_id = u.user_id
      WHERE u.status = 'ACTIVE'
      ORDER BY u.full_name
    `)
    return customers
  } catch (error) {
    console.error("Error getting all customers:", error)
    throw error
  }
}

export async function getCustomerById(customerId: number): Promise<Customer | null> {
  try {
    const customers = await query<Customer[]>(
      `
      SELECT c.*, u.username, u.email, u.full_name, u.phone, u.address, u.created_at, u.last_login, u.status
      FROM Customer c
      JOIN User u ON c.customer_id = u.user_id
      WHERE c.customer_id = ?
    `,
      [customerId],
    )
    return customers.length > 0 ? customers[0] : null
  } catch (error) {
    console.error("Error getting customer by ID:", error)
    throw error
  }
}

export async function getCustomerByUserId(userId: number): Promise<Customer | null> {
  try {
    const customers = await query<Customer[]>(
      `
      SELECT c.*, u.username, u.email, u.full_name, u.phone, u.address, u.created_at, u.last_login, u.status
      FROM Customer c
      JOIN User u ON c.customer_id = u.user_id
      WHERE c.customer_id = ?
    `,
      [userId],
    )
    return customers.length > 0 ? customers[0] : null
  } catch (error) {
    console.error("Error getting customer by user ID:", error)
    throw error
  }
}

export async function createCustomer(userId: number): Promise<number> {
  try {
    // In our schema, customer_id is the same as user_id
    const result = await query<any>("INSERT INTO Customer (customer_id) VALUES (?)", [userId])
    return result.insertId || userId
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

export async function updateCustomer(customerId: number, customerData: Partial<Customer>): Promise<boolean> {
  try {
    // Build the SET part of the query dynamically
    const fields = Object.keys(customerData)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(customerData)

    if (fields.length === 0) {
      return false // Nothing to update
    }

    const result = await query<any>(`UPDATE Customer SET ${fields} WHERE customer_id = ?`, [...values, customerId])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating customer:", error)
    throw error
  }
}

export async function deleteCustomer(customerId: number): Promise<boolean> {
  try {
    const result = await query<any>("DELETE FROM Customer WHERE customer_id = ?", [customerId])
    return result.affectedRows > 0
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw error
  }
}

export async function updateCustomerBalance(customerId: number, amount: number): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Customer SET balance = balance + ? WHERE customer_id = ?", [
      amount,
      customerId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating customer balance:", error)
    throw error
  }
}

export async function updateCustomerSubscription(customerId: number, subscriptionId: number | null): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Customer SET subscription_id = ? WHERE customer_id = ?", [
      subscriptionId,
      customerId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating customer subscription:", error)
    throw error
  }
}

export async function updatePaymentMethod(customerId: number, paymentMethod: string): Promise<boolean> {
  try {
    const result = await query<any>("UPDATE Customer SET preferred_payment_method = ? WHERE customer_id = ?", [
      paymentMethod,
      customerId,
    ])

    return result.affectedRows > 0
  } catch (error) {
    console.error("Error updating payment method:", error)
    throw error
  }
}
