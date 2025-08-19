export interface Product {
  id: string
  barcode: string
  name: string
  price: number
  stock: number
  category: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CartItem extends Product {
  quantity: number
}

export interface Sale {
  id: string
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: "cash" | "card" | "upi"
  customerInfo?: {
    name?: string
    phone?: string
    email?: string
  }
  timestamp: Date
}
