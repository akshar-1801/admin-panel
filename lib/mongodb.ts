import mongoose from "mongoose"

// ----------------------------------------------------
// Type Definitions for Global Cache
// ----------------------------------------------------
declare global {
  // Define the structure for your global mongoose cache
  var mongooseCache: { 
    conn: typeof mongoose | null; 
    promise: Promise<typeof mongoose> | null; 
  }
}

// ----------------------------------------------------
// Mongoose Connection Setup
// ----------------------------------------------------
// MONGODB_URI is inferred as string | undefined
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  // Runtime check ensures the app stops if the variable is missing
  throw new Error("Please define the MONGODB_URI environment variable")
}

// Use the global cache or initialize it
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

    // FIX: Use the non-null assertion operator (!) on MONGODB_URI
    // This tells TypeScript the value is definitely a string, 
    // relying on the check above.
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
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

// ----------------------------------------------------
// Mongoose Schema and Model Definition
// ----------------------------------------------------
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

// Ensure the model is only compiled once
export const Product = mongoose.models.Product || mongoose.model("Product", productSchema)