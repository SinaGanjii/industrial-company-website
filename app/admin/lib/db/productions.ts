// Productions Database Service
// CRUD operations for productions table

import { supabase } from "../supabase/client"
import type { Production } from "../../types"
import { dbProductionToTS, tsProductionToDB } from "./utils"

export class ProductionsDB {
  /**
   * Get all productions
   */
  static async getAll(): Promise<Production[]> {
    try {
      const { data, error } = await supabase
        .from("productions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbProductionToTS)
    } catch (error) {
      console.error("Error fetching productions:", error)
      throw new Error("Failed to fetch productions")
    }
  }

  /**
   * Get productions by product ID
   */
  static async getByProductId(productId: string): Promise<Production[]> {
    try {
      const { data, error } = await supabase
        .from("productions")
        .select("*")
        .eq("product_id", productId)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(dbProductionToTS)
    } catch (error) {
      console.error("Error fetching productions by product:", error)
      throw new Error("Failed to fetch productions")
    }
  }

  /**
   * Get productions by date
   */
  static async getByDate(date: string): Promise<Production[]> {
    try {
      const { data, error } = await supabase
        .from("productions")
        .select("*")
        .eq("date", date)
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbProductionToTS)
    } catch (error) {
      console.error("Error fetching productions by date:", error)
      throw new Error("Failed to fetch productions")
    }
  }

  /**
   * Get a single production by ID
   */
  static async getById(id: string): Promise<Production | null> {
    try {
      const { data, error } = await supabase
        .from("productions")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      return data ? dbProductionToTS(data) : null
    } catch (error) {
      console.error("Error fetching production:", error)
      throw new Error("Failed to fetch production")
    }
  }

  /**
   * Create a new production
   */
  static async create(production: Omit<Production, "id" | "createdAt">): Promise<Production> {
    try {
      console.log("[ProductionsDB.create] Starting production creation:", production)
      const dbProduction = tsProductionToDB(production)

      const { data, error } = await supabase
        .from("productions")
        .insert(dbProduction)
        .select()
        .single()

      if (error) {
        console.error("[ProductionsDB.create] Supabase error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log("[ProductionsDB.create] Production created successfully")
      return dbProductionToTS(data)
    } catch (error) {
      console.error("[ProductionsDB.create] Error creating production:", {
        error,
        production,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to create production: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Delete a production
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("productions").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting production:", error)
      throw new Error("Failed to delete production")
    }
  }

  /**
   * Get productions in date range
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Production[]> {
    try {
      const { data, error } = await supabase
        .from("productions")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(dbProductionToTS)
    } catch (error) {
      console.error("Error fetching productions by date range:", error)
      throw new Error("Failed to fetch productions")
    }
  }
}

