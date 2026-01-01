// Stock Management Service
// OOP approach for stock calculations
// Updated to use invoices instead of direct sales

import type { Product, Production, Sale, Invoice, Stock } from "../types"

export class StockService {
  /**
   * Calculate sales from invoices (only paid invoices)
   * Converts invoice items to sales for stock calculation
   */
  private static getSalesFromInvoices(invoices: Invoice[]): Sale[] {
    const sales: Sale[] = []
    
    // Only count sales from paid invoices
    const paidInvoices = invoices.filter(inv => inv.status === "paid")
    
    for (const invoice of paidInvoices) {
      for (const item of invoice.items) {
        sales.push({
          id: `sale-${invoice.id}-${item.productId}`,
          invoiceId: invoice.id,
          customerName: invoice.customerName,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total,
          date: invoice.paidDate || invoice.date,
          createdAt: invoice.createdAt,
        })
      }
    }
    
    return sales
  }

  /**
   * Calculate stock for a single product
   * Formula: Stock = Total Production - Total Sales (from paid invoices)
   */
  static calculateStock(
    productId: string,
    productions: Production[],
    invoices: Invoice[],
    directSales?: Sale[] // Legacy support - will be removed
  ): Stock {
    const productProductions = productions.filter((p) => p.productId === productId)
    
    // Get sales from invoices (only paid invoices)
    const invoiceSales = this.getSalesFromInvoices(invoices)
    const productSales = invoiceSales.filter((s) => s.productId === productId)
    
    // Add legacy direct sales if provided (for backward compatibility)
    if (directSales) {
      const directProductSales = directSales.filter((s) => s.productId === productId && !s.invoiceId)
      productSales.push(...directProductSales)
    }

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
    invoices: Invoice[],
    directSales?: Sale[] // Legacy support
  ): Stock[] {
    return products.map((product) => 
      this.calculateStock(product.id, productions, invoices, directSales)
    )
  }

  /**
   * Get stock for a specific product
   */
  static getProductStock(
    productId: string,
    productions: Production[],
    invoices: Invoice[],
    directSales?: Sale[] // Legacy support
  ): number {
    const stock = this.calculateStock(productId, productions, invoices, directSales)
    return stock.remainingStock
  }

  /**
   * Check if product has sufficient stock for sale
   */
  static hasSufficientStock(
    productId: string,
    requestedQuantity: number,
    productions: Production[],
    invoices: Invoice[],
    directSales?: Sale[] // Legacy support
  ): boolean {
    const stock = this.getProductStock(productId, productions, invoices, directSales)
    return stock >= requestedQuantity
  }
}
