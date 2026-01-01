// Products Database Service
// CRUD operations for products table - Uses secure API routes

import type { Product } from "../../types"
import { dbProductToTS, tsProductToDB } from "./utils"

const API_BASE = "/api/admin/products"

export class ProductsDB {
  /**
   * Get all products
   */
  static async getAll(): Promise<Product[]> {
    try {
      console.log("[ProductsDB.getAll] Fetching all products...")
      const response = await fetch(API_BASE, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      const data = result.data || []
      console.log("[ProductsDB.getAll] Fetched products count:", data.length)
      return data.map(dbProductToTS)
    } catch (error) {
      console.error("[ProductsDB.getAll] Error fetching products:", {
        error,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to fetch products: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Get a single product by ID
   */
  static async getById(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        credentials: "include",
      })

      if (response.status === 404) return null
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.data ? dbProductToTS(result.data) : null
    } catch (error) {
      console.error("Error fetching product:", error)
      throw new Error("Failed to fetch product")
    }
  }

  /**
   * Create a new product
   */
  static async create(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    try {
      console.log("[ProductsDB.create] Starting product creation:", product)
      const dbProduct = tsProductToDB(product)
      console.log("[ProductsDB.create] Converted to DB format:", dbProduct)

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: product.name,
          dimensions: product.dimensions,
          material: product.material,
          unitPrice: product.unitPrice,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log("[ProductsDB.create] Product created successfully:", result.data)
      return dbProductToTS(result.data)
    } catch (error) {
      console.error("[ProductsDB.create] Error creating product:", {
        error,
        product,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Update an existing product
   */
  static async update(
    id: string,
    updates: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
  ): Promise<Product> {
    try {
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.dimensions !== undefined) updateData.dimensions = updates.dimensions
      if (updates.material !== undefined) updateData.material = updates.material
      if (updates.unitPrice !== undefined) updateData.unitPrice = updates.unitPrice

      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbProductToTS(result.data)
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error("Failed to update product")
    }
  }

  /**
   * Delete a product
   */
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error("Failed to delete product")
    }
  }

  /**
   * Search products by name
   */
  static async searchByName(searchTerm: string): Promise<Product[]> {
    try {
      // Fetch all and filter client-side (or add search endpoint later)
      const allProducts = await this.getAll()
      return allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error("Error searching products:", error)
      throw new Error("Failed to search products")
    }
  }
}

