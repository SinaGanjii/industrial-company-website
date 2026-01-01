// Costs Database Service
// CRUD operations for costs table - Uses secure API routes

import type { Cost } from "../../types"
import { dbCostToTS, tsCostToDB } from "./utils"

const API_BASE = "/api/admin/costs"

export class CostsDB {
  /**
   * Get all costs
   */
  static async getAll(): Promise<Cost[]> {
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
      const data = result.data || []
      return data.map(dbCostToTS)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[CostsDB.getAll] Error fetching costs:", error)
      }
      throw new Error("Failed to fetch costs")
    }
  }

  /**
   * Get costs by type
   */
  static async getByType(type: Cost["type"]): Promise<Cost[]> {
    try {
      const allCosts = await this.getAll()
      return allCosts.filter((c) => c.type === type)
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
      const allCosts = await this.getAll()
      return allCosts.filter((c) => c.date === date || c.periodValue === date)
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
      const allCosts = await this.getAll()
      return allCosts.filter((c) => c.productId === productId)
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
      return result.data ? dbCostToTS(result.data) : null
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
      const dbCost = tsCostToDB(cost)

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: cost.type,
          typeLabel: cost.typeLabel,
          amount: cost.amount,
          date: cost.date || cost.periodValue,
          description: cost.description,
          productId: cost.productId,
          productionDate: cost.productionDate,
          periodType: cost.periodType,
          periodValue: cost.periodValue,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[CostsDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbCostToTS(result.data)
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
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
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
      const allCosts = await this.getAll()
      return allCosts.filter((c) => {
        const costDate = c.date || c.periodValue
        return costDate >= startDate && costDate <= endDate
      })
    } catch (error) {
      console.error("Error fetching costs by date range:", error)
      throw new Error("Failed to fetch costs")
    }
  }
}

