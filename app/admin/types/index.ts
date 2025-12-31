// Enterprise-level Type Definitions for Industrial Accounting System
// Concrete Manufacturing Workshop - Production & Accounting System

/**
 * Product Entity
 * Represents a concrete product manufactured in the workshop
 */
export interface Product {
  id: string
  name: string
  dimensions: string
  material: string
  unitPrice: number
  createdAt: string
  updatedAt: string
}

/**
 * Production Record
 * Daily production entry for a specific product
 */
export interface Production {
  id: string
  productId: string
  productName: string
  quantity: number
  date: string
  shift: "صبح" | "عصر" | "شب"
  createdAt: string
}

/**
 * Cost Record
 * Production costs: electricity, water, gas, salaries
 */
export interface Cost {
  id: string
  type: "electricity" | "water" | "gas" | "salary" | "other"
  typeLabel: string
  amount: number
  date: string
  description: string
  productId?: string // Optional: link to specific product
  productionDate?: string // Optional: link to production day
  createdAt: string
}

/**
 * Sale Record
 * Customer sale transaction
 */
export interface Sale {
  id: string
  invoiceId?: string // Link to invoice if exists
  customerName: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
  createdAt: string
}

/**
 * Invoice Entity
 * Professional invoice with status workflow
 */
export interface Invoice {
  id: string
  invoiceNumber: string
  status: "draft" | "approved" | "paid"
  customerName: string
  customerInfo?: {
    address?: string
    phone?: string
    taxId?: string
  }
  items: InvoiceItem[]
  subtotal: number
  tax?: number
  total: number
  date: string
  dueDate?: string
  paidDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Invoice Item
 * Product line in an invoice
 */
export interface InvoiceItem {
  productId: string
  productName: string
  dimensions: string
  quantity: number
  unitPrice: number
  total: number
}

/**
 * Stock Calculation Result
 * Current stock status for a product
 */
export interface Stock {
  productId: string
  productName: string
  totalProduction: number
  totalSales: number
  remainingStock: number
  lastUpdated: string
}

/**
 * Daily Report
 * Complete daily financial and production report
 */
export interface DailyReport {
  date: string
  production: {
    totalQuantity: number
    products: Array<{
      productId: string
      productName: string
      quantity: number
    }>
  }
  sales: {
    totalAmount: number
    totalQuantity: number
    count: number
  }
  expenses: {
    totalAmount: number
    costs: Cost[]
  }
  profit: number
}

/**
 * Monthly Report
 * Complete monthly financial and production report
 */
export interface MonthlyReport {
  month: string
  year: string
  production: {
    totalQuantity: number
    byProduct: Array<{
      productId: string
      productName: string
      quantity: number
    }>
  }
  sales: {
    totalAmount: number
    totalQuantity: number
    count: number
  }
  costs: {
    totalAmount: number
    byType: Array<{
      type: string
      typeLabel: string
      amount: number
    }>
  }
  profit: number
  profitByProduct: Array<{
    productId: string
    productName: string
    revenue: number
    cost: number
    profit: number
    profitMargin: number
  }>
}

/**
 * Cost Distribution Result
 * How shared costs are distributed across products
 */
export interface CostDistribution {
  productId: string
  productName: string
  sharedCost: number
  specificCost: number
  totalCost: number
  costPerUnit: number
}

