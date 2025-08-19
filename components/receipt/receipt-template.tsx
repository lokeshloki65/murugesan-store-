"use client"

import { forwardRef } from "react"
import { Separator } from "@/components/ui/separator"
import type { Sale } from "@/types/product"

interface ReceiptTemplateProps {
  sale: Sale
  storeInfo?: {
    name: string
    address: string
    phone: string
    email: string
    gst?: string
  }
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(({ sale, storeInfo }, ref) => {
  const defaultStoreInfo = {
    name: "Murugesan Store",
    address: "123 Main Street, Chennai, Tamil Nadu 600001",
    phone: "+91 98765 43210",
    email: "info@murugensanstore.com",
    gst: "33XXXXX1234X1ZX",
  }

  const store = storeInfo || defaultStoreInfo

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  return (
    <div ref={ref} className="max-w-sm mx-auto bg-white text-black p-4 font-mono text-sm">
      {/* Store Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold uppercase">{store.name}</h1>
        <p className="text-xs leading-tight">{store.address}</p>
        <p className="text-xs">Phone: {store.phone}</p>
        <p className="text-xs">Email: {store.email}</p>
        {store.gst && <p className="text-xs">GST: {store.gst}</p>}
      </div>

      <Separator className="my-2 border-black" />

      {/* Receipt Info */}
      <div className="mb-4">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{sale.id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(sale.timestamp)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment:</span>
          <span className="uppercase">{sale.paymentMethod}</span>
        </div>
        {sale.customerInfo?.name && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{sale.customerInfo.name}</span>
          </div>
        )}
      </div>

      <Separator className="my-2 border-black" />

      {/* Items */}
      <div className="mb-4">
        <div className="flex justify-between font-bold mb-2">
          <span>ITEM</span>
          <span>QTY</span>
          <span>RATE</span>
          <span>AMOUNT</span>
        </div>
        <Separator className="mb-2 border-black" />

        {sale.items.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span className="flex-1 truncate pr-2">{item.name}</span>
              <span className="w-8 text-center">{item.quantity}</span>
              <span className="w-12 text-right">{formatCurrency(item.price)}</span>
              <span className="w-16 text-right">{formatCurrency(item.price * item.quantity)}</span>
            </div>
            {item.category && <div className="text-xs text-gray-600 ml-0">({item.category})</div>}
          </div>
        ))}
      </div>

      <Separator className="my-2 border-black" />

      {/* Totals */}
      <div className="mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>

        {sale.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}

        {sale.tax > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(sale.tax)}</span>
          </div>
        )}

        <Separator className="my-2 border-black" />

        <div className="flex justify-between font-bold text-base">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      <Separator className="my-2 border-black" />

      {/* Footer */}
      <div className="text-center text-xs mt-4">
        <p className="mb-1">Thank you for shopping with us!</p>
        <p className="mb-1">Visit us again soon</p>
        <p className="mb-2">For support: {store.phone}</p>

        {/* QR Code Placeholder */}
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 border-2 border-black flex items-center justify-center text-xs">QR CODE</div>
        </div>

        <p className="text-xs">Scan for digital receipt</p>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container,
          .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
})

ReceiptTemplate.displayName = "ReceiptTemplate"

export default ReceiptTemplate
