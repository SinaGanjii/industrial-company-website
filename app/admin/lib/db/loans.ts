// Loans Database Service
// Handles CRUD operations for loan transactions

import type { Loan } from "../types"
import { dbLoanToTS, tsLoanToDB } from "./utils"

const API_BASE = "/api/admin/loans"

export class LoansDB {
  /**
   * Get all loans
   */
  static async getAll(): Promise<Loan[]> {
    try {
      const response = await fetch(API_BASE, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[LoansDB.getAll] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return result.data.map(dbLoanToTS)
    } catch (err) {
      console.error("[LoansDB.getAll] Error fetching loans:", err)
      throw err
    }
  }

  /**
   * Get loan by ID
   */
  static async getById(id: string): Promise<Loan> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[LoansDB.getById] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbLoanToTS(result.data)
    } catch (err) {
      console.error("[LoansDB.getById] Error fetching loan:", err)
      throw err
    }
  }

  /**
   * Create a new loan transaction
   */
  static async create(
    loan: Omit<Loan, "id" | "createdAt">
  ): Promise<Loan> {
    try {
      const dbLoan = tsLoanToDB(loan)

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          personId: loan.personId,
          personName: loan.personName,
          transactionType: loan.transactionType,
          amount: loan.amount,
          transactionDate: loan.transactionDate,
          description: loan.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[LoansDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbLoanToTS(result.data)
    } catch (err) {
      console.error("[LoansDB.create] Error creating loan:", err)
      throw err
    }
  }

  /**
   * Update a loan transaction
   */
  static async update(
    id: string,
    updates: Partial<Omit<Loan, "id" | "createdAt">>
  ): Promise<Loan> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[LoansDB.update] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbLoanToTS(result.data)
    } catch (err) {
      console.error("[LoansDB.update] Error updating loan:", err)
      throw err
    }
  }

  /**
   * Delete a loan transaction
   */
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[LoansDB.delete] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (err) {
      console.error("[LoansDB.delete] Error deleting loan:", err)
      throw err
    }
  }
}

