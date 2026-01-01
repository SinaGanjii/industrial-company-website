"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Factory, TrendingUp, TrendingDown, DollarSign, Download, Package } from "lucide-react"
import type { Product, Production, Invoice, Cost } from "../types"
import { StockService } from "../services/StockService"
import { CostService } from "../services/CostService"
import { formatPersianNumber, convertToWesternDigits } from "../utils"
import { exportDashboardToPDF } from "../utils/exportUtils"

interface DashboardProps {
  products: Product[]
  productions: Production[]
  invoices: Invoice[]
  costs: Cost[]
}

/**
 * Dashboard Calculations (for selected date range):
 * 
 * 1. Total Production = sum(production.quantity) where production.date is in [startDate, endDate]
 * 
 * 2. Total Sales Revenue = sum(invoice.total) where:
 *    - invoice.status === "paid"
 *    - invoice.date (or paidDate) is in [startDate, endDate]
 * 
 * 3. Total Costs = sum(cost.amount) where:
 *    - If cost.periodType === "daily": cost.periodValue (date) is in [startDate, endDate]
 *    - If cost.periodType === "monthly": cost.periodValue (YYYY/MM) month overlaps with range
 * 
 * 4. Net Profit = Total Sales Revenue - Total Costs
 * 
 * 5. Current Stock (GLOBAL, not filtered):
 *    stock = total_production_all_time - total_sales_all_time (from paid invoices)
 */
