// Invoice Items Database Service
// CRUD operations for invoice_items table

import { supabase } from "../supabase/client"
import type { InvoiceItem } from "../../types"
import { dbInvoiceItemToTS, tsInvoiceItemToDB } from "./utils"

export class InvoiceItemsDB {
  /**
   * Get all items for an invoice
   */
  static async getByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: true })

      if (error) throw error

      return (data || []).map(dbInvoiceItemToTS)
    } catch (error) {
      console.error("Error fetching invoice items:", error)
      throw new Error("Failed to fetch invoice items")
    }
  }

  /**
   * Create invoice items for an invoice
   */
  static async createMany(
    invoiceId: string,
    items: InvoiceItem[]
  ): Promise<InvoiceItem[]> {
    try {
      const dbItems = items.map((item) => tsInvoiceItemToDB(item, invoiceId))

      const { data, error } = await supabase
        .from("invoice_items")
        .insert(dbItems)
        .select()

      if (error) throw error

      return (data || []).map(dbInvoiceItemToTS)
    } catch (error) {
      console.error("Error creating invoice items:", error)
      throw new Error("Failed to create invoice items")
    }
  }

  /**
   * Delete all items for an invoice
   */
  static async deleteByInvoiceId(invoiceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoiceId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting invoice items:", error)
      throw new Error("Failed to delete invoice items")
    }
  }

  /**
   * Delete a single invoice item
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("invoice_items")
        .delete()
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting invoice item:", error)
      throw new Error("Failed to delete invoice item")
    }
  }
}

