"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Sale } from "@/types/product"
import { Search, Calendar, Receipt, Filter } from "lucide-react"
import { format } from "date-fns"

export function PurchaseHistory() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState("")

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true)
        const salesQuery = query(collection(db, "sales"), orderBy("timestamp", "desc"), limit(100))

        const salesSnapshot = await getDocs(salesQuery)
        const salesData = salesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sale[]

        setSales(salesData)
        setFilteredSales(salesData)
      } catch (error) {
        console.error("Error fetching sales:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  useEffect(() => {
    let filtered = sales

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customerPhone?.includes(searchTerm) ||
          sale.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by date
    if (filterDate) {
      const selectedDate = new Date(filterDate)
      filtered = filtered.filter((sale) => {
        const saleDate = sale.timestamp.toDate()
        return saleDate.toDateString() === selectedDate.toDateString()
      })
    }

    setFilteredSales(filtered)
  }, [sales, searchTerm, filterDate])

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Cash":
        return "bg-green-100 text-green-800"
      case "Card":
        return "bg-blue-100 text-blue-800"
      case "UPI":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name, phone, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setFilterDate("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Purchase History ({filteredSales.length} transactions)</h3>
        </div>

        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Transaction #{sale.id.slice(-8)}</h4>
                      <Badge className={getPaymentMethodColor(sale.paymentMethod)}>{sale.paymentMethod}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{format(sale.timestamp.toDate(), "PPpp")}</p>
                    {sale.customerName && (
                      <p className="text-sm">
                        <span className="font-medium">Customer:</span> {sale.customerName}
                        {sale.customerPhone && ` (${sale.customerPhone})`}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{sale.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{sale.items.length} items</p>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid gap-2">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{sale.subtotal.toFixed(2)}</span>
                    </div>
                    {sale.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{sale.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{sale.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>₹{sale.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
