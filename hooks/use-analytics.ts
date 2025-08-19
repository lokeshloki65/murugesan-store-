"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Sale } from "@/types/product"

interface AnalyticsData {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  salesByPaymentMethod: Record<string, number>
  dailySales: Array<{
    date: string
    sales: number
    revenue: number
  }>
}

export function useAnalytics(dateRange: "today" | "week" | "month" = "today") {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByPaymentMethod: {},
    dailySales: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)

        // Calculate date range
        const now = new Date()
        const startDate = new Date()

        switch (dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0)
            break
          case "week":
            startDate.setDate(now.getDate() - 7)
            break
          case "month":
            startDate.setDate(now.getDate() - 30)
            break
        }

        const salesQuery = query(
          collection(db, "sales"),
          where("timestamp", ">=", Timestamp.fromDate(startDate)),
          orderBy("timestamp", "desc"),
        )

        const salesSnapshot = await getDocs(salesQuery)
        const sales = salesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sale[]

        // Calculate analytics
        const totalSales = sales.length
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

        // Top products
        const productMap = new Map()
        sales.forEach((sale) => {
          sale.items.forEach((item) => {
            const existing = productMap.get(item.name) || { quantity: 0, revenue: 0 }
            productMap.set(item.name, {
              name: item.name,
              quantity: existing.quantity + item.quantity,
              revenue: existing.revenue + item.price * item.quantity,
            })
          })
        })
        const topProducts = Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        // Sales by payment method
        const salesByPaymentMethod = sales.reduce(
          (acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        // Daily sales (last 7 days)
        const dailySalesMap = new Map()
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split("T")[0]
          dailySalesMap.set(dateStr, { date: dateStr, sales: 0, revenue: 0 })
        }

        sales.forEach((sale) => {
          const dateStr = sale.timestamp.toDate().toISOString().split("T")[0]
          if (dailySalesMap.has(dateStr)) {
            const existing = dailySalesMap.get(dateStr)
            dailySalesMap.set(dateStr, {
              ...existing,
              sales: existing.sales + 1,
              revenue: existing.revenue + sale.total,
            })
          }
        })

        const dailySales = Array.from(dailySalesMap.values())

        setAnalytics({
          totalSales,
          totalRevenue,
          averageOrderValue,
          topProducts,
          salesByPaymentMethod,
          dailySales,
        })
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  return { analytics, loading }
}
