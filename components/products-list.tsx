"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { EditProductModal } from "./edit-product-modal"
import { Trash2, Edit2 } from "lucide-react"

interface Product {
  _id: string
  product_name: string
  description: string
  price: number
  discount: number
  stock: number
  image_urls: string[]
  size_list: string[]
  materials: string[]
  category: string
  gender: string
  avg_rating: number
  units_sold: number
}

export function ProductsList() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setProducts(products.filter((p) => p._id !== id))
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
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    fetchProducts()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No products added yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-muted-foreground">Total: {products.length} products</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {product.image_urls[0] && (
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={product.image_urls[0] || "/placeholder.svg"}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{product.product_name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{product.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">₹{product.price}</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Stock</p>
                    <p className="font-semibold">{product.stock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sold</p>
                    <p className="font-semibold">{product.units_sold}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <p className="font-semibold">{product.avg_rating.toFixed(1)} ⭐</p>
                  </div>
                  <Badge variant="secondary">{product.gender}</Badge>
                </div>

                <div className="flex gap-2 mt-auto pt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product._id)}
                    disabled={deletingId === product._id}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}
