"use client"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/types/product"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener for products
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Product[]

        setProducts(productsData)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const addProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("[v0] Adding product to Firebase:", productData) // Added debugging for Firebase operation
      const now = new Date()
      const docRef = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: now,
        updatedAt: now,
      })
      console.log("[v0] Product added successfully with ID:", docRef.id) // Added success logging
    } catch (err) {
      console.error("[v0] Firebase error:", err) // Enhanced error logging
      setError(err instanceof Error ? err.message : "Failed to add product")
      throw err
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const productRef = doc(db, "products", id)
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product")
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product")
      throw err
    }
  }

  const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      const q = query(collection(db, "products"), where("barcode", "==", barcode))
      const snapshot = await getDocs(q)

      if (snapshot.empty) return null

      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Product
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find product")
      return null
    }
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    findProductByBarcode,
  }
}
