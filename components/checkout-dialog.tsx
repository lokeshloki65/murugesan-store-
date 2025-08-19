"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, Banknote, User, Percent, Calculator } from "lucide-react"
import type { CartItem } from "@/types/product"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  subtotal: number
  onCheckout: (
    paymentMethod: "cash" | "card" | "upi",
    customerInfo: {
      name?: string
      phone?: string
      email?: string
    },
    discount: number,
    tax: number,
  ) => Promise<void>
  isProcessing: boolean
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  cart,
  subtotal,
  onCheckout,
  isProcessing,
}: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [discount, setDiscount] = useState(0)
  const [tax] = useState(0) // GST can be configured here

  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCheckout(paymentMethod, customerInfo, discount, tax)
  }

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Checkout</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Customer & Payment */}
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <User className="h-4 w-4" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Name (Optional)</Label>
                    <Input
                      id="customerName"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone (Optional)</Label>
                    <Input
                      id="customerPhone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email (Optional)</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <span>Cash Payment</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span>Card Payment</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center space-x-2 cursor-pointer flex-1">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                        <span>UPI Payment</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Discount */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Percent className="h-4 w-4" />
                    <span>Discount</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">% discount</span>
                    {discount > 0 && <Badge variant="secondary">-{formatCurrency(discountAmount)}</Badge>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Calculator className="h-4 w-4" />
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bill Calculation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bill Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({tax}%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" size="lg" disabled={isProcessing || cart.length === 0}>
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Complete Payment - {formatCurrency(total)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
