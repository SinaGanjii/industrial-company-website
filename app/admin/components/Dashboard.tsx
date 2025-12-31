"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Factory, TrendingUp, TrendingDown, Package, DollarSign, Zap, Droplets, Flame, Users, Wallet, Download, Calendar } from "lucide-react"
import type { Product, Production, Sale, Cost } from "../types"
import { StockService } from "../services/StockService"
import { ReportService } from "../services/ReportService"
import { exportReportToExcel } from "../utils/exportUtils"
import { getTodayPersianDate, getCurrentMonthYear, formatPersianNumber } from "../utils"

interface DashboardProps {
  products: Product[]
  productions: Production[]
  sales: Sale[]
  costs: Cost[]
}

export function Dashboard({ products, productions, sales, costs }: DashboardProps) {
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily")
  const [selectedDate, setSelectedDate] = useState(getTodayPersianDate())
  const { month, year } = getCurrentMonthYear()

  // Calculate data based on period
  const getPeriodData = () => {
    switch (periodType) {
      case "daily": {
        const dayProductions = productions.filter((p) => p.date === selectedDate)
        const daySales = sales.filter((s) => s.date === selectedDate)
        const dayCosts = costs.filter((c) => c.date === selectedDate)
        
        return {
          productionQty: dayProductions.reduce((sum, p) => sum + p.quantity, 0),
          salesAmount: daySales.reduce((sum, s) => sum + s.totalPrice, 0),
          salesQty: daySales.reduce((sum, s) => sum + s.quantity, 0),
          expenses: dayCosts.reduce((sum, c) => sum + c.amount, 0),
          costs: dayCosts,
          periodLabel: `روز ${selectedDate}`,
        }
      }
      case "weekly": {
        // Get all dates and sort them, take last 7 days
        const allDates = [...new Set([
          ...productions.map(p => p.date),
          ...sales.map(s => s.date),
          ...costs.map(c => c.date)
        ])].sort()
        
        const last7Days = allDates.slice(-7)
        
        const weekProductions = productions.filter((p) => last7Days.includes(p.date))
        const weekSales = sales.filter((s) => last7Days.includes(s.date))
        const weekCosts = costs.filter((c) => last7Days.includes(c.date))
        
        return {
          productionQty: weekProductions.reduce((sum, p) => sum + p.quantity, 0),
          salesAmount: weekSales.reduce((sum, s) => sum + s.totalPrice, 0),
          salesQty: weekSales.reduce((sum, s) => sum + s.quantity, 0),
          expenses: weekCosts.reduce((sum, c) => sum + c.amount, 0),
          costs: weekCosts,
          periodLabel: `هفته گذشته (${last7Days.length} روز)`,
        }
      }
      case "monthly": {
        const monthProductions = productions.filter((p) => {
          const [pYear, pMonth] = p.date.split("/")
          return pYear === year && pMonth === month
        })
        const monthSales = sales.filter((s) => {
          const [sYear, sMonth] = s.date.split("/")
          return sYear === year && sMonth === month
        })
        const monthCosts = costs.filter((c) => {
          const [cYear, cMonth] = c.date.split("/")
          return cYear === year && cMonth === month
        })
        
        return {
          productionQty: monthProductions.reduce((sum, p) => sum + p.quantity, 0),
          salesAmount: monthSales.reduce((sum, s) => sum + s.totalPrice, 0),
          salesQty: monthSales.reduce((sum, s) => sum + s.quantity, 0),
          expenses: monthCosts.reduce((sum, c) => sum + c.amount, 0),
          costs: monthCosts,
          periodLabel: `ماه ${month}/${year}`,
        }
      }
      case "yearly": {
        const yearProductions = productions.filter((p) => {
          const [pYear] = p.date.split("/")
          return pYear === year
        })
        const yearSales = sales.filter((s) => {
          const [sYear] = s.date.split("/")
          return sYear === year
        })
        const yearCosts = costs.filter((c) => {
          const [cYear] = c.date.split("/")
          return cYear === year
        })
        
        return {
          productionQty: yearProductions.reduce((sum, p) => sum + p.quantity, 0),
          salesAmount: yearSales.reduce((sum, s) => sum + s.totalPrice, 0),
          salesQty: yearSales.reduce((sum, s) => sum + s.quantity, 0),
          expenses: yearCosts.reduce((sum, c) => sum + c.amount, 0),
          costs: yearCosts,
          periodLabel: `سال ${year}`,
        }
      }
    }
  }

  const periodData = getPeriodData()
  const profit = periodData.salesAmount - periodData.expenses

  // Calculate stocks (always current)
  const stocks = StockService.calculateAllStocks(products, productions, sales)
  const totalStock = stocks.reduce((sum, s) => sum + s.remainingStock, 0)

  // Cost breakdown for the period
  const electricityCost = periodData.costs.filter((c) => c.type === "electricity").reduce((sum, c) => sum + c.amount, 0)
  const waterCost = periodData.costs.filter((c) => c.type === "water").reduce((sum, c) => sum + c.amount, 0)
  const gasCost = periodData.costs.filter((c) => c.type === "gas").reduce((sum, c) => sum + c.amount, 0)
  const salaryCost = periodData.costs.filter((c) => c.type === "salary").reduce((sum, c) => sum + c.amount, 0)

  // Generate report for export
  const generateReportForExport = () => {
    switch (periodType) {
      case "daily":
        return ReportService.generateDailyReport(selectedDate, productions, sales, costs)
      case "monthly":
        return ReportService.generateMonthlyReport(month, year, products, productions, sales, costs)
      case "weekly": {
        // Get all dates and take last 7 days
        const allDates = [...new Set([
          ...productions.map(p => p.date),
          ...sales.map(s => s.date),
          ...costs.map(c => c.date)
        ])].sort()
        
        if (allDates.length === 0) return null
        
        const last7Days = allDates.slice(-7)
        const startDate = last7Days[0]
        const endDate = last7Days[last7Days.length - 1]
        
        return ReportService.generateCustomReport(startDate, endDate, products, productions, sales, costs)
      }
      case "yearly": {
        const startDate = `${year}/01/01`
        const allDates = [...new Set([
          ...productions.map(p => p.date),
          ...sales.map(s => s.date),
          ...costs.map(c => c.date)
        ])].sort()
        const endDate = allDates.length > 0 ? allDates[allDates.length - 1] : `${year}/12/29`
        
        return ReportService.generateCustomReport(startDate, endDate, products, productions, sales, costs)
      }
      default:
        return null
    }
  }

  const handleExport = () => {
    const report = generateReportForExport()
    if (!report) return

    if (periodType === "daily") {
      exportReportToExcel(report as any, "daily")
    } else {
      exportReportToExcel(report as any, "monthly")
    }
  }

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>انتخاب دوره زمانی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>نوع دوره</Label>
              <Select
                value={periodType}
                onValueChange={(value: typeof periodType) => setPeriodType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">روزانه</SelectItem>
                  <SelectItem value="weekly">هفتگی</SelectItem>
                  <SelectItem value="monthly">ماهانه</SelectItem>
                  <SelectItem value="yearly">سالانه</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {periodType === "daily" && (
              <div className="flex-1 space-y-2">
                <Label>تاریخ</Label>
                <Input
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  placeholder="۱۴۰۳/۱۰/۱۵"
                />
              </div>
            )}
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              خروجی Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Production */}
        <Card className="border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Factory className="h-5 w-5 text-accent" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {formatPersianNumber(periodData.productionQty)}
            </div>
            <div className="text-xs text-muted-foreground">تولید {periodData.periodLabel} (عدد)</div>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card className="border-green-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatPersianNumber(periodData.salesAmount)}
            </div>
            <div className="text-xs text-muted-foreground">فروش {periodData.periodLabel} (تومان)</div>
            {periodType === "daily" && (
              <div className="text-xs text-muted-foreground mt-1">
                {formatPersianNumber(periodData.salesQty)} عدد فروخته شده
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="border-red-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatPersianNumber(periodData.expenses)}
            </div>
            <div className="text-xs text-muted-foreground">هزینه {periodData.periodLabel} (تومان)</div>
          </CardContent>
        </Card>

        {/* Profit */}
        <Card className="border-blue-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <TrendingUp className={`h-4 w-4 ${profit >= 0 ? "text-green-600" : "text-red-600"}`} />
            </div>
            <div className={`text-2xl font-bold mb-1 ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPersianNumber(profit)}
            </div>
            <div className="text-xs text-muted-foreground">سود {periodData.periodLabel} (تومان)</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Stock */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">موجودی فعلی</h3>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatPersianNumber(totalStock)} عدد
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stocks.slice(0, 4).map((stock) => (
              <div key={stock.productId} className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-foreground mb-1">{stock.productName}</div>
                <div className="text-lg font-bold text-accent">{formatPersianNumber(stock.remainingStock)}</div>
                <div className="text-xs text-muted-foreground">عدد</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      {periodData.expenses > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">تفکیک هزینه‌های {periodData.periodLabel}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {electricityCost > 0 && (
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">برق</span>
                  </div>
                  <div className="text-lg font-bold text-yellow-600">
                    {formatPersianNumber(electricityCost)}
                  </div>
                </div>
              )}
              {waterCost > 0 && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">آب</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatPersianNumber(waterCost)}
                  </div>
                </div>
              )}
              {gasCost > 0 && (
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">گاز</span>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {formatPersianNumber(gasCost)}
                  </div>
                </div>
              )}
              {salaryCost > 0 && (
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">حقوق</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatPersianNumber(salaryCost)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profit by Product (for monthly and yearly) */}
      {(periodType === "monthly" || periodType === "yearly") && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">سود به تفکیک محصول ({periodData.periodLabel})</h3>
            {(() => {
              const report = generateReportForExport()
              if (!report || !("profitByProduct" in report)) return null
              
              return (
                <div className="space-y-2">
                  {report.profitByProduct
                    .filter((item) => item.profit !== 0 || item.revenue > 0)
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{item.productName}</span>
                        <div className="text-right">
                          <div className={`font-bold ${item.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatPersianNumber(item.profit)} تومان
                          </div>
                          <div className="text-xs text-muted-foreground">
                            حاشیه سود: {item.profitMargin.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
