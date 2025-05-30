// This service handles all store-related operations

// Types
export interface Product {
  id: string
  name: string
  price: number
  rating: number
  image: string
  inStock: boolean
  tags: string[]
  description?: string
  longDescription?: string
  specifications?: { name: string; value: string }[]
  brand?: string
  sku?: string
  stockQuantity?: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface Order {
  id: string
  userId: string
  date: string
  status: string
  paymentMethod: string
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: Address
  billingAddress: Address
  estimatedDelivery: string
}

export interface Address {
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

// Service functions
export async function getProducts(category?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams()
  if (category) params.append("category", category)
  if (search) params.append("search", search)

  const response = await fetch(`/api/store/products?${params.toString()}`)
  const data = await response.json()

  return data.products || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const response = await fetch(`/api/store/products?id=${id}`)

  if (!response.ok) {
    return null
  }

  return await response.json()
}

export async function getCart(): Promise<Cart> {
  const response = await fetch("/api/store/cart")
  return await response.json()
}

export async function addToCart(item: CartItem): Promise<Cart> {
  const response = await fetch("/api/store/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "add",
      item,
    }),
  })

  return await response.json()
}

export async function updateCartItem(id: string, quantity: number): Promise<Cart> {
  const response = await fetch("/api/store/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "update",
      item: { id, quantity },
    }),
  })

  return await response.json()
}

export async function removeFromCart(id: string): Promise<Cart> {
  const response = await fetch("/api/store/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "remove",
      item: { id },
    }),
  })

  return await response.json()
}

export async function clearCart(): Promise<Cart> {
  const response = await fetch("/api/store/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "clear",
    }),
  })

  return await response.json()
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const response = await fetch("/api/store/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })

  return await response.json().then((data) => data.order)
}

export async function getOrderById(id: string): Promise<Order | null> {
  const response = await fetch(`/api/store/orders?id=${id}`)

  if (!response.ok) {
    return null
  }

  return await response.json()
}

export async function getUserOrders(): Promise<Order[]> {
  const response = await fetch("/api/store/orders")
  const data = await response.json()

  return data.orders || []
}

// Payment processing
export async function processPayment(
  paymentData: any,
): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    const response = await fetch("/api/store/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    return await response.json()
  } catch (error) {
    return {
      success: false,
      message: "Payment processing failed. Please try again.",
    }
  }
}
