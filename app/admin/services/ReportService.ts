// Report Generation Service
// OOP approach for automatic report generation

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
   * Generate daily report
   */
  static generateDailyReport(
    date: string,
    productions: Production[],
    sales: Sale[],
    costs: Cost[]
  ): DailyReport {
    const dayProductions = productions.filter((p) => p.date === date)
    const daySales = sales.filter((s) => s.date === date)
    const dayCosts = costs.filter((c) => c.date === date)

    const productionTotal = dayProductions.reduce((sum, p) => sum + p.quantity, 0)
    const salesTotal = daySales.reduce((sum, s) => sum + s.totalPrice, 0)
    const salesQuantity = daySales.reduce((sum, s) => sum + s.quantity, 0)
    const expensesTotal = dayCosts.reduce((sum, c) => sum + c.amount, 0)

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
   * Generate monthly report
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

    const monthCosts = costs.filter((c) => {
      const [cYear, cMonth] = c.date.split("/")
      return cYear === year && cMonth === month
    })

    const productionTotal = monthProductions.reduce((sum, p) => sum + p.quantity, 0)
    const salesTotal = monthSales.reduce((sum, s) => sum + s.totalPrice, 0)
    const salesQuantity = monthSales.reduce((sum, s) => sum + s.quantity, 0)
    const costsTotal = monthCosts.reduce((sum, c) => sum + c.amount, 0)

    // Group production by product
    const productionByProduct = new Map<string, number>()
    monthProductions.forEach((p) => {
      const current = productionByProduct.get(p.productId) || 0
      productionByProduct.set(p.productId, current + p.quantity)
    })

    // Calculate profit by product
    const profitByProduct = products.map((product) => {
      const productSales = monthSales.filter((s) => s.productId === product.id)
      const revenue = productSales.reduce((sum, s) => sum + s.totalPrice, 0)
      const cost = CostService.calculateTotalProductCost(product.id, monthCosts, monthProductions)
      const profit = revenue - cost
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

      return {
        productId: product.id,
        productName: product.name,
        revenue,
        cost,
        profit,
        profitMargin,
      }
    })

    // Group costs by type
    const costsByType = CostService.getCostsByType(monthCosts)
    const costsByTypeArray = Array.from(costsByType.entries()).map(([type, amount]) => {
      const cost = monthCosts.find((c) => c.type === type)
      return {
        type,
        typeLabel: cost?.typeLabel || type,
        amount,
      }
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
      profitByProduct,
    }
  }

  /**
   * Generate custom date range report
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
    const rangeCosts = costs.filter((c) => c.date >= startDate && c.date <= endDate)

    // Use first date as month/year reference
    const [year, month] = startDate.split("/")

    return this.generateMonthlyReport(month, year, products, rangeProductions, rangeSales, rangeCosts)
  }
}

