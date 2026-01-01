// Salary Management Service
// OOP approach for salary calculations and management

import type { Employee, SalaryPayment } from "../types"

export class SalaryService {
  /**
   * Calculate total salary payments for an employee in a specific month
   */
  static getTotalPaidForMonth(employeeId: string, month: string, payments: SalaryPayment[]): number {
    const monthPayments = payments.filter(
      (p) => p.employeeId === employeeId && p.month === month
    )
    return Math.round(monthPayments.reduce((sum, p) => sum + p.amount, 0))
  }

  /**
   * Calculate total days worked for an employee in a specific month
   */
  static getTotalDaysWorkedForMonth(employeeId: string, month: string, payments: SalaryPayment[]): number {
    const monthPayments = payments.filter(
      (p) => p.employeeId === employeeId && p.month === month
    )
    return monthPayments.reduce((sum, p) => sum + p.daysWorked, 0)
  }

  /**
   * Calculate expected salary for a month based on daily salary and days worked
   */
  static calculateExpectedSalary(dailySalary: number, daysWorked: number): number {
    return Math.round(dailySalary * daysWorked)
  }

  /**
   * Calculate remaining salary to pay for a month
   * Note: expectedSalary is calculated from actual payment dailySalary rates
   */
  static getRemainingSalaryForMonth(
    employee: Employee,
    month: string,
    payments: SalaryPayment[]
  ): number {
    const totalPaid = this.getTotalPaidForMonth(employee.id, month, payments)
    const monthPayments = payments.filter(
      (p) => p.employeeId === employee.id && p.month === month
    )
    // Calculate expected salary from actual payment rates
    const expectedSalary = Math.round(monthPayments.reduce((sum, p) => sum + (p.dailySalary * p.daysWorked), 0))
    return Math.max(0, expectedSalary - totalPaid)
  }

  /**
   * Get salary summary for an employee in a month
   * Note: expectedSalary is calculated from actual payment dailySalary rates, not employee default
   */
  static getSalarySummaryForMonth(
    employee: Employee,
    month: string,
    payments: SalaryPayment[]
  ): {
    employeeId: string
    employeeName: string
    month: string
    dailySalary: number // Employee default (for reference)
    totalDaysWorked: number
    expectedSalary: number // Calculated from actual payment rates
    totalPaid: number
    remaining: number
    payments: SalaryPayment[]
  } {
    const monthPayments = payments.filter(
      (p) => p.employeeId === employee.id && p.month === month
    )
    const totalDaysWorked = monthPayments.reduce((sum, p) => sum + p.daysWorked, 0)
    const totalPaid = Math.round(monthPayments.reduce((sum, p) => sum + p.amount, 0))
    // Calculate expected salary from actual payment rates (each payment may have different dailySalary)
    const expectedSalary = Math.round(monthPayments.reduce((sum, p) => sum + (p.dailySalary * p.daysWorked), 0))
    const remaining = Math.max(0, expectedSalary - totalPaid)

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      month,
      dailySalary: employee.dailySalary, // Default for reference
      totalDaysWorked,
      expectedSalary,
      totalPaid,
      remaining,
      payments: monthPayments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)),
    }
  }

  /**
   * Get all salary summaries for a specific month
   */
  static getSalarySummariesForMonth(
    employees: Employee[],
    month: string,
    payments: SalaryPayment[]
  ): Array<{
    employeeId: string
    employeeName: string
    month: string
    dailySalary: number
    totalDaysWorked: number
    expectedSalary: number
    totalPaid: number
    remaining: number
    payments: SalaryPayment[]
  }> {
    return employees
      .filter((emp) => emp.isActive)
      .map((emp) => this.getSalarySummaryForMonth(emp, month, payments))
      .filter((summary) => summary.totalDaysWorked > 0 || summary.totalPaid > 0)
  }

  /**
   * Calculate total salary costs for a period
   */
  static getTotalSalaryCostsForPeriod(
    startDate: string,
    endDate: string,
    payments: SalaryPayment[]
  ): number {
    // Extract year and month from dates
    const [startYear, startMonth] = startDate.split("/")
    const [endYear, endMonth] = endDate.split("/")

    const filteredPayments = payments.filter((p) => {
      const [pYear, pMonth] = p.month.split("/")
      // Check if payment month is within range
      if (pYear === startYear && pYear === endYear) {
        return Number.parseInt(pMonth, 10) >= Number.parseInt(startMonth, 10) &&
               Number.parseInt(pMonth, 10) <= Number.parseInt(endMonth, 10)
      }
      if (pYear === startYear) {
        return Number.parseInt(pMonth, 10) >= Number.parseInt(startMonth, 10)
      }
      if (pYear === endYear) {
        return Number.parseInt(pMonth, 10) <= Number.parseInt(endMonth, 10)
      }
      return Number.parseInt(pYear, 10) > Number.parseInt(startYear, 10) &&
             Number.parseInt(pYear, 10) < Number.parseInt(endYear, 10)
    })

    return Math.round(filteredPayments.reduce((sum, p) => sum + p.amount, 0))
  }
}

