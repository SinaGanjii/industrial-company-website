// Productions Database Service
// CRUD operations for productions table - Uses secure API routes

import type { Production } from "../../types"
import { dbProductionToTS, tsProductionToDB } from "./utils"

const API_BASE = "/api/admin/productions"

export class ProductionsDB {
  /**
   * Get all productions
   */
  static async getAll(): Promise<Production[]> {
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
      return (result.data || []).map(dbProductionToTS)
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
      const allProductions = await this.getAll()
      return allProductions.filter((p) => p.productId === productId)
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
      const allProductions = await this.getAll()
      return allProductions.filter((p) => p.date === date)
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
      return result.data ? dbProductionToTS(result.data) : null
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

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: production.productId,
          quantity: production.quantity,
          date: production.date,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[ProductionsDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log("[ProductionsDB.create] Production created successfully")
      return dbProductionToTS(result.data)
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
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
      const allProductions = await this.getAll()
      return allProductions.filter((p) => p.date >= startDate && p.date <= endDate)
    } catch (error) {
      console.error("Error fetching productions by date range:", error)
      throw new Error("Failed to fetch productions")
    }
  }
}
