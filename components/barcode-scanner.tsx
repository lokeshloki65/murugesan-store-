"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Scan,
  Search,
  Package,
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Minus,
  ShoppingCart,
  Star,
} from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import type { Product } from "@/types/product"

interface BarcodeScannerProps {
  onProductScanned: (product: Product) => void
  cart?: any[]
}

export default function BarcodeScanner({ onProductScanned, cart = [] }: BarcodeScannerProps) {
  const { findProductByBarcode } = useProducts()
  const [barcode, setBarcode] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "not-found">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [quickQuantity, setQuickQuantity] = useState(1)
  const [recentScans, setRecentScans] = useState<Product[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus barcode input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode.trim()) return

    setIsScanning(true)
    setScanStatus("idle")
    setErrorMessage("")

    try {
      // Simulate scanning delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800))

      const product = await findProductByBarcode(barcode.trim())

      if (product) {
        if (product.stock <= 0) {
          setScanStatus("error")
          setErrorMessage("Product is out of stock")
          setScannedProduct(product)
        } else {
          setScanStatus("success")
          setScannedProduct(product)

          // Add multiple quantities if specified
          for (let i = 0; i < quickQuantity; i++) {
            onProductScanned(product)
          }

          // Add to recent scans
          setRecentScans((prev) => {
            const filtered = prev.filter((p) => p.id !== product.id)
            return [product, ...filtered].slice(0, 3)
          })

          // Clear barcode after successful scan
          setTimeout(() => {
            setBarcode("")
            setScanStatus("idle")
            setScannedProduct(null)
            setQuickQuantity(1)
            inputRef.current?.focus()
          }, 3000)
        }
      } else {
        setScanStatus("not-found")
        setErrorMessage("Product not found in database")
        setScannedProduct(null)
      }
    } catch (error) {
      setScanStatus("error")
      setErrorMessage("Failed to scan product. Please try again.")
      setScannedProduct(null)
    } finally {
      setIsScanning(false)
    }
  }

  const handleManualSearch = async () => {
    if (!searchTerm.trim()) return

    setIsScanning(true)
    setScanStatus("idle")
    setErrorMessage("")

    try {
      const product = await findProductByBarcode(searchTerm.trim())

      if (product) {
        setScanStatus("success")
        setScannedProduct(product)
        onProductScanned(product)
        setSearchTerm("")

        // Add to recent scans
        setRecentScans((prev) => {
          const filtered = prev.filter((p) => p.id !== product.id)
          return [product, ...filtered].slice(0, 3)
        })
      } else {
        setScanStatus("not-found")
        setErrorMessage("Product not found")
        setScannedProduct(null)
      }
    } catch (error) {
      setScanStatus("error")
      setErrorMessage("Search failed. Please try again.")
      setScannedProduct(null)
    } finally {
      setIsScanning(false)
    }
  }

  const simulateCameraScan = () => {
    // Simulate camera scanning with a random product barcode
    const sampleBarcodes = ["8901030875021", "8901030875038", "8901030875045", "8901030875052", "8901030875069"]
    const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)]
    setBarcode(randomBarcode)

    // Auto-submit after setting barcode
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    }, 100)
  }

  const getCartQuantity = (productId: string) => {
    const cartItem = cart.find((item) => item.id === productId)
    return cartItem ? cartItem.quantity : 0
  }

  const getStatusIcon = () => {
    switch (scanStatus) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "error":
      case "not-found":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Scan className="h-6 w-6 text-primary" />
    }
  }

  const getStatusColor = () => {
    switch (scanStatus) {
      case "success":
        return "border-green-500 bg-gradient-to-br from-green-50 to-green-100"
      case "error":
      case "not-found":
        return "border-red-500 bg-gradient-to-br from-red-50 to-red-100"
      default:
        return "border-primary bg-gradient-to-br from-primary/5 to-primary/10"
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Scanner Interface */}
      <Card className={`transition-all duration-500 ${getStatusColor()} shadow-lg`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <span className="text-xl">Barcode Scanner</span>
                <p className="text-sm text-muted-foreground font-normal">Scan or enter product barcode</p>
              </div>
            </div>
            <Button
              onClick={simulateCameraScan}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-white/80 hover:bg-white"
              disabled={isScanning}
            >
              <Camera className="h-4 w-4" />
              <span>Demo Scan</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barcode Input */}
          <form onSubmit={handleBarcodeSubmit} className="space-y-4">
            <div className="flex space-x-3">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Scan or enter barcode..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="flex-1 text-lg font-mono h-12 bg-white/80"
                disabled={isScanning}
              />
              <Button type="submit" disabled={isScanning || !barcode.trim()} className="px-8 h-12">
                {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scan className="h-5 w-5" />}
              </Button>
            </div>

            {/* Quick Quantity Selector */}
            <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-lg">
              <span className="text-sm font-medium">Quick Add Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setQuickQuantity(Math.max(1, quickQuantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-semibold">{quickQuantity}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setQuickQuantity(quickQuantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">Items to add per scan</span>
            </div>
          </form>

          {/* Manual Search */}
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="Or search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white/80"
              disabled={isScanning}
            />
            <Button onClick={handleManualSearch} variant="outline" disabled={isScanning || !searchTerm.trim()}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Messages */}
          {scanStatus === "not-found" && (
            <Alert className="border-blue-500 bg-blue-50">
              <Package className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                Product not found. You can add it using the "Add Product" feature in Product Management.
              </AlertDescription>
            </Alert>
          )}

          {scanStatus === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Scanned Product Display */}
      {scannedProduct && (
        <Card
          className={`transition-all duration-700 transform ${
            scanStatus === "success"
              ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 animate-in slide-in-from-top-4 scale-in-95"
              : scanStatus === "error"
                ? "border-red-500 bg-gradient-to-br from-red-50 to-red-100"
                : "border-primary bg-gradient-to-br from-primary/5 to-primary/10"
          } shadow-xl`}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`p-4 rounded-xl ${
                    scanStatus === "success"
                      ? "bg-green-200 shadow-lg"
                      : scanStatus === "error"
                        ? "bg-red-200"
                        : "bg-primary/20"
                  }`}
                >
                  <Package
                    className={`h-8 w-8 ${
                      scanStatus === "success"
                        ? "text-green-700"
                        : scanStatus === "error"
                          ? "text-red-700"
                          : "text-primary"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-2xl mb-2">{scannedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono mb-3">Barcode: {scannedProduct.barcode}</p>
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {scannedProduct.category}
                    </Badge>
                    <Badge
                      variant={
                        scannedProduct.stock > 10 ? "default" : scannedProduct.stock > 0 ? "secondary" : "destructive"
                      }
                      className="text-sm px-3 py-1"
                    >
                      Stock: {scannedProduct.stock}
                    </Badge>
                    {getCartQuantity(scannedProduct.id) > 0 && (
                      <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 border-blue-200">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        In Cart: {getCartQuantity(scannedProduct.id)}
                      </Badge>
                    )}
                  </div>
                  {scannedProduct.description && (
                    <p className="text-sm text-muted-foreground">{scannedProduct.description}</p>
                  )}
                </div>
              </div>

              {/* Price Display */}
              <div className="text-right">
                <div
                  className={`text-4xl font-bold mb-2 ${
                    scanStatus === "success"
                      ? "text-green-600"
                      : scanStatus === "error"
                        ? "text-red-600"
                        : "text-primary"
                  }`}
                >
                  ₹{scannedProduct.price.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">per unit</div>
                {quickQuantity > 1 && (
                  <div className="text-lg font-semibold text-blue-600">
                    Total: ₹{(scannedProduct.price * quickQuantity).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Status Message */}
            <div className="flex items-center justify-center p-4 rounded-lg bg-white/60">
              <div className="text-center">
                <div
                  className={`text-lg font-semibold ${
                    scanStatus === "success"
                      ? "text-green-700"
                      : scanStatus === "error"
                        ? "text-red-700"
                        : "text-primary"
                  }`}
                >
                  {scanStatus === "success" && `✓ Added ${quickQuantity} item${quickQuantity > 1 ? "s" : ""} to cart`}
                  {scanStatus === "error" && `✗ ${errorMessage}`}
                  {scanStatus === "idle" && "Ready to scan next item"}
                </div>
                {scanStatus === "success" && (
                  <div className="text-sm text-muted-foreground mt-1">Scan another item or proceed to checkout</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Star className="h-5 w-5" />
              <span>Recent Scans</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentScans.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-white/80 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onProductScanned(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">₹{product.price.toFixed(2)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getCartQuantity(product.id) || 0}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-semibold flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Pro Tips:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-6 text-blue-700">
              <li>Use quick quantity to add multiple items at once</li>
              <li>Recent scans show your last 3 scanned products</li>
              <li>Products automatically add to cart when scanned successfully</li>
              <li>Out of stock items will show an error message</li>
              <li>Click on recent scans to quickly add them again</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
