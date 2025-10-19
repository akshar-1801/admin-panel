"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X } from "lucide-react"

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
  avg_rating: number
  units_sold: number
  category: string
  gender: string
}

interface EditProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditProductModal({ product, isOpen, onClose, onSuccess }: EditProductModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Product | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    if (product) {
      setFormData(product)
      setPreviewUrls(product.image_urls)
      setNewImages([])
    }
  }, [product, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "discount" || name === "stock" || name === "avg_rating" || name === "units_sold"
          ? Number(value)
          : value,
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setLoading(true)
    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Upload failed")
        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      setPreviewUrls([...previewUrls, ...uploadedUrls])
      if (formData) {
        setFormData({
          ...formData,
          image_urls: [...previewUrls, ...uploadedUrls],
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index)
    setPreviewUrls(newUrls)
    if (formData) {
      setFormData({
        ...formData,
        image_urls: newUrls,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${formData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_urls: previewUrls,
        }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="product_name"
              placeholder="Product Name"
              value={formData.product_name}
              onChange={handleInputChange}
              required
            />
            <Input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>

          <Textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <Input
              name="discount"
              type="number"
              placeholder="Discount %"
              value={formData.discount}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="stock"
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
            <Input name="gender" placeholder="Gender" value={formData.gender} onChange={handleInputChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="avg_rating"
              type="number"
              placeholder="Rating"
              step="0.1"
              value={formData.avg_rating}
              onChange={handleInputChange}
            />
            <Input
              name="units_sold"
              type="number"
              placeholder="Units Sold"
              value={formData.units_sold}
              onChange={handleInputChange}
            />
          </div>

          <Input
            name="size_list"
            placeholder="Sizes (comma separated)"
            value={formData.size_list.join(", ")}
            onChange={(e) => {
              const sizes = e.target.value.split(",").map((s) => s.trim())
              setFormData({ ...formData, size_list: sizes })
            }}
          />

          <Input
            name="materials"
            placeholder="Materials (comma separated)"
            value={formData.materials.join(", ")}
            onChange={(e) => {
              const mats = e.target.value.split(",").map((m) => m.trim())
              setFormData({ ...formData, materials: mats })
            }}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
