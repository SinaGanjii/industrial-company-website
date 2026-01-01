// Invoices Database Service
// CRUD operations for invoices table - Uses secure API routes

import type { Invoice, InvoiceItem } from "../../types"
import { dbInvoiceToTS, tsInvoiceToDB } from "./utils"

const API_BASE = "/api/admin/invoices"

export class InvoicesDB {
  /**
   * Get all invoices
   */
  static async getAll(): Promise<Invoice[]> {
    try {
      const response = await fetch(API_BASE, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      // Items are already in DB format from API, pass them directly to dbInvoiceToTS
      return (result.data || []).map((invoiceRow: any) => {
        const items = invoiceRow.items || []
        return dbInvoiceToTS(invoiceRow, items)
      })
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
      const allInvoices = await this.getAll()
      return allInvoices.filter((inv) => inv.status === status)
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
      if (!result.data) return null

      // Items are already in DB format from API, pass them directly to dbInvoiceToTS
      const items = result.data.items || []
      return dbInvoiceToTS(result.data, items)
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
      const allInvoices = await this.getAll()
      return allInvoices.find((inv) => inv.invoiceNumber === invoiceNumber) || null
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
      const dbInvoice = tsInvoiceToDB(invoice)

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          customerName: invoice.customerName,
          customerInfo: invoice.customerInfo,
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          tax: invoice.tax,
          total: invoice.total,
          date: invoice.date,
          dueDate: invoice.dueDate,
          paidDate: invoice.paidDate,
          notes: invoice.notes,
          items: items,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[InvoicesDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      const invoiceData = result.data

      // Items are already in DB format from API, pass them directly to dbInvoiceToTS
      const invoiceItems = invoiceData.items || []

      return dbInvoiceToTS(invoiceData, invoiceItems)
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
      if (updates.invoiceNumber !== undefined) updateData.invoiceNumber = updates.invoiceNumber
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.customerName !== undefined) updateData.customerName = updates.customerName
      if (updates.customerInfo !== undefined) updateData.customerInfo = updates.customerInfo
      if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal
      if (updates.discount !== undefined) updateData.discount = updates.discount
      if (updates.tax !== undefined) updateData.tax = updates.tax
      if (updates.total !== undefined) updateData.total = updates.total
      if (updates.date !== undefined) updateData.date = updates.date
      if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate
      if (updates.paidDate !== undefined) updateData.paidDate = updates.paidDate
      if (updates.notes !== undefined) updateData.notes = updates.notes
      // Only include items if explicitly provided and they are valid
      if (items !== undefined && Array.isArray(items) && items.length > 0) {
        // Validate items have all required fields
        const validItems = items.filter(item => 
          item.productId && item.productName && item.unitPrice !== null && item.unitPrice !== undefined
        )
        if (validItems.length > 0) {
          updateData.items = validItems
        }
      }

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
      const invoiceData = result.data

      // Items are already in DB format, pass them directly to dbInvoiceToTS
      // which will convert them using dbInvoiceItemToTS
      const invoiceItems = invoiceData.items || []

      return dbInvoiceToTS(invoiceData, invoiceItems)
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
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
      const allInvoices = await this.getAll()
      return allInvoices.filter((inv) => inv.date >= startDate && inv.date <= endDate)
    } catch (error) {
      console.error("Error fetching invoices by date range:", error)
      throw new Error("Failed to fetch invoices")
    }
  }
}
