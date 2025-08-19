"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Database } from "lucide-react"

export function SeedProductsButton() {
  const [isSeeding, setIsSeeding] = useState(false)
  const { toast } = useToast()

  const handleSeedProducts = async () => {
    setIsSeeding(true)

    try {
      // Import and run the seeding script
      const { seedProducts } = await import("@/scripts/seed-products")
      await seedProducts()

      toast({
        title: "Success!",
        description: "Sample grocery products have been added to the database.",
      })

      // Refresh the page to show new products
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error seeding products:", error)
      toast({
        title: "Error",
        description: "Failed to seed products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button onClick={handleSeedProducts} disabled={isSeeding} variant="outline" className="gap-2 bg-transparent">
      {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
      {isSeeding ? "Adding Products..." : "Add Sample Products"}
    </Button>
  )
}
