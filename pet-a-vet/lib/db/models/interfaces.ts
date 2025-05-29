export interface BaseModel {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User extends BaseModel {
  user_id: number;
  username: string;
  password: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role:
    | "ADMINISTRATOR"
    | "VETERINARIAN"
    | "SECRETARY"
    | "PETGROOMER"
    | "CUSTOMER";
  created_at: Date;
  last_login?: Date;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface Customer extends User {
  customer_id: number;
  subscription_id?: number;
  balance: number;
  preferred_payment_method?: string;
}

export interface Veterinarian extends User {
  veterinarian_id: number;
  specialization: string;
  license_number: string;
  bio?: string;
  availability?: any;
}

export interface Pet extends BaseModel {
  pet_id: number;
  owner_id: number;
  name: string;
  species: string;
  breed?: string;
  birth_date?: Date;
  gender: string;
  weight?: number;
  color?: string;
  microchip_id?: string;
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
  emergency_contact?: string;
  profile_image?: string; // Changed from photo_url to profile_image
  notes?: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface MedicalRecord extends BaseModel {
  record_id: number;
  pet_id: number;
  veterinarian_id: number;
  appointment_id?: number;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  record_date: Date;
  follow_up_date?: Date;
  status: "OPEN" | "CLOSED" | "REQUIRES_FOLLOWUP";
}

export interface Product extends BaseModel {
  product_id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  cost: number;
  barcode?: string;
  requires_prescription: boolean;
  manufacturer?: string;
  image_url?: string;
  status: "ACTIVE" | "DISCONTINUED" | "OUT_OF_STOCK";
}

export interface Appointment extends BaseModel {
  appointment_id: number;
  pet_id: number;
  service_provider_id: number;
  creator_id: number;
  service_type: "MEDICAL" | "GROOMING";
  appointment_date: Date;
  appointment_time: string;
  duration: number;
  reason?: string;
  notes?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  created_at: Date;
  updated_at: Date;
}

export interface Inventory extends BaseModel {
  inventory_id: number;
  product_id: number;
  quantity_in_stock_registered: number;
  real_quantity_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  location?: string;
  last_count_date?: Date;
  expiry_date?: Date;
  lot_number?: string;
  last_updated: Date;
}

export interface Cart extends BaseModel {
  cart_id: number;
  customer_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem extends BaseModel {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price_at_addition: number;
  added_at: Date;
}

export interface Order extends BaseModel {
  order_id: number;
  customer_id: number;
  total_amount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  payment_method: "CARD" | "CASH";
  payment_status: "PENDING" | "PAID" | "REFUNDED";
  shipping_address: string;
  order_date: Date;
  shipping_date?: Date;
  delivery_date?: Date;
  notes?: string;
}

export interface OrderItem extends BaseModel {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  discount: number;
}

export interface Subscription extends BaseModel {
  subscription_id: number;
  name: string;
  description?: string;
  price: any;
  type: "BASIC" | "PREMIUM" | "CLINIC";
  is_active: boolean;
}

export interface CustomerSubscription extends BaseModel {
  customer_subscription_id: number;
  customer_id: number;
  subscription_id: number;
  start_date: Date;
  end_date: Date;
  auto_renew: boolean;
  payment_method: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
}
