// Costs Database Service
// CRUD operations for costs table

import { supabase } from "../supabase/client"
import type { Cost } from "../../types"
import { dbCostToTS, tsCostToDB } from "./utils"

export class CostsDB {
  /**
   * Get all costs
   */
  static async getAll(): Promise<Cost[]> {
    try {
      const { data, error } = await supabase
        .from("costs")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbCostToTS)
    } catch (error) {
      console.error("Error fetching costs:", error)
      throw new Error("Failed to fetch costs")
    }
  }

  /**
   * Get costs by type
   */
  static async getByType(type: Cost["type"]): Promise<Cost[]> {
    try {
      const { data, error } = await supabase
        .from("costs")
        .select("*")
        .eq("type", type)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(dbCostToTS)
    } catch (error) {
      console.error("Error fetching costs by type:", error)
      throw new Error("Failed to fetch costs")
    }
  }

  /**
   * Get costs by date
   */
  static async getByDate(date: string): Promise<Cost[]> {
    try {
      const { data, error } = await supabase
        .from("costs")
        .select("*")
        .eq("date", date)
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbCostToTS)
    } catch (error) {
      console.error("Error fetching costs by date:", error)
      throw new Error("Failed to fetch costs")
    }
  }

  /**
   * Get costs by product ID
   */
  static async getByProductId(productId: string): Promise<Cost[]> {
    try {
      const { data, error } = await supabase
        .from("costs")
        .select("*")
        .eq("product_id", productId)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(dbCostToTS)
    } catch (error) {
      console.error("Error fetching costs by product:", error)
      throw new Error("Failed to fetch costs")
    }
  }

  /**
   * Get a single cost by ID
   */
  static async getById(id: string): Promise<Cost | null> {
    try {
      const { data, error } = await supabase
        .from("costs")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      return data ? dbCostToTS(data) : null
    } catch (error) {
      console.error("Error fetching cost:", error)
      throw new Error("Failed to fetch cost")
    }
  }

  /**
   * Create a new cost
   */
  static async create(cost: Omit<Cost, "id" | "createdAt">): Promise<Cost> {
    try {
      console.log("[CostsDB.create] Starting cost creation:", cost)
      const dbCost = tsCostToDB(cost)
      console.log("[CostsDB.create] Converted to DB format:", dbCost)

      const { data, error } = await supabase
        .from("costs")
        .insert(dbCost)
        .select()
        .single()

      if (error) {
        console.error("[CostsDB.create] Supabase error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error,
        })
        console.error("[CostsDB.create] Data that was sent:", JSON.stringify(dbCost, null, 2))
        throw error
      }

      console.log("[CostsDB.create] Cost created successfully:", data)
      return dbCostToTS(data)
    } catch (error) {
      console.error("[CostsDB.create] Error creating cost:", {
        error,
        cost,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      })
      throw new Error(`Failed to create cost: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Delete a cost
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("costs").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting cost:", error)
      throw new Error("Failed to delete cost")
    }
  }

  /**
   * Get costs in date range
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Cost[]> {
    try {
      const { data, error } = await supabase
        .from("costs")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(dbCostToTS)
    } catch (error) {
      console.error("Error fetching costs by date range:", error)
      throw new Error("Failed to fetch costs")
    }
  }
}

