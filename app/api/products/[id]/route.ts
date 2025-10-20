import { connectDB, Product } from "@/lib/mongodb"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()

    const sizeList =
      typeof body.size_list === "string" ? body.size_list.split(",").map((s: string) => s.trim()) : body.size_list || []
    const materials =
      typeof body.materials === "string" ? body.materials.split(",").map((m: string) => m.trim()) : body.materials || []
    const imageUrls = Array.isArray(body.image_urls) ? body.image_urls : []

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        product_name: body.product_name,
        description: body.description,
        size_list: sizeList,
        price: Number(body.price),
        discount: Number(body.discount),
        stock: Number(body.stock),
        image_urls: imageUrls,
        materials: materials,
        avg_rating: Number(body.avg_rating),
        units_sold: Number(body.units_sold),
        category: body.category,
        gender: body.gender,
      },
      { new: true },
    )

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    await Product.findByIdAndDelete(id)

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
