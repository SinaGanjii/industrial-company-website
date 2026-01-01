// Report Generation Service - Period-Based Cost System
// OOP approach for automatic report generation with period-based costs

import type { 
  Product, 
  Production, 
  Sale, 
  Cost, 
  DailyReport, 
  MonthlyReport 
} from "../types"
import { StockService } from "./StockService"
import { CostService } from "./CostService"

export class ReportService {
  /**
   * Generate daily report with period-based costs
   */
  static generateDailyReport(
    date: string,
    productions: Production[],
    sales: Sale[],
    costs: Cost[]
  ): DailyReport {
    const dayProductions = productions.filter((p) => p.date === date)
    const daySales = sales.filter((s) => s.date === date)
    
    // Collect costs for this day using period-based logic
    const dayCosts = CostService.getCostsForDay(date, costs)

    const productionTotal = dayProductions.reduce((sum, p) => sum + p.quantity, 0)
    const salesTotal = daySales.reduce((sum, s) => sum + s.totalPrice, 0)
    const salesQuantity = daySales.reduce((sum, s) => sum + s.quantity, 0)
    
    const { total: expensesTotal } = CostService.calculateTotalCostsByType(dayCosts)
    const profit = salesTotal - expensesTotal

    return {
      date,
      production: {
        totalQuantity: productionTotal,
        products: dayProductions.map((p) => ({
          productId: p.productId,
          productName: p.productName,
          quantity: p.quantity,
        })),
      },
      sales: {
        totalAmount: salesTotal,
        totalQuantity: salesQuantity,
        count: daySales.length,
      },
      expenses: {
        totalAmount: expensesTotal,
        costs: dayCosts,
      },
      profit,
    }
  }

  /**
   * Generate monthly report with period-based costs
   */
  static generateMonthlyReport(
    month: string,
    year: string,
    products: Product[],
    productions: Production[],
    sales: Sale[],
    costs: Cost[]
  ): MonthlyReport {
    const monthProductions = productions.filter((p) => {
      const [pYear, pMonth] = p.date.split("/")
      return pYear === year && pMonth === month
    })

    const monthSales = sales.filter((s) => {
      const [sYear, sMonth] = s.date.split("/")
      return sYear === year && sMonth === month
    })

    // Collect costs for this month using period-based logic
    const monthCosts = CostService.getCostsForMonth(year, month, costs)

    const productionTotal = monthProductions.reduce((sum, p) => sum + p.quantity, 0)
    const salesTotal = monthSales.reduce((sum, s) => sum + s.totalPrice, 0)
    const salesQuantity = monthSales.reduce((sum, s) => sum + s.quantity, 0)
    
    const { total: costsTotal, byType: costsByTypeMap } = CostService.calculateTotalCostsByType(monthCosts)
    
    // Convert costs by type to array
    const costsByTypeArray = Array.from(costsByTypeMap.entries()).map(([type, amount]) => {
      const cost = monthCosts.find((c) => c.type === type)
      return {
        type,
        typeLabel: cost?.typeLabel || type,
        amount,
      }
    })


    // Group production by product
    const productionByProduct = new Map<string, number>()
    monthProductions.forEach((p) => {
      const current = productionByProduct.get(p.productId) || 0
      productionByProduct.set(p.productId, current + p.quantity)
    })

    return {
      month,
      year,
      production: {
        totalQuantity: productionTotal,
        byProduct: Array.from(productionByProduct.entries()).map(([productId, quantity]) => {
          const product = products.find((p) => p.id === productId)
          return {
            productId,
            productName: product?.name || "",
            quantity,
          }
        }),
      },
      sales: {
        totalAmount: salesTotal,
        totalQuantity: salesQuantity,
        count: monthSales.length,
      },
      costs: {
        totalAmount: costsTotal,
        byType: costsByTypeArray,
      },
      profit: salesTotal - costsTotal,
    }
  }

  /**
   * Generate custom date range report with period-based costs
   */
  static generateCustomReport(
    startDate: string,
    endDate: string,
    products: Product[],
    productions: Production[],
    sales: Sale[],
    costs: Cost[]
  ): MonthlyReport {
    const rangeProductions = productions.filter((p) => p.date >= startDate && p.date <= endDate)
    const rangeSales = sales.filter((s) => s.date >= startDate && s.date <= endDate)
    
    // Collect costs for this range using period-based logic
    const rangeCosts = CostService.collectCostsForPeriod(startDate, endDate, costs)

    // Use first date as month/year reference for display
    const [year, month] = startDate.split("/")

    const productionTotal = rangeProductions.reduce((sum, p) => sum + p.quantity, 0)
    const salesTotal = rangeSales.reduce((sum, s) => sum + s.totalPrice, 0)
    const salesQuantity = rangeSales.reduce((sum, s) => sum + s.quantity, 0)
    
    const { total: costsTotal, byType: costsByTypeMap } = CostService.calculateTotalCostsByType(rangeCosts)
    
    // Convert costs by type to array
    const costsByTypeArray = Array.from(costsByTypeMap.entries()).map(([type, amount]) => {
      const cost = rangeCosts.find((c) => c.type === type)
      return {
        type,
        typeLabel: cost?.typeLabel || type,
        amount,
      }
    })

    // Group production by product
    const productionByProduct = new Map<string, number>()
    rangeProductions.forEach((p) => {
      const current = productionByProduct.get(p.productId) || 0
      productionByProduct.set(p.productId, current + p.quantity)
    })

    return {
      month,
      year,
      production: {
        totalQuantity: productionTotal,
        byProduct: Array.from(productionByProduct.entries()).map(([productId, quantity]) => {
          const product = products.find((p) => p.id === productId)
          return {
            productId,
            productName: product?.name || "",
            quantity,
          }
        }),
      },
      sales: {
        totalAmount: salesTotal,
        totalQuantity: salesQuantity,
        count: rangeSales.length,
      },
      costs: {
        totalAmount: costsTotal,
        byType: costsByTypeArray,
      },
      profit: salesTotal - costsTotal,
    }
  }
}
