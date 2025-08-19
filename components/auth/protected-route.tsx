"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Access denied. Admin authentication required.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  return <>{children}</>
}
