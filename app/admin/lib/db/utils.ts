// Database Utility Functions
// Conversion functions between TypeScript types and Supabase database types

import type { Product, Production, Cost, Sale, Invoice, InvoiceItem } from "../../types"
import type { Database } from "./types"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type ProductionRow = Database["public"]["Tables"]["productions"]["Row"]
type CostRow = Database["public"]["Tables"]["costs"]["Row"]
type SaleRow = Database["public"]["Tables"]["sales"]["Row"]
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"]
type InvoiceItemRow = Database["public"]["Tables"]["invoice_items"]["Row"]

// Convert Product from DB to TypeScript
export function dbProductToTS(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    dimensions: row.dimensions,
    material: row.material || "",
    unitPrice: Number(row.unit_price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Convert Product from TypeScript to DB
export function tsProductToDB(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Database["public"]["Tables"]["products"]["Insert"] {
  return {
    name: product.name,
    dimensions: product.dimensions,
    material: product.material || null,
    unit_price: product.unitPrice,
  }
}

// Convert Production from DB to TypeScript
export function dbProductionToTS(row: ProductionRow): Production {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    date: row.date,
    shift: row.shift,
    createdAt: row.created_at,
  }
}

// Convert Production from TypeScript to DB
export function tsProductionToDB(production: Omit<Production, "id" | "createdAt">): Database["public"]["Tables"]["productions"]["Insert"] {
  return {
    product_id: production.productId,
    product_name: production.productName,
    quantity: production.quantity,
    date: production.date,
    shift: production.shift,
  }
}

// Convert Cost from DB to TypeScript
export function dbCostToTS(row: CostRow): Cost {
  return {
    id: row.id,
    type: row.type,
    typeLabel: row.type_label,
    amount: Number(row.amount),
    periodType: row.period_type,
    periodValue: row.period_value,
    description: row.description,
    // Legacy fields (for backward compatibility)
    date: row.date || undefined,
    productId: row.product_id || undefined,
    productionDate: row.production_date || undefined,
    createdAt: row.created_at,
  }
}

// Convert Cost from TypeScript to DB
export function tsCostToDB(cost: Omit<Cost, "id" | "createdAt">): Database["public"]["Tables"]["costs"]["Insert"] {
  // Ensure periodType and periodValue are provided
  if (!cost.periodType || !cost.periodValue) {
    throw new Error("periodType and periodValue are required for cost creation")
  }

  const dbCost: Database["public"]["Tables"]["costs"]["Insert"] = {
    type: cost.type,
    type_label: cost.typeLabel,
    amount: cost.amount,
    period_type: cost.periodType,
    period_value: cost.periodValue,
    description: cost.description,
    // Legacy fields (for backward compatibility)
    date: cost.date || cost.periodValue, // Use periodValue as fallback for date
    product_id: cost.productId || null,
    production_date: cost.productionDate || null,
  }

  console.log("[tsCostToDB] Converting cost:", { cost, dbCost })
  return dbCost
}

// Convert Sale from DB to TypeScript
export function dbSaleToTS(row: SaleRow): Sale {
  return {
    id: row.id,
    invoiceId: row.invoice_id || undefined,
    customerName: row.customer_name,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    totalPrice: Number(row.total_price),
    date: row.date,
    createdAt: row.created_at,
  }
}

// Convert Sale from TypeScript to DB
export function tsSaleToDB(sale: Omit<Sale, "id" | "createdAt">): Database["public"]["Tables"]["sales"]["Insert"] {
  return {
    invoice_id: sale.invoiceId || null,
    customer_name: sale.customerName,
    product_id: sale.productId,
    product_name: sale.productName,
    quantity: sale.quantity,
    unit_price: sale.unitPrice,
    total_price: sale.totalPrice,
    date: sale.date,
  }
}

// Convert Invoice from DB to TypeScript (needs to fetch items separately)
export function dbInvoiceToTS(row: InvoiceRow, items: InvoiceItem[]): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    status: row.status,
    customerName: row.customer_name,
    customerInfo: {
      address: row.customer_address || undefined,
      phone: row.customer_phone || undefined,
      taxId: row.customer_tax_id || undefined,
    },
    items: items.map(dbInvoiceItemToTS),
    subtotal: Number(row.subtotal),
    tax: row.tax ? Number(row.tax) : undefined,
    total: Number(row.total),
    date: row.date,
    dueDate: row.due_date || undefined,
    paidDate: row.paid_date || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Convert Invoice from TypeScript to DB
export function tsInvoiceToDB(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Database["public"]["Tables"]["invoices"]["Insert"] {
  return {
    invoice_number: invoice.invoiceNumber,
    status: invoice.status,
    customer_name: invoice.customerName,
    customer_address: invoice.customerInfo?.address || null,
    customer_phone: invoice.customerInfo?.phone || null,
    customer_tax_id: invoice.customerInfo?.taxId || null,
    subtotal: invoice.subtotal,
    tax: invoice.tax || null,
    total: invoice.total,
    date: invoice.date,
    due_date: invoice.dueDate || null,
    paid_date: invoice.paidDate || null,
    notes: invoice.notes || null,
  }
}

// Convert InvoiceItem from DB to TypeScript
export function dbInvoiceItemToTS(row: InvoiceItemRow): InvoiceItem {
  return {
    productId: row.product_id,
    productName: row.product_name,
    dimensions: row.dimensions,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    total: Number(row.total),
  }
}

// Convert InvoiceItem from TypeScript to DB
export function tsInvoiceItemToDB(item: InvoiceItem, invoiceId: string): Database["public"]["Tables"]["invoice_items"]["Insert"] {
  return {
    invoice_id: invoiceId,
    product_id: item.productId,
    product_name: item.productName,
    dimensions: item.dimensions,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.total,
  }
}

