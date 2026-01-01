// Sales Database Service
// CRUD operations for sales table

import { supabase } from "../supabase/client"
import type { Sale } from "../../types"
import { dbSaleToTS, tsSaleToDB } from "./utils"

export class SalesDB {
  /**
   * Get all sales
   */
  static async getAll(): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbSaleToTS)
    } catch (error) {
      console.error("Error fetching sales:", error)
      throw new Error("Failed to fetch sales")
    }
  }

  /**
   * Get sales by product ID
   */
  static async getByProductId(productId: string): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("product_id", productId)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(dbSaleToTS)
    } catch (error) {
      console.error("Error fetching sales by product:", error)
      throw new Error("Failed to fetch sales")
    }
  }

  /**
   * Get sales by invoice ID
   */
  static async getByInvoiceId(invoiceId: string): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbSaleToTS)
    } catch (error) {
      console.error("Error fetching sales by invoice:", error)
      throw new Error("Failed to fetch sales")
    }
  }

  /**
   * Get sales by date
   */
  static async getByDate(date: string): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("date", date)
        .order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map(dbSaleToTS)
    } catch (error) {
      console.error("Error fetching sales by date:", error)
      throw new Error("Failed to fetch sales")
    }
  }

  /**
   * Get a single sale by ID
   */
  static async getById(id: string): Promise<Sale | null> {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      return data ? dbSaleToTS(data) : null
    } catch (error) {
      console.error("Error fetching sale:", error)
      throw new Error("Failed to fetch sale")
    }
  }

  /**
   * Create a new sale
   */
  static async create(sale: Omit<Sale, "id" | "createdAt">): Promise<Sale> {
    try {
      console.log("[SalesDB.create] Starting sale creation:", sale)
      const dbSale = tsSaleToDB(sale)

      const { data, error } = await supabase
        .from("sales")
        .insert(dbSale)
        .select()
        .single()

      if (error) {
        console.error("[SalesDB.create] Supabase error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log("[SalesDB.create] Sale created successfully")
      return dbSaleToTS(data)
    } catch (error) {
      console.error("[SalesDB.create] Error creating sale:", {
        error,
        sale,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to create sale: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Create multiple sales at once
   */
  static async createMany(sales: Array<Omit<Sale, "id" | "createdAt">>): Promise<Sale[]> {
    try {
      const dbSales = sales.map(tsSaleToDB)

      const { data, error } = await supabase
        .from("sales")
        .insert(dbSales)
        .select()

      if (error) throw error

      return (data || []).map(dbSaleToTS)
    } catch (error) {
      console.error("Error creating sales:", error)
      throw new Error("Failed to create sales")
    }
  }

  /**
   * Delete a sale
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("sales").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting sale:", error)
      throw new Error("Failed to delete sale")
    }
  }

  /**
   * Get sales in date range
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error

      return (data || []).map(dbSaleToTS)
    } catch (error) {
      console.error("Error fetching sales by date range:", error)
      throw new Error("Failed to fetch sales")
    }
  }
}

