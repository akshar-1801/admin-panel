import { connectDB, Product } from "@/lib/mongodb"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    console.log("[v0] Received body:", body)
    console.log("[v0] size_list:", body.size_list, "Type:", Array.isArray(body.size_list))
    console.log("[v0] materials:", body.materials, "Type:", Array.isArray(body.materials))

    const sizeList =
      typeof body.size_list === "string" ? body.size_list.split(",").map((s: string) => s.trim()) : body.size_list || []
    const materials =
      typeof body.materials === "string" ? body.materials.split(",").map((m: string) => m.trim()) : body.materials || []

    const product = new Product({
      product_name: body.product_name,
      description: body.description,
      size_list: sizeList,
      price: Number(body.price) || 0,
      discount: Number(body.discount) || 0,
      stock: Number(body.stock) || 0,
      image_urls: Array.isArray(body.image_urls) ? body.image_urls : [],
      materials: materials,
      avg_rating: Number(body.avg_rating) || 0,
      units_sold: Number(body.units_sold) || 0,
      category: body.category,
      gender: body.gender,
    })

    console.log("[v0] Product to save:", product)

    const savedProduct = await product.save()

    console.log("[v0] Product saved with ID:", savedProduct._id)

    return NextResponse.json(savedProduct, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const products = await Product.find({})

    return NextResponse.json(products)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
