// Export Utilities for PDF and Excel

import type { Invoice, DailyReport, MonthlyReport, Production, Sale, Cost } from "../types"

// Dynamic import for xlsx (to avoid SSR issues)
// @ts-ignore - xlsx types are included in the package
let xlsxModule: any = null
async function getXLSX(): Promise<any> {
  if (!xlsxModule) {
    try {
      // @ts-ignore
      xlsxModule = await import("xlsx")
    } catch (error) {
      console.error("Failed to load xlsx:", error)
      throw new Error("کتابخانه Excel بارگذاری نشد. لطفاً صفحه را رفرش کنید.")
    }
  }
  return xlsxModule
}

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
  const filename = type === "daily" 
    ? `گزارش-روزانه-${(report as DailyReport).date}.csv`
    : `گزارش-ماهانه-${(report as MonthlyReport).year}-${(report as MonthlyReport).month}.csv`
  a.download = filename
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

/**
 * Export Dashboard to Excel with 3 sheets (Professional Enterprise Level):
 * 1. Summary: start_date, end_date, total_production_qty, total_sales_revenue, total_costs, net_profit
 * 2. Costs: breakdown by type + list of cost rows
 * 3. Raw Data: productions + sales rows
 */
export async function exportDashboardToExcel(data: {
  startDate: string
  endDate: string
  totalProduction: number
  totalSalesRevenue: number
  totalCosts: number
  netProfit: number
  costBreakdown: {
    electricity: number
    water: number
    gas: number
    salary: number
    other: number
  }
  filteredProductions: Production[]
  filteredSales: Sale[]
  filteredCosts: Cost[]
}): Promise<void> {
  try {
    const XLSX = await getXLSX()
    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // ============================================
    // SHEET 1: SUMMARY (خلاصه)
    // ============================================
    const summaryData = [
      ["گزارش خلاصه", ""],
      [],
      ["تاریخ شروع", data.startDate],
      ["تاریخ پایان", data.endDate],
      [],
      ["تولید کل (عدد)", formatPersianNumber(data.totalProduction)],
      ["فروش کل (تومان)", formatPersianNumber(data.totalSalesRevenue)],
      ["هزینه کل (تومان)", formatPersianNumber(data.totalCosts)],
      ["سود خالص (تومان)", formatPersianNumber(data.netProfit)],
    ]

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Set column widths
    ws1["!cols"] = [{ wch: 25 }, { wch: 20 }]
    
    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws1, "خلاصه")

    // ============================================
    // SHEET 2: COSTS (هزینه‌ها)
    // ============================================
    const costsData = [
      // Header
      ["تفکیک هزینه‌ها", "", "", ""],
      [],
      // Breakdown by type
      ["نوع هزینه", "مبلغ (تومان)", "", ""],
      ["برق", formatPersianNumber(data.costBreakdown.electricity), "", ""],
      ["آب", formatPersianNumber(data.costBreakdown.water), "", ""],
      ["گاز", formatPersianNumber(data.costBreakdown.gas), "", ""],
      ["حقوق", formatPersianNumber(data.costBreakdown.salary), "", ""],
      ["سایر", formatPersianNumber(data.costBreakdown.other), "", ""],
      [],
      // List of costs
      ["لیست هزینه‌ها", "", "", ""],
      [],
      ["تاریخ/دوره", "نوع", "مبلغ (تومان)", "شرح"],
      // Cost rows
      ...data.filteredCosts.map((cost) => [
        cost.periodValue,
        cost.typeLabel,
        formatPersianNumber(cost.amount),
        cost.description,
      ]),
    ]

    const ws2 = XLSX.utils.aoa_to_sheet(costsData)
    
    // Set column widths
    ws2["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }]
    
    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws2, "هزینه‌ها")

    // ============================================
    // SHEET 3: RAW DATA (داده‌های خام)
    // ============================================
    const rawDataRows: any[][] = []
    
    // Productions section
    rawDataRows.push(["تولیدات", "", "", ""])
    rawDataRows.push([])
    rawDataRows.push(["تاریخ", "محصول", "تعداد", "شیفت"])
    rawDataRows.push(
      ...data.filteredProductions.map((prod) => [
        prod.date,
        prod.productName,
        formatPersianNumber(prod.quantity),
        prod.shift,
      ])
    )
    
    rawDataRows.push([])
    
    // Sales section
    rawDataRows.push(["فروشات", "", "", "", "", ""])
    rawDataRows.push([])
    rawDataRows.push(["تاریخ", "مشتری", "محصول", "تعداد", "قیمت واحد", "مجموع"])
    rawDataRows.push(
      ...data.filteredSales.map((sale) => [
        sale.date,
        sale.customerName,
        sale.productName,
        formatPersianNumber(sale.quantity),
        formatPersianNumber(sale.unitPrice),
        formatPersianNumber(sale.totalPrice),
      ])
    )

    const ws3 = XLSX.utils.aoa_to_sheet(rawDataRows)
    
    // Set column widths
    ws3["!cols"] = [
      { wch: 12 }, // تاریخ
      { wch: 20 }, // محصول/مشتری
      { wch: 15 }, // تعداد
      { wch: 10 }, // شیفت
      { wch: 15 }, // قیمت واحد
      { wch: 15 }, // مجموع
    ]
    
    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws3, "داده‌های خام")

    // ============================================
    // EXPORT FILE
    // ============================================
    // Generate filename with Persian dates
    const filename = `گزارش-${data.startDate}-تا-${data.endDate}.xlsx`
    
    // Write file with options for better Persian support
    XLSX.writeFile(wb, filename, {
      bookType: "xlsx",
      type: "array",
    })
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    alert("خطا در ایجاد فایل Excel. لطفاً دوباره تلاش کنید.")
  }
}

/**
 * Format number to Persian digits for display
 */
function formatPersianNumber(num: number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  const numStr = num.toLocaleString("fa-IR")
  return numStr
}

