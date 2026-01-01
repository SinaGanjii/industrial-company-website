// Sales Database Service
// CRUD operations for sales table - Uses secure API routes

import type { Sale } from "../../types"
import { dbSaleToTS, tsSaleToDB } from "./utils"

const API_BASE = "/api/admin/sales"

export class SalesDB {
  /**
   * Get all sales
   */
  static async getAll(): Promise<Sale[]> {
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
      return (result.data || []).map(dbSaleToTS)
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
      const allSales = await this.getAll()
      return allSales.filter((s) => s.productId === productId)
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
      const allSales = await this.getAll()
      return allSales.filter((s) => s.invoiceId === invoiceId)
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
      const allSales = await this.getAll()
      return allSales.filter((s) => s.date === date)
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
      return result.data ? dbSaleToTS(result.data) : null
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

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          invoiceId: sale.invoiceId, // Required - must come first
          customerName: sale.customerName,
          productId: sale.productId,
          productName: sale.productName,
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          totalPrice: sale.totalPrice,
          date: sale.date,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[SalesDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      const data = Array.isArray(result.data) ? result.data[0] : result.data
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
      // Validate and map sales data
      const validSales = sales.map((sale, index) => {
        // Validate required fields
        if (!sale.invoiceId) {
          throw new Error(`Sale at index ${index} is missing invoiceId`)
        }
        if (!sale.customerName) {
          throw new Error(`Sale at index ${index} is missing customerName`)
        }
        if (!sale.productId) {
          throw new Error(`Sale at index ${index} is missing productId`)
        }
        if (!sale.productName) {
          throw new Error(`Sale at index ${index} is missing productName`)
        }
        if (sale.unitPrice === null || sale.unitPrice === undefined) {
          throw new Error(`Sale at index ${index} has invalid unitPrice: ${sale.unitPrice}`)
        }
        
        return {
          invoiceId: sale.invoiceId,
          customerName: sale.customerName,
          productId: sale.productId,
          productName: sale.productName,
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          totalPrice: sale.totalPrice,
          date: sale.date,
        }
      })

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(validSales),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return (result.data || []).map(dbSaleToTS)
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
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
      const allSales = await this.getAll()
      return allSales.filter((s) => s.date >= startDate && s.date <= endDate)
    } catch (error) {
      console.error("Error fetching sales by date range:", error)
      throw new Error("Failed to fetch sales")
    }
  }
}
