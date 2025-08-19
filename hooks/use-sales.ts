"use client"

import { useState } from "react"
import { collection, addDoc, updateDoc, doc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { CartItem, Sale } from "@/types/product"

export function useSales() {
  const [isProcessing, setIsProcessing] = useState(false)

  const processSale = async (
    cart: CartItem[],
    paymentMethod: "cash" | "card" | "upi",
    customerInfo?: {
      name?: string
      phone?: string
      email?: string
    },
    discount = 0,
    tax = 0,
  ) => {
    setIsProcessing(true)

    try {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const discountAmount = (subtotal * discount) / 100
      const taxAmount = ((subtotal - discountAmount) * tax) / 100
      const total = subtotal - discountAmount + taxAmount

      // Create sale record
      const saleData: Omit<Sale, "id"> = {
        items: cart,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        paymentMethod,
        customerInfo,
        timestamp: new Date(),
      }

      // Add sale to Firebase
      const saleRef = await addDoc(collection(db, "sales"), saleData)

      // Update product stock
      const stockUpdates = cart.map(async (item) => {
        const productRef = doc(db, "products", item.id)
        await updateDoc(productRef, {
          stock: increment(-item.quantity),
          updatedAt: new Date(),
        })
      })

      await Promise.all(stockUpdates)

      return {
        saleId: saleRef.id,
        ...saleData,
        id: saleRef.id,
      }
    } catch (error) {
      console.error("Failed to process sale:", error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processSale,
    isProcessing,
  }
}
