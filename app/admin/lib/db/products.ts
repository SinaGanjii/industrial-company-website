// Products Database Service
// CRUD operations for products table

import { supabase } from "../supabase/client"
import type { Product } from "../../types"
import { dbProductToTS, tsProductToDB } from "./utils"

export class ProductsDB {
  /**
   * Get all products
   */
  static async getAll(): Promise<Product[]> {
    try {
      console.log("[ProductsDB.getAll] Fetching all products...")
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[ProductsDB.getAll] Supabase error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log("[ProductsDB.getAll] Fetched products count:", data?.length || 0)
      return (data || []).map(dbProductToTS)
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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      return data ? dbProductToTS(data) : null
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

      const { data, error } = await supabase
        .from("products")
        .insert(dbProduct)
        .select()
        .single()

      if (error) {
        console.error("[ProductsDB.create] Supabase error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log("[ProductsDB.create] Product created successfully:", data)
      return dbProductToTS(data)
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
      if (updates.material !== undefined) updateData.material = updates.material || null
      if (updates.unitPrice !== undefined) updateData.unit_price = updates.unitPrice

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      return dbProductToTS(data)
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
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbProductToTS)
    } catch (error) {
      console.error("Error searching products:", error)
      throw new Error("Failed to search products")
    }
  }
}