export function Dashboard({ products, productions, invoices, costs }: DashboardProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Filter data by date range
  const getFilteredData = () => {
    if (!startDate || !endDate) {
      return {
        filteredProductions: [],
        filteredInvoices: [],
        filteredCosts: [],
      }
    }

    const normalizedStart = convertToWesternDigits(startDate)
    const normalizedEnd = convertToWesternDigits(endDate)

    // Filter productions
    const filteredProductions = productions.filter((p) => {
      const prodDate = convertToWesternDigits(p.date)
      return prodDate >= normalizedStart && prodDate <= normalizedEnd
    })

    // Filter invoices (only paid invoices count as sales)
    const filteredInvoices = invoices.filter((inv) => {
      if (inv.status !== "paid") return false
      const invoiceDate = convertToWesternDigits(inv.paidDate || inv.date)
      return invoiceDate >= normalizedStart && invoiceDate <= normalizedEnd
    })

    // Filter costs using CostService
    const filteredCosts = CostService.collectCostsForPeriod(normalizedStart, normalizedEnd, costs)

    return {
      filteredProductions,
      filteredInvoices,
      filteredCosts,
    }
  }

  const { filteredProductions, filteredInvoices, filteredCosts } = getFilteredData()

  // Calculate KPIs
  const totalProduction = filteredProductions.reduce((sum, p) => sum + p.quantity, 0)
  const totalSalesRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalCosts = filteredCosts.reduce((sum, c) => sum + c.amount, 0)
  const netProfit = totalSalesRevenue - totalCosts

  // Cost breakdown by type
  const costBreakdown = {
    electricity: filteredCosts.filter((c) => c.type === "electricity").reduce((sum, c) => sum + c.amount, 0),
    water: filteredCosts.filter((c) => c.type === "water").reduce((sum, c) => sum + c.amount, 0),
    gas: filteredCosts.filter((c) => c.type === "gas").reduce((sum, c) => sum + c.amount, 0),
    salary: filteredCosts.filter((c) => c.type === "salary").reduce((sum, c) => sum + c.amount, 0),
    other: filteredCosts.filter((c) => c.type === "other").reduce((sum, c) => sum + c.amount, 0),
  }

  // Current stock (GLOBAL - all time, from paid invoices only)
  const stocks = StockService.calculateAllStocks(products, productions, invoices)
    .filter((stock) => stock.totalProduction > 0) // Only show products with production
    .sort((a, b) => b.remainingStock - a.remainingStock) // Sort by stock descending
  const totalStock = stocks.reduce((sum, s) => sum + s.remainingStock, 0)

  // Latest items in range (for activity tables)
  const latestProductions = filteredProductions
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  const latestInvoices = filteredInvoices
    .sort((a, b) => {
      const aDate = a.paidDate || a.date
      const bDate = b.paidDate || b.date
      return bDate.localeCompare(aDate)
    })
    .slice(0, 10)

  const latestCosts = filteredCosts
    .sort((a, b) => {
      // Sort by periodValue (date) descending
      const aDate = a.periodType === "daily" ? a.periodValue : a.periodValue + "/01"
      const bDate = b.periodType === "daily" ? b.periodValue : b.periodValue + "/01"
      return bDate.localeCompare(aDate)
    })
    .slice(0, 10)

  // Export handler
  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("لطفاً بازه زمانی را انتخاب کنید")
      return
    }

    try {
      // Convert invoices to sales format for export
      const filteredSales = filteredInvoices.flatMap(inv => 
        inv.items.map(item => ({
          id: `sale-${inv.id}-${item.productId}`,
          invoiceId: inv.id,
          customerName: inv.customerName,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total,
          date: inv.paidDate || inv.date,
          createdAt: inv.createdAt,
        }))
      )

      await exportDashboardToPDF({
        startDate,
        endDate,
        totalProduction,
        totalSalesRevenue,
        totalCosts,
        netProfit,
        costBreakdown,
        filteredProductions,
        filteredSales,
        filteredCosts,
      })
    } catch (error) {
      console.error("Export error:", error)
      alert("خطا در ایجاد فایل PDF")
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>انتخاب بازه زمانی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="start-date">تاریخ شروع *</Label>
              <Input
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="۱۴۰۴/۱۰/۰۱"
                className="w-full"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="end-date">تاریخ پایان *</Label>
              <Input
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="۱۴۰۴/۱۰/۳۰"
                className="w-full"
              />
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              disabled={!startDate || !endDate || startDate > endDate}
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              خروجی PDF
            </Button>
          </div>
          {startDate && endDate && startDate > endDate && (
            <p className="text-xs text-red-600 mt-2">
              ⚠️ تاریخ شروع باید قبل از تاریخ پایان باشد
            </p>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Production */}
        <Card className="border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Factory className="h-5 w-5 text-accent" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {formatPersianNumber(totalProduction)}
            </div>
            <div className="text-xs text-muted-foreground">تولید کل (عدد)</div>
          </CardContent>
        </Card>

        {/* Total Sales Revenue */}
        <Card className="border-green-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatPersianNumber(totalSalesRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">فروش کل (تومان)</div>
          </CardContent>
        </Card>

        {/* Total Costs */}
        <Card className="border-red-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatPersianNumber(totalCosts)}
            </div>
            <div className="text-xs text-muted-foreground">هزینه کل (تومان)</div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="border-blue-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <TrendingUp className={`h-4 w-4 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
            </div>
            <div className={`text-2xl font-bold mb-1 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPersianNumber(netProfit)}
            </div>
            <div className="text-xs text-muted-foreground">سود خالص (تومان)</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Stock (Global) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">موجودی فعلی (کل)</h3>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatPersianNumber(totalStock)} عدد
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stocks.length === 0 ? (
              <div className="col-span-full text-center text-sm text-muted-foreground py-4">
                هیچ محصولی با تولید یافت نشد
              </div>
            ) : (
              stocks.map((stock) => (
                <div key={stock.productId} className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium text-foreground mb-1 line-clamp-2">{stock.productName}</div>
                  <div className="text-lg font-bold text-accent">{formatPersianNumber(stock.remainingStock)}</div>
                  <div className="text-xs text-muted-foreground">عدد</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      {totalCosts > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">تفکیک هزینه‌ها</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {costBreakdown.electricity > 0 && (
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-sm font-medium mb-1">برق</div>
                  <div className="text-lg font-bold text-yellow-600">
                    {formatPersianNumber(costBreakdown.electricity)}
                  </div>
                </div>
              )}
              {costBreakdown.water > 0 && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-sm font-medium mb-1">آب</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatPersianNumber(costBreakdown.water)}
                  </div>
                </div>
              )}
              {costBreakdown.gas > 0 && (
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-sm font-medium mb-1">گاز</div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatPersianNumber(costBreakdown.gas)}
                  </div>
                </div>
              )}
              {costBreakdown.salary > 0 && (
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-sm font-medium mb-1">حقوق</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatPersianNumber(costBreakdown.salary)}
                  </div>
                </div>
              )}
              {costBreakdown.other > 0 && (
                <div className="p-3 bg-gray-500/10 rounded-lg border border-gray-500/20">
                  <div className="text-sm font-medium mb-1">سایر</div>
                  <div className="text-lg font-bold text-gray-600">
                    {formatPersianNumber(costBreakdown.other)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latest Productions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">آخرین تولیدات</CardTitle>
          </CardHeader>
          <CardContent>
            {latestProductions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">داده‌ای یافت نشد</p>
            ) : (
              <div className="space-y-2">
                {latestProductions.map((prod) => (
                  <div key={prod.id} className="text-xs border-b pb-2">
                    <div className="font-medium">{prod.productName}</div>
                    <div className="text-muted-foreground">
                      {formatPersianNumber(prod.quantity)} عدد - {prod.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Invoices (Sales) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">آخرین فاکتورهای پرداخت شده</CardTitle>
          </CardHeader>
          <CardContent>
            {latestInvoices.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">داده‌ای یافت نشد</p>
            ) : (
              <div className="space-y-2">
                {latestInvoices.map((inv) => (
                  <div key={inv.id} className="text-xs border-b pb-2">
                    <div className="font-medium">{inv.customerName}</div>
                    <div className="text-muted-foreground">
                      {formatPersianNumber(inv.total)} تومان - {inv.paidDate || inv.date}
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      {inv.invoiceNumber}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">آخرین هزینه‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {latestCosts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">داده‌ای یافت نشد</p>
            ) : (
              <div className="space-y-2">
                {latestCosts.map((cost) => (
                  <div key={cost.id} className="text-xs border-b pb-2">
                    <div className="font-medium">{cost.typeLabel}</div>
                    <div className="text-muted-foreground">
                      {formatPersianNumber(cost.amount)} تومان - {cost.periodValue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
