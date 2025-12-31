// Invoice Management Service
// OOP approach for invoice operations

import type { Invoice, InvoiceItem, Product } from "../types"
import { getTodayPersianDate } from "../utils/dateUtils"

export class InvoiceService {
  /**
   * Generate invoice number
   * Format: INV-YYYYMM-XXXX
   */
  static generateInvoiceNumber(invoices: Invoice[]): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")

    // Find last invoice number for this month
    const monthInvoices = invoices.filter((inv) => 
      inv.invoiceNumber.startsWith(`INV-${year}${month}`)
    )
    const nextNumber = monthInvoices.length + 1

    return `INV-${year}${month}-${String(nextNumber).padStart(4, "0")}`
  }

  /**
   * Create new invoice (Draft status)
   */
  static createInvoice(
    customerName: string,
    items: InvoiceItem[],
    invoices: Invoice[],
    customerInfo?: Invoice["customerInfo"],
    notes?: string
  ): Invoice {
    const invoiceNumber = this.generateInvoiceNumber(invoices)
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.09 // 9% VAT (adjustable)
    const total = subtotal + tax

    const today = new Date()
    const persianDate = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "persian",
    }).format(today)

    return {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      status: "draft",
      customerName,
      customerInfo,
      items,
      subtotal,
      tax,
      total,
      date: persianDate,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Approve invoice (Draft → Approved)
   */
  static approveInvoice(invoice: Invoice): Invoice {
    if (invoice.status !== "draft") {
      throw new Error("Only draft invoices can be approved")
    }

    return {
      ...invoice,
      status: "approved",
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Mark invoice as paid (Approved → Paid)
   */
  static markAsPaid(invoice: Invoice): Invoice {
    if (invoice.status !== "approved") {
      throw new Error("Only approved invoices can be marked as paid")
    }

    return {
      ...invoice,
      status: "paid",
      paidDate: getTodayPersianDate(),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Convert invoice items to sales entries
   * Used when invoice is marked as paid
   */
  static invoiceToSales(invoice: Invoice): Array<{
    invoiceId: string
    customerName: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    date: string
  }> {
    return invoice.items.map((item) => ({
      invoiceId: invoice.id,
      customerName: invoice.customerName,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.total,
      date: invoice.paidDate || invoice.date,
    }))
  }

  /**
   * Calculate invoice totals from items
   */
  static calculateTotals(items: InvoiceItem[], taxRate: number = 0.09): {
    subtotal: number
    tax: number
    total: number
  } {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  /**
   * Create invoice item from product
   */
  static createInvoiceItem(
    product: Product,
    quantity: number
  ): InvoiceItem {
    return {
      productId: product.id,
      productName: product.name,
      dimensions: product.dimensions,
      quantity,
      unitPrice: product.unitPrice,
      total: product.unitPrice * quantity,
    }
  }
}

