// Cost Management Service - Period-Based System
// OOP approach for period-based cost calculations and allocation

import type { Cost, Production } from "../types"
import { calculateDaysBetweenPersianDates } from "../utils/dateUtils"

/**
 * Period-based cost allocation system
 * Costs are linked to periods (daily, monthly, yearly) and allocated proportionally to products
 */
export class CostService {
  /**
   * Extract year from Persian date string (YYYY/MM/DD or YYYY/MM or YYYY)
   */
  private static extractYear(dateOrPeriod: string | undefined): string {
    if (!dateOrPeriod) return ""
    const normalized = this.convertToWesternDigits(dateOrPeriod)
    return normalized.split("/")[0] || ""
  }

  /**
   * Extract month from Persian date string (YYYY/MM/DD or YYYY/MM)
   */
  private static extractMonth(dateOrPeriod: string | undefined): string {
    if (!dateOrPeriod) return ""
    const normalized = this.convertToWesternDigits(dateOrPeriod)
    const parts = normalized.split("/")
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : ""
  }

  /**
   * Convert Persian/Arabic digits to Western digits
   */
  private static convertToWesternDigits(str: string): string {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
    const westernDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    
    let result = str
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(persianDigits[i], "g"), westernDigits[i])
      result = result.replace(new RegExp(arabicDigits[i], "g"), westernDigits[i])
    }
    return result
  }

  /**
   * Check if a date is within a date range
   * Normalizes both dates to Western digits before comparison
   */
  private static isDateInRange(date: string | undefined, startDate: string | undefined, endDate: string | undefined): boolean {
    if (!date || !startDate || !endDate) return false
    
    // Convert all to Western digits for comparison
    const normalizedDate = this.convertToWesternDigits(date)
    const normalizedStart = this.convertToWesternDigits(startDate)
    const normalizedEnd = this.convertToWesternDigits(endDate)
    
    return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd
  }

  /**
   * Check if a month is within a date range
   */
  private static isMonthInRange(month: string | undefined, startDate: string | undefined, endDate: string | undefined): boolean {
    if (!month || !startDate || !endDate) return false
    const startMonth = this.extractMonth(startDate)
    const endMonth = this.extractMonth(endDate)
    if (!startMonth || !endMonth) return false
    return month >= startMonth && month <= endMonth
  }

  /**
   * Check if a year is within a date range
   */
  private static isYearInRange(year: string | undefined, startDate: string | undefined, endDate: string | undefined): boolean {
    if (!year || !startDate || !endDate) return false
    const startYear = this.extractYear(startDate)
    const endYear = this.extractYear(endDate)
    if (!startYear || !endYear) return false
    return year >= startYear && year <= endYear
  }

  /**
   * Calculate number of days in a date range
   */
  private static calculateDaysInRange(startDate: string, endDate: string): number {
    return calculateDaysBetweenPersianDates(startDate, endDate)
  }

  /**
   * Collect costs for a given period
   * Includes daily, monthly, and yearly costs with proper allocation
   */
  static collectCostsForPeriod(
    startDate: string | undefined,
    endDate: string | undefined,
    allCosts: Cost[]
  ): Cost[] {
    // Validate inputs
    if (!startDate || !endDate) {
      console.warn("[CostService.collectCostsForPeriod] Invalid dates:", { startDate, endDate })
      return []
    }

    console.log("[CostService.collectCostsForPeriod] Collecting costs for period:", { startDate, endDate })
    console.log("[CostService.collectCostsForPeriod] Available costs:", allCosts.map(c => ({
      id: c.id,
      periodType: c.periodType,
      periodValue: c.periodValue,
      amount: c.amount
    })))

    const includedCosts: Cost[] = []
    const daysInRange = this.calculateDaysInRange(startDate, endDate)

    for (const cost of allCosts) {
      // Validate cost has required fields
      if (!cost.periodType || !cost.periodValue) {
        console.warn("[CostService.collectCostsForPeriod] Invalid cost:", cost)
        continue
      }

      if (cost.periodType === "daily") {
        // Include daily costs if date is in range
        // Normalize both dates to Western digits for comparison
        const normalizedCostDate = this.convertToWesternDigits(cost.periodValue)
        const normalizedStart = this.convertToWesternDigits(startDate)
        const normalizedEnd = this.convertToWesternDigits(endDate)
        const isInRange = normalizedCostDate >= normalizedStart && normalizedCostDate <= normalizedEnd
        
        console.log("[CostService.collectCostsForPeriod] Daily cost check:", {
          costPeriodValue: cost.periodValue,
          normalizedCostDate,
          startDate,
          normalizedStart,
          endDate,
          normalizedEnd,
          isInRange
        })
        if (isInRange) {
          includedCosts.push(cost)
        }
      } else if (cost.periodType === "monthly") {
        // Include monthly costs if month is in range
        const costMonth = cost.periodValue // Format: YYYY/MM
        const isInRange = this.isMonthInRange(costMonth, startDate, endDate)
        console.log("[CostService.collectCostsForPeriod] Monthly cost check:", {
          costPeriodValue: cost.periodValue,
          startDate,
          endDate,
          isInRange
        })
        if (isInRange) {
          includedCosts.push(cost)
        }
      }
    }

    console.log("[CostService.collectCostsForPeriod] Found costs:", includedCosts.length, includedCosts)
    return includedCosts
  }

  /**
   * Calculate total costs for a period, grouped by type
   */
  static calculateTotalCostsByType(costs: Cost[]): {
    total: number
    byType: Map<string, number>
  } {
    const byType = new Map<string, number>()
    let total = 0

    for (const cost of costs) {
      total += cost.amount
      const current = byType.get(cost.type) || 0
      byType.set(cost.type, current + cost.amount)
    }

    return { total, byType }
  }

  /**
   * Allocate costs to products proportionally based on production quantities
   * Formula: allocated_cost(product) = total_cost * (product_qty / total_qty)
   */
  static allocateCostsToProducts(
    totalCost: number,
    productions: Production[]
  ): Map<string, number> {
    const allocation = new Map<string, number>()

    // Calculate total production quantity
    const totalProduction = productions.reduce((sum, p) => sum + p.quantity, 0)

    // If no production, return empty allocation
    if (totalProduction === 0) {
      return allocation
    }

    // Group productions by product
    const productionByProduct = new Map<string, number>()
    for (const prod of productions) {
      const current = productionByProduct.get(prod.productId) || 0
      productionByProduct.set(prod.productId, current + prod.quantity)
    }

    // Allocate costs proportionally
    for (const [productId, productQty] of productionByProduct) {
      const allocatedCost = totalCost * (productQty / totalProduction)
      allocation.set(productId, allocatedCost)
    }

    return allocation
  }

  /**
   * Get costs for a specific day
   */
  static getCostsForDay(date: string | undefined, allCosts: Cost[]): Cost[] {
    if (!date) {
      console.warn("[CostService.getCostsForDay] No date provided")
      return []
    }
    
    console.log("[CostService.getCostsForDay] Looking for costs for date:", date)
    console.log("[CostService.getCostsForDay] Available costs:", allCosts.map(c => ({
      id: c.id,
      periodType: c.periodType,
      periodValue: c.periodValue,
      amount: c.amount
    })))
    
    const costs = this.collectCostsForPeriod(date, date, allCosts)
    console.log("[CostService.getCostsForDay] Found costs:", costs.length, costs)
    return costs
  }

  /**
   * Get costs for a specific month
   */
  static getCostsForMonth(year: string | undefined, month: string | undefined, allCosts: Cost[]): Cost[] {
    if (!year || !month) {
      console.warn("[CostService.getCostsForMonth] Missing year or month:", { year, month })
      return []
    }
    
    // Normalize month to 2 digits (e.g., "10" stays "10", "1" becomes "01")
    const normalizedMonth = month.length === 1 ? `0${month}` : month
    const monthValue = `${year}/${normalizedMonth}`
    
    console.log("[CostService.getCostsForMonth] Looking for costs for:", { year, month, normalizedMonth, monthValue })
    
    // Filter monthly costs directly by periodValue (exact match)
    const monthlyCosts = allCosts.filter((cost) => {
      if (cost.periodType !== "monthly") return false
      
      // Normalize the cost's periodValue for comparison
      const costPeriodValue = cost.periodValue.trim()
      
      // Handle both formats: "1404/10" and "1404/10" (should be the same after conversion)
      // Split and normalize to ensure consistent format
      const costParts = costPeriodValue.split("/")
      if (costParts.length === 2) {
        const costYear = costParts[0]
        const costMonth = costParts[1].length === 1 ? `0${costParts[1]}` : costParts[1]
        const normalizedCostValue = `${costYear}/${costMonth}`
        
        const matches = normalizedCostValue === monthValue
        console.log("[CostService.getCostsForMonth] Comparing cost:", { 
          original: costPeriodValue,
          normalized: normalizedCostValue,
          target: monthValue,
          matches
        })
        
        return matches
      }
      
      return false
    })
    
    // Also include daily costs for this month and yearly costs (allocated)
    const startDate = `${year}/${normalizedMonth}/01`
    const endDate = `${year}/${normalizedMonth}/29`
    const dailyAndYearlyCosts = this.collectCostsForPeriod(startDate, endDate, allCosts)
    
    // Combine monthly costs with daily and yearly costs (exclude monthly from dailyAndYearlyCosts to avoid duplicates)
    const dailyAndYearlyOnly = dailyAndYearlyCosts.filter(c => c.periodType !== "monthly")
    const allMonthCosts = [...monthlyCosts, ...dailyAndYearlyOnly]
    
    console.log("[CostService.getCostsForMonth] Found costs:", {
      monthlyCosts: monthlyCosts.length,
      dailyAndYearlyCosts: dailyAndYearlyOnly.length,
      total: allMonthCosts.length,
      monthlyCostsDetails: monthlyCosts.map(c => ({ id: c.id, periodValue: c.periodValue, amount: c.amount }))
    })
    
    return allMonthCosts
  }

}
