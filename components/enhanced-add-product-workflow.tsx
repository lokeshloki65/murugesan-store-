"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Package, Scan, Save, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useProducts } from "@/hooks/use-products"

interface EnhancedAddProductWorkflowProps {
  onComplete: () => void
  onCancel: () => void
}

export default function EnhancedAddProductWorkflow({ onComplete, onCancel }: EnhancedAddProductWorkflowProps) {
  const { findProductByBarcode, addProduct } = useProducts()
  const [step, setStep] = useState<"scanner" | "form">("scanner")
  const [scannedBarcode, setScannedBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "not-found">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "0",
  })

  const categories = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Beverages",
    "Snacks",
    "Confectionery",
    "Grains",
    "Pulses",
    "Spices",
    "Personal Care",
    "Household",
    "Other",
  ]

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedBarcode.trim()) return

    setIsScanning(true)
    setScanStatus("idle")

    try {
      // Simulate scanning delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const existingProduct = await findProductByBarcode(scannedBarcode.trim())

      if (existingProduct) {
        setScanStatus("error")
        // Product already exists, show error but allow continuing to form
        setTimeout(() => {
          setScanStatus("idle")
          setStep("form")
        }, 2000)
      } else {
        setScanStatus("not-found")
        // Product not found, perfect for adding new product
        setTimeout(() => {
          setScanStatus("success")
          setStep("form")
        }, 1500)
      }
    } catch (error) {
      setScanStatus("error")
    } finally {
      setIsScanning(false)
    }
  }

  const simulateCameraScan = () => {
    // Generate a random barcode for demo
    const randomBarcode = `890103087${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`
    setScannedBarcode(randomBarcode)

    // Auto-submit
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    }, 100)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.price.trim() || !formData.category) return

    setIsSubmitting(true)

    try {
      const productData = {
        name: formData.name.trim(),
        price: Number.parseFloat(formData.price),
        barcode: scannedBarcode,
        category: formData.category,
        description: formData.description.trim(),
        stock: Number.parseInt(formData.stock) || 0,
      }

      await addProduct(productData)
      onComplete()
    } catch (error) {
      console.error("Error adding product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = () => {
    switch (scanStatus) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "not-found":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <Scan className="h-5 w-5 text-primary" />
    }
  }

  const getStatusColor = () => {
    switch (scanStatus) {
      case "success":
      case "not-found":
        return "border-green-500 bg-green-50"
      case "error":
        return "border-red-500 bg-red-50"
      default:
        return "border-primary bg-primary/5"
    }
  }

  if (step === "scanner") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-lg font-semibold">Add New Product</h3>
              <p className="text-sm text-muted-foreground">Step 1: Scan product barcode</p>
            </div>
          </div>
          <Badge variant="outline">Step 1 of 2</Badge>
        </div>

        {/* Scanner Interface */}
        <Card className={`transition-all duration-300 ${getStatusColor()}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span>Scan Product Barcode</span>
              </div>
              <Button
                onClick={simulateCameraScan}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-transparent"
                disabled={isScanning}
              >
                <Package className="h-4 w-4" />
                <span>Demo Scan</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleBarcodeSubmit} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Scan or enter barcode..."
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
                className="flex-1 text-lg font-mono"
                disabled={isScanning}
                autoFocus
              />
              <Button type="submit" disabled={isScanning || !scannedBarcode.trim()} className="px-6">
                {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
              </Button>
            </form>

            {/* Status Messages */}
            {scanStatus === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Product with this barcode already exists. Proceeding to edit form...
                </AlertDescription>
              </Alert>
            )}

            {scanStatus === "not-found" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Perfect! This barcode is available for a new product. Proceeding to details form...
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p className="font-medium mb-2">Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Scan the product barcode using a barcode scanner</li>
                <li>Or click "Demo Scan" to generate a sample barcode</li>
                <li>Enter the barcode manually if needed</li>
                <li>We'll check if the product already exists</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => setStep("scanner")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Add New Product</h3>
            <p className="text-sm text-muted-foreground">Step 2: Enter product details</p>
          </div>
        </div>
        <Badge variant="outline">Step 2 of 2</Badge>
      </div>

      {/* Scanned Barcode Display */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Barcode Scanned</p>
              <p className="text-sm font-mono text-green-600">{scannedBarcode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.price.trim() || !formData.category}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
