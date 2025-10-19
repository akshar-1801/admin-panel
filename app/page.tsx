import { ProductForm } from "@/components/product-form"
import { ProductsList } from "@/components/products-list"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your products with ease</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProductForm />
          </div>
          <div className="lg:col-span-2">
            <ProductsList />
          </div>
        </div>
      </div>
    </main>
  )
}
