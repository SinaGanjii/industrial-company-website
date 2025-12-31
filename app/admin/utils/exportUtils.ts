// Export Utilities for PDF and Excel

import type { Invoice, DailyReport, MonthlyReport } from "../types"

/**
 * Export invoice to PDF (simulation)
 * In production, use jsPDF or puppeteer
 */
export function exportInvoiceToPDF(invoice: Invoice): void {
  const content = generateInvoicePDFContent(invoice)
  
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `invoice-${invoice.invoiceNumber}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export invoice to Excel (CSV format)
 * In production, use xlsx or exceljs
 */
export function exportInvoiceToExcel(invoice: Invoice): void {
  const rows = [
    ["فاکتور شماره", invoice.invoiceNumber],
    ["مشتری", invoice.customerName],
    ["تاریخ", invoice.date],
    ["وضعیت", getStatusLabel(invoice.status)],
    [],
    ["محصول", "ابعاد", "تعداد", "قیمت واحد", "مجموع"],
    ...invoice.items.map((item) => [
      item.productName,
      item.dimensions,
      item.quantity,
      item.unitPrice,
      item.total,
    ]),
    [],
    ["جمع کل", "", "", "", invoice.total],
  ]

  const csv = rows.map((row) => row.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `invoice-${invoice.invoiceNumber}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export report to Excel
 */
export function exportReportToExcel(
  report: DailyReport | MonthlyReport,
  type: "daily" | "monthly"
): void {
  const content = generateReportExcelContent(report, type)
  
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${type}-report-${report.date || `${report.year}-${report.month}`}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper functions

function generateInvoicePDFContent(invoice: Invoice): string {
  return `
فاکتور شماره: ${invoice.invoiceNumber}
وضعیت: ${getStatusLabel(invoice.status)}
مشتری: ${invoice.customerName}
تاریخ: ${invoice.date}

${invoice.items.map((item, idx) => `
${idx + 1}. ${item.productName} (${item.dimensions})
   تعداد: ${item.quantity}
   قیمت واحد: ${item.unitPrice.toLocaleString("fa-IR")}
   مجموع: ${item.total.toLocaleString("fa-IR")}
`).join("")}

جمع کل: ${invoice.total.toLocaleString("fa-IR")} تومان
`
}

function generateReportExcelContent(
  report: DailyReport | MonthlyReport,
  type: "daily" | "monthly"
): string {
  if (type === "daily") {
    const daily = report as DailyReport
    return `
گزارش روزانه - ${daily.date}

تولید:
${daily.production.products.map((p) => `${p.productName}: ${p.quantity}`).join("\n")}
مجموع تولید: ${daily.production.totalQuantity}

فروش:
تعداد فروش: ${daily.sales.count}
مقدار فروش: ${daily.sales.totalQuantity}
مبلغ فروش: ${daily.sales.totalAmount.toLocaleString("fa-IR")}

هزینه‌ها:
${daily.expenses.costs.map((c) => `${c.typeLabel}: ${c.amount.toLocaleString("fa-IR")}`).join("\n")}
مجموع هزینه: ${daily.expenses.totalAmount.toLocaleString("fa-IR")}

سود خالص: ${daily.profit.toLocaleString("fa-IR")}
`
  } else {
    const monthly = report as MonthlyReport
    return `
گزارش ماهانه - ${monthly.year}/${monthly.month}

تولید:
${monthly.production.byProduct.map((p) => `${p.productName}: ${p.quantity}`).join("\n")}
مجموع تولید: ${monthly.production.totalQuantity}

فروش:
تعداد فروش: ${monthly.sales.count}
مقدار فروش: ${monthly.sales.totalQuantity}
مبلغ فروش: ${monthly.sales.totalAmount.toLocaleString("fa-IR")}

هزینه‌ها:
${monthly.costs.byType.map((c) => `${c.typeLabel}: ${c.amount.toLocaleString("fa-IR")}`).join("\n")}
مجموع هزینه: ${monthly.costs.totalAmount.toLocaleString("fa-IR")}

سود خالص: ${monthly.profit.toLocaleString("fa-IR")}

سود به تفکیک محصول:
${monthly.profitByProduct.map((p) => `${p.productName}: ${p.profit.toLocaleString("fa-IR")}`).join("\n")}
`
  }
}

function getStatusLabel(status: Invoice["status"]): string {
  const labels = {
    draft: "پیش‌نویس",
    approved: "تایید شده",
    paid: "پرداخت شده",
  }
  return labels[status]
}

