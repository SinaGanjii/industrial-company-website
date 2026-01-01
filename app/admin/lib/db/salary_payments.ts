// Salary Payments Database Service
// CRUD operations for salary_payments table - Uses secure API routes

import type { SalaryPayment } from "../../types"
import { dbSalaryPaymentToTS, tsSalaryPaymentToDB } from "./utils"

const API_BASE = "/api/admin/salary-payments"

export class SalaryPaymentsDB {
  /**
   * Get all salary payments
   */
  static async getAll(): Promise<SalaryPayment[]> {
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
      return (result.data || []).map(dbSalaryPaymentToTS)
    } catch (error) {
      console.error("Error fetching salary payments:", error)
      throw new Error("Failed to fetch salary payments")
    }
  }

  /**
   * Get salary payments by employee ID
   */
  static async getByEmployeeId(employeeId: string): Promise<SalaryPayment[]> {
    try {
      const response = await fetch(`${API_BASE}?employeeId=${employeeId}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return (result.data || []).map(dbSalaryPaymentToTS)
    } catch (error) {
      console.error("Error fetching salary payments by employee:", error)
      throw new Error("Failed to fetch salary payments")
    }
  }

  /**
   * Get salary payments by month
   */
  static async getByMonth(month: string): Promise<SalaryPayment[]> {
    try {
      const response = await fetch(`${API_BASE}?month=${month}`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return (result.data || []).map(dbSalaryPaymentToTS)
    } catch (error) {
      console.error("Error fetching salary payments by month:", error)
      throw new Error("Failed to fetch salary payments")
    }
  }

  /**
   * Create a new salary payment
   */
  static async create(
    payment: Omit<SalaryPayment, "id" | "createdAt">
  ): Promise<SalaryPayment> {
    try {
      const dbPayment = tsSalaryPaymentToDB(payment)

      // Ensure paymentMethod is set (default to "cash" if not provided)
      const paymentMethod = payment.paymentMethod || "cash"

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          employeeId: payment.employeeId,
          employeeName: payment.employeeName,
          month: payment.month,
          paymentDate: payment.paymentDate,
          dailySalary: payment.dailySalary,
          amount: payment.amount,
          daysWorked: payment.daysWorked,
          paymentMethod: paymentMethod,
          description: payment.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[SalaryPaymentsDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbSalaryPaymentToTS(result.data)
    } catch (error) {
      console.error("[SalaryPaymentsDB.create] Error creating salary payment:", {
        error,
        payment,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to create salary payment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Update an existing salary payment
   */
  static async update(
    id: string,
    updates: Partial<Omit<SalaryPayment, "id" | "createdAt">>
  ): Promise<SalaryPayment> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[SalaryPaymentsDB.update] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbSalaryPaymentToTS(result.data)
    } catch (error) {
      console.error("[SalaryPaymentsDB.update] Error updating salary payment:", {
        error,
        id,
        updates,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to update salary payment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Delete a salary payment
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
      console.error("[SalaryPaymentsDB.delete] Error deleting salary payment:", {
        error,
        id,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to delete salary payment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

