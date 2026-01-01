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
 * Production costs: electricity, water, gas, rent, other
 * Note: Salaries are now managed separately in SalaryManagement
 * Period-based system: costs are linked to periods, not products
 */
export interface Cost {
  id: string
  type: "electricity" | "water" | "gas" | "rent" | "other"
  typeLabel: string
  amount: number
  periodType: "daily" | "monthly"
  periodValue: string // YYYY/MM/DD for daily, YYYY/MM for monthly
  description: string
  // Legacy fields (deprecated, kept for backward compatibility)
  date?: string // DEPRECATED: Use periodValue instead
  productId?: string // DEPRECATED: No longer used
  productionDate?: string // DEPRECATED: No longer used
  createdAt: string
}

/**
 * Employee Entity
 * Employee information (daily salary is managed per payment, not per employee)
 */
export interface Employee {
  id: string
  name: string
  phone?: string
  address?: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Salary Payment Record
 * Tracks salary payments (can be partial payments throughout the month)
 * dailySalary can differ from employee's default dailySalary for flexibility
 */
export interface SalaryPayment {
  id: string
  employeeId: string
  employeeName: string // Denormalized for performance
  month: string // Format: YYYY/MM (Persian calendar)
  paymentDate: string // Persian date format: YYYY/MM/DD
  dailySalary: number // Daily salary rate for this specific payment (can differ from employee default)
  amount: number // Payment amount in tomans
  daysWorked: number // Number of days this payment covers
  paymentMethod: "cash" | "transfer" | "check" // Payment method: cash (نقدی), transfer (واریز), check (چک)
  description?: string
  createdAt: string
}

/**
 * Person Entity
 * People we have financial transactions with (creditors/debtors)
 */
export interface Person {
  id: string
  name: string
  phone?: string
  address?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Loan Transaction Record
 * Positive amount = we lent to them (they owe us)
 * Negative amount = they lent to us (we owe them)
 */
export interface Loan {
  id: string
  personId: string
  personName: string // Denormalized for performance
  transactionType: "lend" | "borrow" // lend = we lent, borrow = they lent us
  amount: number // Positive for lend, negative for borrow
  transactionDate: string // Persian date format: YYYY/MM/DD
  description?: string
  createdAt: string
}

/**
 * Sale Record
 * Customer sale transaction (ONLY from invoices - no direct sales)
 * All sales must be linked to an invoice
 */
export interface Sale {
  id: string
  invoiceId: string // REQUIRED: Link to invoice (all sales must come from invoices)
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
  discount?: number // Promotion amount in tomans
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

