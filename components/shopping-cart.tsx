"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, Minus, Receipt, CreditCard, ShoppingCart, CheckCircle } from "lucide-react"
import type { CartItem } from "@/types/product"
import CheckoutDialog from "./checkout-dialog"
import ReceiptDialog from "./receipt/receipt-dialog"
import { useSales } from "@/hooks/use-sales"
import { useToast } from "@/hooks/use-toast"

interface CartProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  total: number
  totalItems: number
}

export default function Cart({ cart, onUpdateQuantity, onRemoveItem, onClearCart, total, totalItems }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  const { processSale, isProcessing } = useSales()
  const { toast } = useToast()

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

  const handleCheckout = async (
    paymentMethod: "cash" | "card" | "upi",
    customerInfo: any,
    discount: number,
    tax: number,
  ) => {
    try {
      const sale = await processSale(cart, paymentMethod, customerInfo, discount, tax)

      setLastSale(sale)
      setShowCheckout(false)
      onClearCart()

      toast({
        title: "Payment Successful!",
        description: `Sale completed for ${formatCurrency(sale.total)}`,
      })
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing the payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShowReceipt = () => {
    if (lastSale) {
      setShowReceipt(true)
    }
  }

  return (
    <>
      <Card className="h-fit sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Shopping Cart</span>
            </div>
            <Badge variant="secondary" className={totalItems > 0 ? "animate-pulse" : ""}>
              {totalItems} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          {lastSale && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Last sale: {formatCurrency(lastSale.total)} via {lastSale.paymentMethod}
              </AlertDescription>
            </Alert>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Cart is empty</p>
              <p className="text-sm">Scan products to add them</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg transition-all hover:bg-muted/70"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 mx-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <span className="w-8 text-center font-medium">{item.quantity}</span>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Item Total & Remove */}
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totalItems} items):</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax & Discounts:</span>
                  <span>Applied at checkout</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={() => setShowCheckout(true)} className="w-full" size="lg" disabled={cart.length === 0}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Checkout - {formatCurrency(total)}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={onClearCart} variant="outline" size="sm">
                    Clear Cart
                  </Button>
                  <Button onClick={handleShowReceipt} variant="outline" size="sm" disabled={!lastSale}>
                    <Receipt className="h-4 w-4 mr-1" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        cart={cart}
        subtotal={total}
        onCheckout={handleCheckout}
        isProcessing={isProcessing}
      />

      {/* Receipt Dialog */}
      <ReceiptDialog open={showReceipt} onOpenChange={setShowReceipt} sale={lastSale} />
    </>
  )
}
