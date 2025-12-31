// Cost Management Service
// OOP approach for cost calculations and distribution

import type { Cost, Production, CostDistribution } from "../types"

export class CostService {
  /**
   * Calculate cost per unit for a product on a specific date
   * Distributes shared costs across all products produced on the same day
   */
  static calculateCostPerUnit(
    productId: string,
    date: string,
    costs: Cost[],
    productions: Production[]
  ): number {
    // Get all costs for this date
    const dateCosts = costs.filter((c) => c.date === date)
    
    // Get all productions for this date
    const dateProductions = productions.filter((p) => p.date === date)
    const totalProductionQuantity = dateProductions.reduce((sum, p) => sum + p.quantity, 0)

    if (totalProductionQuantity === 0) return 0

    // Separate shared costs (no productId) from product-specific costs
    const sharedCosts = dateCosts
      .filter((c) => !c.productId)
      .reduce((sum, c) => sum + c.amount, 0)

    const productSpecificCosts = dateCosts
      .filter((c) => c.productId === productId)
      .reduce((sum, c) => sum + c.amount, 0)

    // Get product quantity for this date
    const productQuantity = dateProductions
      .filter((p) => p.productId === productId)
      .reduce((sum, p) => sum + p.quantity, 0)

    if (productQuantity === 0) return 0

    // Distribute shared costs proportionally
    const sharedCostPerUnit = sharedCosts / totalProductionQuantity
    
    // Product-specific costs per unit
    const specificCostPerUnit = productSpecificCosts / productQuantity

    return sharedCostPerUnit + specificCostPerUnit
  }

  /**
   * Calculate total cost for a product across all production dates
   */
  static calculateTotalProductCost(
    productId: string,
    costs: Cost[],
    productions: Production[]
  ): number {
    const productProductions = productions.filter((p) => p.productId === productId)
    let totalCost = 0

    productProductions.forEach((prod) => {
      const costPerUnit = this.calculateCostPerUnit(productId, prod.date, costs, productions)
      totalCost += costPerUnit * prod.quantity
    })

    return totalCost
  }

  /**
   * Distribute costs for a specific date across all products
   */
  static distributeCostsForDate(
    date: string,
    costs: Cost[],
    productions: Production[]
  ): CostDistribution[] {
    const dateProductions = productions.filter((p) => p.date === date)
    const dateCosts = costs.filter((c) => c.date === date)
    
    const totalProduction = dateProductions.reduce((sum, p) => sum + p.quantity, 0)
    const sharedCosts = dateCosts
      .filter((c) => !c.productId)
      .reduce((sum, c) => sum + c.amount, 0)

    const distributions: CostDistribution[] = []

    // Group productions by product
    const productGroups = new Map<string, Production[]>()
    dateProductions.forEach((p) => {
      const existing = productGroups.get(p.productId) || []
      existing.push(p)
      productGroups.set(p.productId, existing)
    })

    productGroups.forEach((prods, productId) => {
      const productQuantity = prods.reduce((sum, p) => sum + p.quantity, 0)
      const productName = prods[0].productName

      // Shared cost portion
      const sharedCost = totalProduction > 0 
        ? (sharedCosts * productQuantity) / totalProduction 
        : 0

      // Product-specific costs
      const specificCost = dateCosts
        .filter((c) => c.productId === productId)
        .reduce((sum, c) => sum + c.amount, 0)

      const totalCost = sharedCost + specificCost
      const costPerUnit = productQuantity > 0 ? totalCost / productQuantity : 0

      distributions.push({
        productId,
        productName,
        sharedCost,
        specificCost,
        totalCost,
        costPerUnit,
      })
    })

    return distributions
  }

  /**
   * Get costs by type for a date range
   */
  static getCostsByType(
    costs: Cost[],
    startDate?: string,
    endDate?: string
  ): Map<string, number> {
    let filteredCosts = costs

    if (startDate) {
      filteredCosts = filteredCosts.filter((c) => c.date >= startDate)
    }
    if (endDate) {
      filteredCosts = filteredCosts.filter((c) => c.date <= endDate)
    }

    const costsByType = new Map<string, number>()
    filteredCosts.forEach((c) => {
      const current = costsByType.get(c.type) || 0
      costsByType.set(c.type, current + c.amount)
    })

    return costsByType
  }
}

