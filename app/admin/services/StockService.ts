// Stock Management Service
// OOP approach for stock calculations

import type { Product, Production, Sale, Stock } from "../types"

export class StockService {
  /**
   * Calculate stock for a single product
   * Formula: Stock = Total Production - Total Sales
   */
  static calculateStock(
    productId: string,
    productions: Production[],
    sales: Sale[]
  ): Stock {
    const productProductions = productions.filter((p) => p.productId === productId)
    const productSales = sales.filter((s) => s.productId === productId)

    const totalProduction = productProductions.reduce((sum, p) => sum + p.quantity, 0)
    const totalSales = productSales.reduce((sum, s) => sum + s.quantity, 0)
    const remainingStock = Math.max(0, totalProduction - totalSales) // Never negative

    return {
      productId,
      productName: productProductions[0]?.productName || productSales[0]?.productName || "",
      totalProduction,
      totalSales,
      remainingStock,
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Calculate stocks for all products
   */
  static calculateAllStocks(
    products: Product[],
    productions: Production[],
    sales: Sale[]
  ): Stock[] {
    return products.map((product) => 
      this.calculateStock(product.id, productions, sales)
    )
  }

  /**
   * Get stock for a specific product
   */
  static getProductStock(
    productId: string,
    productions: Production[],
    sales: Sale[]
  ): number {
    const stock = this.calculateStock(productId, productions, sales)
    return stock.remainingStock
  }

  /**
   * Check if product has sufficient stock for sale
   */
  static hasSufficientStock(
    productId: string,
    requestedQuantity: number,
    productions: Production[],
    sales: Sale[]
  ): boolean {
    const stock = this.getProductStock(productId, productions, sales)
    return stock >= requestedQuantity
  }
}

