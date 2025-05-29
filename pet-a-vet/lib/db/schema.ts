// This file defines the database schema for the Pet-à-Vet application
// In a real application, this would be used with an ORM like Prisma

export interface User {
  id: string
  name: string
  email: string
  password: string // Hashed in a real application
  role: "pet-owner" | "veterinarian" | "clinic-staff" | "admin" | "breeder"
  createdAt: Date
  updatedAt: Date
}

export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  birthDate: Date | null
  gender: "male" | "female" | "unknown"
  microchipId: string | null
  ownerId: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecord {
  id: string
  petId: string
  type: "check-up" | "vaccination" | "surgery" | "treatment" | "other"
  date: Date
  description: string
  diagnosis: string | null
  treatment: string | null
  prescriptions: string | null
  veterinarianId: string
  attachments: string[] | null // URLs to attached files
  createdAt: Date
  updatedAt: Date
}

export interface Vaccination {
  id: string
  petId: string
  vaccineId: string
  date: Date
  expiryDate: Date
  veterinarianId: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  petId: string
  ownerId: string
  veterinarianId: string
  date: Date
  time: string
  duration: number // in minutes
  type: "check-up" | "vaccination" | "surgery" | "grooming" | "other"
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItem {
  id: string
  name: string
  category: "vaccine" | "medication" | "equipment" | "supplies" | "food" | "other"
  description: string | null
  currentStock: number
  minStock: number
  unit: string
  price: number
  cost: number
  supplierId: string | null
  expiryDate: Date | null
  location: string | null
  barcode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface InventoryTransaction {
  id: string
  itemId: string
  type: "in" | "out" | "adjustment"
  quantity: number
  date: Date
  reason: string | null
  userId: string
  appointmentId: string | null
  createdAt: Date
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  discountPrice: number | null
  inventoryItemId: string | null
  images: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  totalAmount: number
  paymentStatus: "pending" | "paid" | "failed"
  paymentMethod: string | null
  shippingAddress: string | null
  trackingNumber: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: "active" | "cancelled" | "expired"
  startDate: Date
  endDate: Date
  renewalDate: Date | null
  paymentMethod: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: "monthly" | "yearly"
  features: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
