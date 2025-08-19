"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import type { Product } from "@/types/product"
import ProductForm from "./product-form"
import EnhancedAddProductWorkflow from "./enhanced-add-product-workflow"
import { SeedProductsButton } from "./seed-products-button"
import { useToast } from "@/hooks/use-toast"

export default function ProductManagement() {
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [showEnhancedWorkflow, setShowEnhancedWorkflow] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleUpdateProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (!editingProduct) return

    setIsSubmitting(true)
    try {
      await updateProduct(editingProduct.id, productData)
      setEditingProduct(null)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return

    try {
      await deleteProduct(deletingProduct.id)
      setDeletingProduct(null)
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleWorkflowComplete = () => {
    setShowEnhancedWorkflow(false)
    toast({
      title: "Success",
      description: "Product added successfully",
    })
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: "destructive" as const, label: "Out of Stock" }
    if (stock <= 10) return { variant: "secondary" as const, label: "Low Stock" }
    return { variant: "default" as const, label: "In Stock" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading products: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your store inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <SeedProductsButton />
          <Button onClick={() => setShowEnhancedWorkflow(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, barcode, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Products ({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
              <p className="text-sm">Add your first product to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeletingProduct(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Workflow Dialog */}
      <Dialog open={showEnhancedWorkflow} onOpenChange={setShowEnhancedWorkflow}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <EnhancedAddProductWorkflow
            onComplete={handleWorkflowComplete}
            onCancel={() => setShowEnhancedWorkflow(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
