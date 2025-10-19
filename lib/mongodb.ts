import mongoose from "mongoose"

declare global {
  var mongooseCache: any
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

let cached = global.mongooseCache

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true },
    description: { type: String, required: true },
    size_list: [String],
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    image_urls: [String],
    materials: [String],
    avg_rating: { type: Number, default: 0 },
    units_sold: { type: Number, default: 0 },
    category: { type: String, required: true },
    gender: { type: String, required: true },
  },
  { timestamps: true },
)

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
