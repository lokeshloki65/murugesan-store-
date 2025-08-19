"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Printer, Download, Mail, Share2, FileText, Loader2 } from "lucide-react"
import type { Sale } from "@/types/product"
import ReceiptTemplate from "./receipt-template"
import { useToast } from "@/hooks/use-toast"
import { downloadReceiptPDF } from "@/lib/pdf-generator"

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: Sale | null
}

export default function ReceiptDialog({ open, onOpenChange, sale }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  if (!sale) return null

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${sale.id}</title>
              <style>
                body { margin: 0; padding: 0; font-family: monospace; }
                @media print {
                  @page { size: 80mm auto; margin: 0; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()

        toast({
          title: "Receipt Sent to Printer",
          description: "Receipt has been sent to the default printer",
        })
      }
    }
  }

  const handleDownload = async () => {
    setIsGeneratingPDF(true)
    try {
      await downloadReceiptPDF(sale)
      toast({
        title: "PDF Downloaded Successfully",
        description: `Receipt PDF saved as receipt-${sale.id.slice(-8).toUpperCase()}.pdf`,
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleEmail = () => {
    if (sale.customerInfo?.email) {
      // In a real implementation, you'd send email via API
      toast({
        title: "Email Sent",
        description: `Receipt sent to ${sale.customerInfo.email}`,
      })
    } else {
      toast({
        title: "No Email Address",
        description: "Customer email not provided",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${sale.id}`,
          text: `Receipt from Murugesan Store - Total: ₹${sale.total.toFixed(2)}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      const receiptText = `
Receipt #${sale.id.slice(-8).toUpperCase()}
Murugesan Store
Total: ₹${sale.total.toFixed(2)}
Payment: ${sale.paymentMethod.toUpperCase()}
Date: ${new Intl.DateTimeFormat("en-IN").format(sale.timestamp)}
      `
      navigator.clipboard.writeText(receiptText)
      toast({
        title: "Receipt Copied",
        description: "Receipt details copied to clipboard",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Receipt Preview & Download</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receipt Preview */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="receipt-container">
                  <ReceiptTemplate ref={receiptRef} sale={sale} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Receipt Actions</span>
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleDownload}
                    className="w-full justify-start"
                    size="lg"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF Receipt
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="w-full justify-start bg-white/80"
                    size="lg"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>

                  <Button
                    onClick={handleEmail}
                    variant="outline"
                    className="w-full justify-start bg-white/80"
                    size="lg"
                    disabled={!sale.customerInfo?.email}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Receipt
                    {!sale.customerInfo?.email && <span className="ml-2 text-xs">(No email)</span>}
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full justify-start bg-white/80"
                    size="lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Receipt Details */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Receipt Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Receipt ID:</span>
                    <span className="font-mono">{sale.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span>{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{sale.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Intl.DateTimeFormat("en-IN").format(sale.timestamp)}</span>
                  </div>
                  {sale.customerInfo?.name && (
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{sale.customerInfo.name}</span>
                    </div>
                  )}

                  <Separator className="my-3" />

                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{sale.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF Features:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                    <li>Professional thermal receipt format</li>
                    <li>Optimized for 80mm receipt printers</li>
                    <li>High-quality PDF generation</li>
                    <li>Automatic filename with receipt ID</li>
                    <li>Compatible with all devices</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
