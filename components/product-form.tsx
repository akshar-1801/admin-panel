"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

interface ProductFormData {
  product_name: string
  description: string
  size_list: string[]
  price: string
  discount: string
  stock: string
  image_urls: string[]
  materials: string[]
  avg_rating: string
  units_sold: string
  category: string
  gender: string
}

export function ProductForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState<ProductFormData>({
    product_name: "",
    description: "",
    size_list: [],
    price: "0",
    discount: "0",
    stock: "0",
    image_urls: [],
    materials: [],
    avg_rating: "0",
    units_sold: "0",
    category: "",
    gender: "",
  })

  const [sizeInput, setSizeInput] = useState("")
  const [materialInput, setMaterialInput] = useState("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Upload all files
    setUploadingImage(true)
    try {
      const uploadedUrls: string[] = []
      const newPreviews: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to Cloudinary
        const formDataToSend = new FormData()
        formDataToSend.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataToSend,
        })

        if (!response.ok) throw new Error("Upload failed")

        const data = await response.json()
        uploadedUrls.push(data.secure_url)
      }

      // Wait for all previews to load
      await new Promise((resolve) => setTimeout(resolve, 100))

      setImagePreviews((prev) => [...prev, ...newPreviews])
      setFormData((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedUrls],
      }))

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload image(s)",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }))
  }

  const addSize = () => {
    if (sizeInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        size_list: [...prev.size_list, sizeInput.trim()],
      }))
      setSizeInput("")
    }
  }

  const removeSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      size_list: prev.size_list.filter((_, i) => i !== index),
    }))
  }

  const addMaterial = () => {
    if (materialInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, materialInput.trim()],
      }))
      setMaterialInput("")
    }
  }

  const removeMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_name || !formData.description || !formData.price || !formData.category || !formData.gender) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.image_urls.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create product")

      toast({
        title: "Success",
        description: "Product created successfully",
      })

      // Reset form
      setFormData({
        product_name: "",
        description: "",
        size_list: [],
        price: "0",
        discount: "0",
        stock: "0",
        image_urls: [],
        materials: [],
        avg_rating: "0",
        units_sold: "0",
        category: "",
        gender: "",
      })
      setImagePreviews([])
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Fill in the product details and upload multiple images</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              placeholder="e.g., Elegant Diamond Gold Necklace"
              value={formData.product_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, product_name: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">Product Images * (Upload multiple)</Label>
            <div className="flex flex-col gap-4">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <p className="text-sm text-muted-foreground">Uploading image(s)...</p>}

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-xs text-muted-foreground text-center mt-1">Image {index + 1}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price * (Default: 0)</Label>
              <Input
                id="price"
                type="number"
                placeholder="1200"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%) (Default: 0)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="10"
                value={formData.discount}
                onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
              />
            </div>
          </div>

          {/* Stock and Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock * (Default: 0)</Label>
              <Input
                id="stock"
                type="number"
                placeholder="15"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avg_rating">Average Rating (Default: 0)</Label>
              <Input
                id="avg_rating"
                type="number"
                placeholder="4.7"
                step="0.1"
                min="0"
                max="5"
                value={formData.avg_rating}
                onChange={(e) => setFormData((prev) => ({ ...prev, avg_rating: e.target.value }))}
              />
            </div>
          </div>

          {/* Units Sold */}
          <div className="space-y-2">
            <Label htmlFor="units_sold">Units Sold (Default: 0)</Label>
            <Input
              id="units_sold"
              type="number"
              placeholder="8"
              value={formData.units_sold}
              onChange={(e) => setFormData((prev) => ({ ...prev, units_sold: e.target.value }))}
            />
          </div>

          {/* Category and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Necklace">Necklace</SelectItem>
                  <SelectItem value="Ring">Ring</SelectItem>
                  <SelectItem value="Bracelet">Bracelet</SelectItem>
                  <SelectItem value="Earring">Earring</SelectItem>
                  <SelectItem value="Pendant">Pendant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <Label htmlFor="size_input">Sizes</Label>
            <div className="flex gap-2">
              <Input
                id="size_input"
                placeholder="e.g., S, M, L"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSize()
                  }
                }}
              />
              <Button type="button" onClick={addSize} variant="outline">
                Add
              </Button>
            </div>
            {formData.size_list.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.size_list.map((size, index) => (
                  <div
                    key={index}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="text-primary-foreground hover:opacity-70"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div className="space-y-2">
            <Label htmlFor="material_input">Materials</Label>
            <div className="flex gap-2">
              <Input
                id="material_input"
                placeholder="e.g., Gold, Diamond"
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addMaterial()
                  }
                }}
              />
              <Button type="button" onClick={addMaterial} variant="outline">
                Add
              </Button>
            </div>
            {formData.materials.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.materials.map((material, index) => (
                  <div
                    key={index}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {material}
                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="text-secondary-foreground hover:opacity-70"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading || uploadingImage}>
            {loading ? "Creating Product..." : "Create Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
