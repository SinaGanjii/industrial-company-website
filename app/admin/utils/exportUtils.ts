// Export Utilities for PDF and Excel with Full Persian Support

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
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load xlsx:", error)
      }
      throw new Error("کتابخانه Excel بارگذاری نشد. لطفاً صفحه را رفرش کنید.")
    }
  }
  return xlsxModule
}

// Helper function to create and download PDF from HTML with professional A4 design
function createPDFFromHTML(htmlContent: string, filename: string): void {
  // Create a temporary container
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("لطفاً popup blocker را غیرفعال کنید")
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm 20mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          font-size: 11px;
          line-height: 1.7;
          color: #1f2937;
          background: #ffffff;
          padding: 0;
          width: 210mm;
          min-height: 297mm;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
        }
        .header {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 25px;
          text-align: center;
          color: #1e40af;
          border-bottom: 3px solid #1e40af;
          padding-bottom: 15px;
          letter-spacing: 0.5px;
        }
        .subheader {
          font-size: 13px;
          font-weight: 600;
          margin: 15px 0 10px 0;
          color: #374151;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 4px;
          font-size: 11px;
        }
        .info-row span {
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          direction: rtl;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          overflow: hidden;
        }
        th {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 12px 10px;
          text-align: right;
          font-weight: 600;
          font-size: 11px;
          border: none;
          letter-spacing: 0.3px;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          text-align: right;
          font-size: 10.5px;
        }
        tbody tr {
          transition: background-color 0.2s;
        }
        tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        tbody tr:hover {
          background-color: #f3f4f6;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        .total {
          font-size: 16px;
          font-weight: 700;
          margin-top: 25px;
          padding: 15px 20px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          text-align: left;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .notes {
          margin-top: 20px;
          padding: 12px 15px;
          background: #fef3c7;
          border-right: 4px solid #f59e0b;
          border-radius: 4px;
          font-style: italic;
          color: #92400e;
          font-size: 10.5px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        .kpi-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 18px 15px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .kpi-card .label {
          font-weight: 600;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kpi-card .value {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 5px;
        }
        .kpi-card.profit-positive .value {
          color: #059669;
        }
        .kpi-card.profit-negative .value {
          color: #dc2626;
        }
        .page-break {
          page-break-before: always;
          margin-top: 30px;
        }
        @media screen and (max-width: 768px) {
          body {
            font-size: 10px;
            padding: 10px;
          }
          .header {
            font-size: 18px;
          }
          .subheader {
            font-size: 11px;
          }
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .kpi-card {
            padding: 12px 10px;
          }
          .kpi-card .label {
            font-size: 9px;
          }
          .kpi-card .value {
            font-size: 14px;
          }
          table {
            font-size: 9px;
          }
          th, td {
            padding: 6px 4px;
            font-size: 9px;
          }
          .info-row {
            flex-direction: column;
            gap: 4px;
          }
          .total {
            font-size: 12px;
            padding: 10px 15px;
          }
        }
        @media print {
          body {
            padding: 0;
            width: 210mm;
            min-height: 297mm;
          }
          .page-break {
            page-break-before: always;
          }
          .kpi-card {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${htmlContent}
      </div>
    </body>
    </html>
  `)

  printWindow.document.close()
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print()
  }, 300)
}

/**
 * Export invoice to PDF with full Persian RTL support using HTML-to-PDF
 */
export async function exportInvoiceToPDF(invoice: Invoice): Promise<void> {
  try {
    const itemsRows = invoice.items.map(
      (item) => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.dimensions}</td>
          <td style="text-align: center;">${formatPersianNumber(item.quantity)}</td>
          <td>${formatPersianNumber(item.unitPrice)}</td>
          <td>${formatPersianNumber(item.total)}</td>
        </tr>
      `
    ).join("")

    const htmlContent = `
      <div class="header">فاکتور فروش</div>
      <div class="subheader">شماره فاکتور: ${invoice.invoiceNumber}</div>
      <div class="info-row">
        <span><strong>مشتری:</strong> ${invoice.customerName}</span>
        <span><strong>تاریخ:</strong> ${invoice.date}</span>
      </div>
      <div class="info-row">
        <span><strong>وضعیت:</strong> ${getStatusLabel(invoice.status)}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>محصول</th>
            <th>ابعاد</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>مجموع</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div class="total">جمع کل: ${formatPersianNumber(invoice.total)} تومان</div>
      ${invoice.notes ? `<div class="notes"><strong>یادداشت:</strong> ${invoice.notes}</div>` : ""}
    `

    createPDFFromHTML(htmlContent, `فاکتور-${invoice.invoiceNumber}`)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error exporting invoice to PDF:", error)
      }
      alert("خطا در ایجاد فایل PDF. لطفاً دوباره تلاش کنید.")
    }
}

/**
 * Export invoice to Excel with full Persian support
 */
export async function exportInvoiceToExcel(invoice: Invoice): Promise<void> {
  try {
    const XLSX = await getXLSX()
    const wb = XLSX.utils.book_new()

    const invoiceData = [
      ["فاکتور شماره", invoice.invoiceNumber],
      ["مشتری", invoice.customerName],
      ["تاریخ", invoice.date],
      ["وضعیت", getStatusLabel(invoice.status)],
      [],
      ["محصول", "ابعاد", "تعداد", "قیمت واحد", "مجموع"],
      ...invoice.items.map((item) => [
        item.productName,
        item.dimensions,
        formatPersianNumber(item.quantity),
        formatPersianNumber(item.unitPrice),
        formatPersianNumber(item.total),
      ]),
      [],
      ["جمع کل", "", "", "", formatPersianNumber(invoice.total)],
    ]

    const ws = XLSX.utils.aoa_to_sheet(invoiceData)
    ws["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }]
    
    XLSX.utils.book_append_sheet(wb, ws, "فاکتور")
    XLSX.writeFile(wb, `فاکتور-${invoice.invoiceNumber}.xlsx`)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error exporting invoice to Excel:", error)
      }
      alert("خطا در ایجاد فایل Excel. لطفاً دوباره تلاش کنید.")
    }
}

/**
 * Export report to Excel with full Persian support
 */
export async function exportReportToExcel(
  report: DailyReport | MonthlyReport,
  type: "daily" | "monthly"
): Promise<void> {
  try {
    const XLSX = await getXLSX()
    const wb = XLSX.utils.book_new()

    if (type === "daily") {
      const daily = report as DailyReport
      const reportData = [
        ["گزارش روزانه", daily.date],
        [],
        ["تولید", "", "", ""],
        ["محصول", "تعداد", "", ""],
        ...daily.production.products.map((p) => [
          p.productName,
          formatPersianNumber(p.quantity),
          "",
          "",
        ]),
        ["مجموع تولید", formatPersianNumber(daily.production.totalQuantity), "", ""],
        [],
        ["فروش", "", "", ""],
        ["تعداد فروش", formatPersianNumber(daily.sales.count), "", ""],
        ["مقدار فروش", formatPersianNumber(daily.sales.totalQuantity), "", ""],
        ["مبلغ فروش", formatPersianNumber(daily.sales.totalAmount), "", ""],
        [],
        ["هزینه‌ها", "", "", ""],
        ["نوع", "مبلغ", "", ""],
        ...daily.expenses.costs.map((c) => [
          c.typeLabel,
          formatPersianNumber(c.amount),
          "",
          "",
        ]),
        ["مجموع هزینه", formatPersianNumber(daily.expenses.totalAmount), "", ""],
        [],
        ["سود خالص", formatPersianNumber(daily.profit), "", ""],
      ]

      const ws = XLSX.utils.aoa_to_sheet(reportData)
      ws["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }]
      XLSX.utils.book_append_sheet(wb, ws, "گزارش روزانه")
      XLSX.writeFile(wb, `گزارش-روزانه-${daily.date}.xlsx`)
    } else {
      const monthly = report as MonthlyReport
      const reportData = [
        ["گزارش ماهانه", `${monthly.year}/${monthly.month}`],
        [],
        ["تولید", "", "", ""],
        ["محصول", "تعداد", "", ""],
        ...monthly.production.byProduct.map((p) => [
          p.productName,
          formatPersianNumber(p.quantity),
          "",
          "",
        ]),
        ["مجموع تولید", formatPersianNumber(monthly.production.totalQuantity), "", ""],
        [],
        ["فروش", "", "", ""],
        ["تعداد فروش", formatPersianNumber(monthly.sales.count), "", ""],
        ["مقدار فروش", formatPersianNumber(monthly.sales.totalQuantity), "", ""],
        ["مبلغ فروش", formatPersianNumber(monthly.sales.totalAmount), "", ""],
        [],
        ["هزینه‌ها", "", "", ""],
        ["نوع", "مبلغ", "", ""],
        ...monthly.costs.byType.map((c) => [
          c.typeLabel,
          formatPersianNumber(c.amount),
          "",
          "",
        ]),
        ["مجموع هزینه", formatPersianNumber(monthly.costs.totalAmount), "", ""],
        [],
        ["سود خالص", formatPersianNumber(monthly.profit), "", ""],
      ]

      const ws = XLSX.utils.aoa_to_sheet(reportData)
      ws["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }]
      XLSX.utils.book_append_sheet(wb, ws, "گزارش ماهانه")
      XLSX.writeFile(wb, `گزارش-ماهانه-${monthly.year}-${monthly.month}.xlsx`)
    }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error exporting report to Excel:", error)
      }
      alert("خطا در ایجاد فایل Excel. لطفاً دوباره تلاش کنید.")
    }
}

// Helper functions

function getStatusLabel(status: Invoice["status"]): string {
  const labels = {
    draft: "پیش‌نویس",
    approved: "تایید شده",
    paid: "پرداخت شده",
  }
  return labels[status]
}

/**
 * Export Dashboard to PDF with full Persian RTL support
 */
export async function exportDashboardToPDF(data: {
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
    // Build HTML content
    const kpiCards = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="label">تولید کل</div>
          <div class="value">${formatPersianNumber(data.totalProduction)} عدد</div>
        </div>
        <div class="kpi-card">
          <div class="label">فروش کل</div>
          <div class="value">${formatPersianNumber(data.totalSalesRevenue)} تومان</div>
        </div>
        <div class="kpi-card">
          <div class="label">هزینه کل</div>
          <div class="value">${formatPersianNumber(data.totalCosts)} تومان</div>
        </div>
        <div class="kpi-card ${data.netProfit >= 0 ? "profit-positive" : "profit-negative"}">
          <div class="label">سود خالص</div>
          <div class="value">${formatPersianNumber(data.netProfit)} تومان</div>
        </div>
      </div>
    `

    const costBreakdownTable = `
      <div class="subheader">تفکیک هزینه‌ها</div>
      <table>
        <thead>
          <tr>
            <th>برق</th>
            <th>آب</th>
            <th>گاز</th>
            <th>حقوق</th>
            <th>سایر</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">${formatPersianNumber(data.costBreakdown.electricity)}</td>
            <td style="text-align: center;">${formatPersianNumber(data.costBreakdown.water)}</td>
            <td style="text-align: center;">${formatPersianNumber(data.costBreakdown.gas)}</td>
            <td style="text-align: center;">${formatPersianNumber(data.costBreakdown.salary)}</td>
            <td style="text-align: center;">${formatPersianNumber(data.costBreakdown.other)}</td>
          </tr>
        </tbody>
      </table>
    `

    const costsTable = data.filteredCosts.length > 0 ? `
      <div class="subheader page-break">آخرین هزینه‌ها</div>
      <table>
        <thead>
          <tr>
            <th>تاریخ/دوره</th>
            <th>نوع</th>
            <th>مبلغ</th>
            <th>شرح</th>
          </tr>
        </thead>
        <tbody>
          ${data.filteredCosts.slice(0, 20).map(cost => `
            <tr>
              <td>${cost.periodValue}</td>
              <td>${cost.typeLabel}</td>
              <td>${formatPersianNumber(cost.amount)}</td>
              <td>${cost.description}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : ""

    const productionsTable = data.filteredProductions.length > 0 ? `
      <div class="subheader page-break">تولیدات</div>
      <table>
        <thead>
          <tr>
            <th>تاریخ</th>
            <th>محصول</th>
            <th>تعداد</th>
            <th>شیفت</th>
          </tr>
        </thead>
        <tbody>
          ${data.filteredProductions.slice(0, 30).map(prod => `
            <tr>
              <td>${prod.date}</td>
              <td>${prod.productName}</td>
              <td style="text-align: center;">${formatPersianNumber(prod.quantity)}</td>
              <td>${prod.shift}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : ""

    const salesTable = data.filteredSales.length > 0 ? `
      <div class="subheader page-break">فروشات</div>
      <table>
        <thead>
          <tr>
            <th>تاریخ</th>
            <th>مشتری</th>
            <th>محصول</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>مجموع</th>
          </tr>
        </thead>
        <tbody>
          ${data.filteredSales.slice(0, 30).map(sale => `
            <tr>
              <td>${sale.date}</td>
              <td>${sale.customerName}</td>
              <td>${sale.productName}</td>
              <td style="text-align: center;">${formatPersianNumber(sale.quantity)}</td>
              <td>${formatPersianNumber(sale.unitPrice)}</td>
              <td>${formatPersianNumber(sale.totalPrice)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : ""

    const htmlContent = `
      <div class="header">گزارش خلاصه</div>
      <div class="subheader">از تاریخ: ${data.startDate} تا ${data.endDate}</div>
      ${kpiCards}
      ${costBreakdownTable}
      ${costsTable}
      ${productionsTable}
      ${salesTable}
    `

    createPDFFromHTML(htmlContent, `گزارش-${data.startDate}-تا-${data.endDate}`)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error exporting dashboard to PDF:", error)
      }
      alert("خطا در ایجاد فایل PDF. لطفاً دوباره تلاش کنید.")
    }
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
      if (process.env.NODE_ENV === "development") {
        console.error("Error exporting to Excel:", error)
      }
      alert("خطا در ایجاد فایل Excel. لطفاً دوباره تلاش کنید.")
    }
}

/**
 * Export costs to PDF with full Persian RTL support
 */
export async function exportCostsToPDF(costs: Cost[]): Promise<void> {
  try {
    if (costs.length === 0) {
      alert("هزینه‌ای برای export وجود ندارد")
      return
    }

    // Group costs by type for summary
    const costBreakdown = {
      electricity: costs.filter((c) => c.type === "electricity").reduce((sum, c) => sum + c.amount, 0),
      water: costs.filter((c) => c.type === "water").reduce((sum, c) => sum + c.amount, 0),
      gas: costs.filter((c) => c.type === "gas").reduce((sum, c) => sum + c.amount, 0),
      salary: costs.filter((c) => c.type === "salary").reduce((sum, c) => sum + c.amount, 0),
      other: costs.filter((c) => c.type === "other").reduce((sum, c) => sum + c.amount, 0),
    }

    const totalCosts = costBreakdown.electricity + costBreakdown.water + costBreakdown.gas + costBreakdown.salary + costBreakdown.other

    // Sort costs by period value (newest first)
    const sortedCosts = [...costs].sort((a, b) => {
      const periodCompare = b.periodValue.localeCompare(a.periodValue)
      if (periodCompare !== 0) return periodCompare
      return b.type.localeCompare(a.type)
    })

    // Build HTML content
    const kpiCards = `
      <div class="kpi-grid" style="grid-template-columns: repeat(5, 1fr);">
        <div class="kpi-card">
          <div class="label">برق</div>
          <div class="value">${formatPersianNumber(costBreakdown.electricity)} تومان</div>
        </div>
        <div class="kpi-card">
          <div class="label">آب</div>
          <div class="value">${formatPersianNumber(costBreakdown.water)} تومان</div>
        </div>
        <div class="kpi-card">
          <div class="label">گاز</div>
          <div class="value">${formatPersianNumber(costBreakdown.gas)} تومان</div>
        </div>
        <div class="kpi-card">
          <div class="label">حقوق</div>
          <div class="value">${formatPersianNumber(costBreakdown.salary)} تومان</div>
        </div>
        <div class="kpi-card">
          <div class="label">سایر</div>
          <div class="value">${formatPersianNumber(costBreakdown.other)} تومان</div>
        </div>
      </div>
    `

    const costsTable = `
      <div class="subheader page-break">لیست تفصیلی هزینه‌ها</div>
      <table>
        <thead>
          <tr>
            <th>تاریخ/دوره</th>
            <th>نوع دوره</th>
            <th>نوع هزینه</th>
            <th>مبلغ</th>
            <th>شرح</th>
          </tr>
        </thead>
        <tbody>
          ${sortedCosts.map(cost => `
            <tr>
              <td>${cost.periodValue}</td>
              <td>${cost.periodType === "daily" ? "روزانه" : "ماهانه"}</td>
              <td>${cost.typeLabel}</td>
              <td>${formatPersianNumber(cost.amount)}</td>
              <td>${cost.description}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `

    const htmlContent = `
      <div class="header">گزارش هزینه‌ها</div>
      <div class="subheader">تعداد کل: ${formatPersianNumber(costs.length)} مورد</div>
      <div class="subheader">خلاصه هزینه‌ها</div>
      ${kpiCards}
      <div class="total">مجموع کل: ${formatPersianNumber(totalCosts)} تومان</div>
      ${costsTable}
    `

    createPDFFromHTML(htmlContent, "گزارش-هزینه‌ها")
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error exporting costs to PDF:", error)
      }
      alert("خطا در ایجاد فایل PDF. لطفاً دوباره تلاش کنید.")
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

