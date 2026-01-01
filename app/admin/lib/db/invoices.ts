// Invoices Database Service
// CRUD operations for invoices table

import { supabase } from "../supabase/client"
import type { Invoice, InvoiceItem } from "../../types"
import { dbInvoiceToTS, tsInvoiceToDB } from "./utils"
import { InvoiceItemsDB } from "./invoice_items"

export class InvoicesDB {
  /**
   * Get all invoices
   */
  static async getAll(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error

      // Fetch items for each invoice
      const invoices: Invoice[] = []
      for (const invoiceRow of data || []) {
        const items = await InvoiceItemsDB.getByInvoiceId(invoiceRow.id)
        invoices.push(dbInvoiceToTS(invoiceRow, items))
      }

      return invoices
    } catch (error) {
      console.error("Error fetching invoices:", error)
      throw new Error("Failed to fetch invoices")
    }
  }

  /**
   * Get invoices by status
   */
  static async getByStatus(status: Invoice["status"]): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("status", status)
        .order("date", { ascending: false })

      if (error) throw error

      const invoices: Invoice[] = []
      for (const invoiceRow of data || []) {
        const items = await InvoiceItemsDB.getByInvoiceId(invoiceRow.id)
        invoices.push(dbInvoiceToTS(invoiceRow, items))
      }

      return invoices
    } catch (error) {
      console.error("Error fetching invoices by status:", error)
      throw new Error("Failed to fetch invoices")
    }
  }

  /**
   * Get a single invoice by ID
   */
  static async getById(id: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      if (!data) return null

      const items = await InvoiceItemsDB.getByInvoiceId(id)
      return dbInvoiceToTS(data, items)
    } catch (error) {
      console.error("Error fetching invoice:", error)
      throw new Error("Failed to fetch invoice")
    }
  }

  /**
   * Get invoice by invoice number
   */
  static async getByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("invoice_number", invoiceNumber)
        .single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      if (!data) return null

      const items = await InvoiceItemsDB.getByInvoiceId(data.id)
      return dbInvoiceToTS(data, items)
    } catch (error) {
      console.error("Error fetching invoice by number:", error)
      throw new Error("Failed to fetch invoice")
    }
  }

  /**
   * Create a new invoice with items
   */
  static async create(
    invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">,
    items: InvoiceItem[]
  ): Promise<Invoice> {
    try {
      console.log("[InvoicesDB.create] Starting invoice creation:", { invoice, itemsCount: items.length })
      const dbInvoice = tsInvoiceToDB(invoice)

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert(dbInvoice)
        .select()
        .single()

      if (invoiceError) {
        console.error("[InvoicesDB.create] Supabase error (invoice):", {
          code: invoiceError.code,
          message: invoiceError.message,
          details: invoiceError.details,
          hint: invoiceError.hint,
        })
        throw invoiceError
      }

      console.log("[InvoicesDB.create] Invoice created, ID:", invoiceData.id)

      // Create invoice items
      if (items.length > 0) {
        console.log("[InvoicesDB.create] Creating invoice items...")
        await InvoiceItemsDB.createMany(invoiceData.id, items)
        console.log("[InvoicesDB.create] Invoice items created")
      }

      // Fetch complete invoice with items
      const completeInvoice = await this.getById(invoiceData.id)
      if (!completeInvoice) throw new Error("Failed to fetch created invoice")

      console.log("[InvoicesDB.create] Invoice created successfully")
      return completeInvoice
    } catch (error) {
      console.error("[InvoicesDB.create] Error creating invoice:", {
        error,
        invoice,
        itemsCount: items.length,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to create invoice: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Update an existing invoice
   */
  static async update(
    id: string,
    updates: Partial<Omit<Invoice, "id" | "createdAt" | "updatedAt" | "items">>,
    items?: InvoiceItem[]
  ): Promise<Invoice> {
    try {
      const updateData: any = {}
      if (updates.invoiceNumber !== undefined) updateData.invoice_number = updates.invoiceNumber
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.customerName !== undefined) updateData.customer_name = updates.customerName
      if (updates.customerInfo !== undefined) {
        updateData.customer_address = updates.customerInfo.address || null
        updateData.customer_phone = updates.customerInfo.phone || null
        updateData.customer_tax_id = updates.customerInfo.taxId || null
      }
      if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal
      if (updates.tax !== undefined) updateData.tax = updates.tax || null
      if (updates.total !== undefined) updateData.total = updates.total
      if (updates.date !== undefined) updateData.date = updates.date
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate || null
      if (updates.paidDate !== undefined) updateData.paid_date = updates.paidDate || null
      if (updates.notes !== undefined) updateData.notes = updates.notes || null

      const { error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", id)

      if (error) throw error

      // Update items if provided
      if (items !== undefined) {
        await InvoiceItemsDB.deleteByInvoiceId(id)
        if (items.length > 0) {
          await InvoiceItemsDB.createMany(id, items)
        }
      }

      // Fetch updated invoice
      const updatedInvoice = await this.getById(id)
      if (!updatedInvoice) throw new Error("Failed to fetch updated invoice")

      return updatedInvoice
    } catch (error) {
      console.error("Error updating invoice:", error)
      throw new Error("Failed to update invoice")
    }
  }

  /**
   * Delete an invoice (will cascade delete items)
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting invoice:", error)
      throw new Error("Failed to delete invoice")
    }
  }

  /**
   * Get invoices in date range
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error

      const invoices: Invoice[] = []
      for (const invoiceRow of data || []) {
        const items = await InvoiceItemsDB.getByInvoiceId(invoiceRow.id)
        invoices.push(dbInvoiceToTS(invoiceRow, items))
      }

      return invoices
    } catch (error) {
      console.error("Error fetching invoices by date range:", error)
      throw new Error("Failed to fetch invoices")
    }
  }
}

