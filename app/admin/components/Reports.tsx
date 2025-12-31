"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar } from "lucide-react"
import type { Product, Production, Sale, Cost } from "../types"
import { ReportService } from "../services/ReportService"
import { exportReportToExcel } from "../utils/exportUtils"
import { getTodayPersianDate, getCurrentMonthYear, formatPersianNumber } from "../utils"

interface ReportsProps {
  products: Product[]
  productions: Production[]
  sales: Sale[]
  costs: Cost[]
}

export function Reports({ products, productions, sales, costs }: ReportsProps) {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "yearly" | "custom">("daily")
  const [selectedDate, setSelectedDate] = useState(getTodayPersianDate())
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { month, year } = getCurrentMonthYear()

  const generateReport = () => {
    switch (reportType) {
      case "daily":
        return ReportService.generateDailyReport(selectedDate, productions, sales, costs)
      case "monthly":
        return ReportService.generateMonthlyReport(month, year, products, productions, sales, costs)
      case "custom":
        if (!startDate || !endDate) {
          alert("لطفاً تاریخ شروع و پایان را وارد کنید")
          return null
        }
        return ReportService.generateCustomReport(startDate, endDate, products, productions, sales, costs)
      default:
        return null
    }
  }

  const handleExport = () => {
    const report = generateReport()
    if (!report) return

    if (reportType === "daily") {
      exportReportToExcel(report as any, "daily")
    } else {
      exportReportToExcel(report as any, "monthly")
    }
  }

  const report = generateReport()

  return (
    <div className="space-y-4">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>انتخاب نوع گزارش</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نوع گزارش</Label>
              <Select
                value={reportType}
                onValueChange={(value: typeof reportType) => setReportType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">روزانه</SelectItem>
                  <SelectItem value="weekly">هفتگی</SelectItem>
                  <SelectItem value="monthly">ماهانه</SelectItem>
                  <SelectItem value="yearly">سالانه</SelectItem>
                  <SelectItem value="custom">شخصی‌سازی شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "daily" && (
              <div className="space-y-2">
                <Label>تاریخ</Label>
                <Input
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  placeholder="۱۴۰۳/۱۰/۱۵"
                />
              </div>
            )}

            {reportType === "custom" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاریخ شروع</Label>
                  <Input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="۱۴۰۳/۱۰/۰۱"
                  />
                </div>
                <div className="space-y-2">
                  <Label>تاریخ پایان</Label>
                  <Input
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="۱۴۰۳/۱۰/۳۰"
                  />
                </div>
              </div>
            )}

            {report && (
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                خروجی Excel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>
              گزارش {reportType === "daily" ? "روزانه" : reportType === "monthly" ? "ماهانه" : "شخصی‌سازی شده"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportType === "daily" && "date" in report && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">تولید</h4>
                    <p className="text-2xl font-bold">{formatPersianNumber(report.production.totalQuantity)}</p>
                    <p className="text-sm text-muted-foreground">عدد</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">فروش</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPersianNumber(report.sales.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">تومان ({report.sales.count} فروش)</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">هزینه‌ها</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPersianNumber(report.expenses.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">تومان</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">سود خالص</h4>
                    <p className={`text-2xl font-bold ${report.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPersianNumber(report.profit)}
                    </p>
                    <p className="text-sm text-muted-foreground">تومان</p>
                  </div>
                </div>
              </div>
            )}

            {reportType === "monthly" && "month" in report && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">تولید</h4>
                    <p className="text-2xl font-bold">{formatPersianNumber(report.production.totalQuantity)}</p>
                    <p className="text-sm text-muted-foreground">عدد</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">فروش</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPersianNumber(report.sales.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">تومان</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">هزینه‌ها</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPersianNumber(report.costs.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">تومان</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">سود خالص</h4>
                    <p className={`text-2xl font-bold ${report.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPersianNumber(report.profit)}
                    </p>
                    <p className="text-sm text-muted-foreground">تومان</p>
                  </div>
                </div>

                {report.profitByProduct.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">سود به تفکیک محصول</h4>
                    <div className="space-y-2">
                      {report.profitByProduct.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span>{item.productName}</span>
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
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

