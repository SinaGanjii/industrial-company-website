// Employees Database Service
// CRUD operations for employees table - Uses secure API routes

import type { Employee } from "../../types"
import { dbEmployeeToTS, tsEmployeeToDB } from "./utils"

const API_BASE = "/api/admin/employees"

export class EmployeesDB {
  /**
   * Get all employees
   */
  static async getAll(): Promise<Employee[]> {
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
      return (result.data || []).map(dbEmployeeToTS)
    } catch (error) {
      console.error("Error fetching employees:", error)
      throw new Error("Failed to fetch employees")
    }
  }

  /**
   * Get active employees only
   */
  static async getActive(): Promise<Employee[]> {
    try {
      const employees = await this.getAll()
      return employees.filter((emp) => emp.isActive)
    } catch (error) {
      console.error("Error fetching active employees:", error)
      throw new Error("Failed to fetch active employees")
    }
  }

  /**
   * Get employee by ID
   */
  static async getById(id: string): Promise<Employee | null> {
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

      return dbEmployeeToTS(result.data)
    } catch (error) {
      console.error("Error fetching employee:", error)
      throw new Error("Failed to fetch employee")
    }
  }

  /**
   * Create a new employee
   */
  static async create(employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Promise<Employee> {
    try {
      const dbEmployee = tsEmployeeToDB(employee)

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: employee.name,
          phone: employee.phone,
          address: employee.address,
          dailySalary: employee.dailySalary,
          isActive: employee.isActive,
          notes: employee.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[EmployeesDB.create] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbEmployeeToTS(result.data)
    } catch (error) {
      console.error("[EmployeesDB.create] Error creating employee:", {
        error,
        employee,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Update an existing employee
   */
  static async update(
    id: string,
    updates: Partial<Omit<Employee, "id" | "createdAt" | "updatedAt">>
  ): Promise<Employee> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[EmployeesDB.update] API error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      return dbEmployeeToTS(result.data)
    } catch (error) {
      console.error("[EmployeesDB.update] Error updating employee:", {
        error,
        id,
        updates,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to update employee: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Delete an employee
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
      console.error("[EmployeesDB.delete] Error deleting employee:", {
        error,
        id,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`Failed to delete employee: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

