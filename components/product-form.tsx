"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/types/product"

interface ProductFormProps {
  product?: Product
  onSubmit: (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const categories = [
  "Grains & Cereals",
  "Dairy Products",
  "Bakery Items",
  "Beverages",
  "Snacks",
  "Spices & Condiments",
  "Fruits & Vegetables",
  "Personal Care",
  "Household Items",
  "Other",
]

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    barcode: product?.barcode || "",
    name: product?.name || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || "",
    description: product?.description || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.barcode.trim()) newErrors.barcode = "Barcode is required"
    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0"
    if (formData.stock < 0) newErrors.stock = "Stock cannot be negative"
    if (!formData.category) newErrors.category = "Category is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Form submitted with data:", formData) // Added debugging for form submission

    if (!validateForm()) {
      console.log("[v0] Form validation failed:", errors) // Added debugging for validation
      return
    }

    try {
      console.log("[v0] Calling onSubmit with:", formData) // Added debugging before onSubmit call
      await onSubmit(formData)
      console.log("[v0] onSubmit completed successfully") // Added debugging for successful submission
    } catch (error) {
      console.error("[v0] Failed to save product:", error) // Enhanced error logging
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode *</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                placeholder="Enter barcode"
                className={errors.barcode ? "border-destructive" : ""}
              />
              {errors.barcode && <p className="text-sm text-destructive">{errors.barcode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.stock ? "border-destructive" : ""}
              />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className={errors.category ? "border-destructive" : ""}>
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
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description (optional)"
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
