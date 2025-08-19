"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShoppingCart, Package, Users, BarChart3, TrendingUp, LogOut, User, Sparkles } from "lucide-react"
import ProductManagement from "@/components/product-management"
import BarcodeScanner from "@/components/barcode-scanner"
import ShoppingCartComponent from "@/components/shopping-cart"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { PurchaseHistory } from "@/components/purchase-history"
import ProtectedRoute from "@/components/auth/protected-route"
import LoginForm from "@/components/auth/login-form"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"
import type { Product } from "@/types/product"

export default function BillingSystem() {
  const [currentView, setCurrentView] = useState<"pos" | "admin" | "analytics">("pos")
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal, getTotalItems } = useCart()
  const { user, logout, loading } = useAuth()

  const handleProductScanned = (product: Product) => {
    addToCart(product, 1)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Murugesan Store...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <header className="border-b bg-gradient-to-r from-card via-card/95 to-card backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-black text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Murugesan Store
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">Professional Billing System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={currentView === "pos" ? "default" : "outline"}
                  onClick={() => setCurrentView("pos")}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    currentView === "pos"
                      ? "bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                      : "hover:bg-primary/10 hover:border-primary/30"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>POS</span>
                  {getTotalItems() > 0 && (
                    <Badge variant="secondary" className="ml-1 animate-pulse">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>

                <ProtectedRoute fallback={null}>
                  <Button
                    variant={currentView === "admin" ? "default" : "outline"}
                    onClick={() => setCurrentView("admin")}
                    className={`flex items-center space-x-2 transition-all duration-300 ${
                      currentView === "admin"
                        ? "bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                        : "hover:bg-primary/10 hover:border-primary/30"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Admin</span>
                  </Button>
                </ProtectedRoute>

                <Button
                  variant={currentView === "analytics" ? "default" : "outline"}
                  onClick={() => setCurrentView("analytics")}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    currentView === "analytics"
                      ? "bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                      : "hover:bg-primary/10 hover:border-primary/30"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user.displayName || "Admin User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentView === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scanner & Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <BarcodeScanner onProductScanned={handleProductScanned} cart={cart} />

              <Card className="card-hover bg-gradient-to-br from-card to-card/80 border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-serif font-bold">Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-white to-primary/5 hover:from-primary/10 hover:to-primary/20 border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <Package className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">Add Product</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-white to-secondary/5 hover:from-secondary/10 hover:to-secondary/20 border-secondary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <ShoppingCart className="h-6 w-6 text-secondary" />
                      <span className="text-sm font-medium">View Cart</span>
                      {getTotalItems() > 0 && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          {getTotalItems()}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-white to-green-50 hover:from-green-50 hover:to-green-100 border-green-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium">Daily Sales</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2 bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 border-blue-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shopping Cart */}
            <div>
              <ShoppingCartComponent
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
                total={getTotal()}
                totalItems={getTotalItems()}
              />
            </div>
          </div>
        )}

        {currentView === "admin" && (
          <ProtectedRoute>
            <ProductManagement />
          </ProtectedRoute>
        )}

        {currentView === "analytics" && (
          <div className="space-y-6">
            <Tabs defaultValue="dashboard" className="space-y-4">
              <TabsList className="bg-card/50 backdrop-blur-sm">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Purchase History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="history">
                <PurchaseHistory />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
