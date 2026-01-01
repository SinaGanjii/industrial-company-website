"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Zap, Droplets, Flame, Users, DollarSign, Download, Home } from "lucide-react"
import type { Product, Cost } from "../types"
import { getTodayPersianDate, formatPersianNumber, getCurrentMonthYear } from "../utils"
import { exportCostsToPDF } from "../utils/exportUtils"

interface CostManagementProps {
  products: Product[]
  costs: Cost[]
  onAdd: (cost: Omit<Cost, "id" | "createdAt">) => void
  onDelete: (id: string) => void
}

const COST_TYPES = [
  { value: "electricity", label: "برق", icon: Zap, color: "yellow" },
  { value: "water", label: "آب", icon: Droplets, color: "blue" },
  { value: "gas", label: "گاز", icon: Flame, color: "orange" },
  { value: "rent", label: "اجاره", icon: Home, color: "indigo" },
  { value: "other", label: "سایر", icon: DollarSign, color: "gray" },
] as const

export function CostManagement({ products, costs, onAdd, onDelete }: CostManagementProps) {
  const { year, month } = getCurrentMonthYear()
  const today = getTodayPersianDate()

  const [formData, setFormData] = useState({
    type: "electricity" as Cost["type"],
    amount: "",
    periodType: "daily" as Cost["periodType"],
    periodValue: today, // Default to today for daily
    description: "",
  })

  // Update period value based on period type
  const handlePeriodTypeChange = (newPeriodType: Cost["periodType"]) => {
    let newPeriodValue = ""
    
    if (newPeriodType === "daily") {
      newPeriodValue = today
    } else if (newPeriodType === "monthly") {
      newPeriodValue = `${year}/${month}`
    }

    setFormData({
      ...formData,
      periodType: newPeriodType,
      periodValue: newPeriodValue,
    })
  }

  // Convert Persian/Arabic digits to Western digits for validation
  const convertToWesternDigits = (str: string): string => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
    const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
    const westernDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    
    let result = str
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(persianDigits[i], "g"), westernDigits[i])
      result = result.replace(new RegExp(arabicDigits[i], "g"), westernDigits[i])
    }
    return result
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.periodValue || !formData.description) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید")
      return
    }

    // Convert to western digits for validation
    const periodValueWestern = convertToWesternDigits(formData.periodValue)

    // Validate period value format (accept both Persian and Western digits)
    if (formData.periodType === "daily") {
      const dailyPattern = /^[۰-۹0-9]{4}\/[۰-۹0-9]{2}\/[۰-۹0-9]{2}$/
      if (!dailyPattern.test(formData.periodValue) && !/^\d{4}\/\d{2}\/\d{2}$/.test(periodValueWestern)) {
        alert("فرمت تاریخ نامعتبر است. باید به صورت YYYY/MM/DD باشد")
        return
      }
    }
    if (formData.periodType === "monthly") {
      const monthlyPattern = /^[۰-۹0-9]{4}\/[۰-۹0-9]{2}$/
      if (!monthlyPattern.test(formData.periodValue) && !/^\d{4}\/\d{2}$/.test(periodValueWestern)) {
        alert("فرمت ماه نامعتبر است. باید به صورت YYYY/MM باشد")
        return
      }
    }

    // Convert periodValue to western digits before saving
    const costToAdd = {
      ...formData,
      periodValue: periodValueWestern, // Save in western digits format
    }

    const costType = COST_TYPES.find((ct) => ct.value === formData.type)

    onAdd({
      type: formData.type,
      typeLabel: costType?.label || formData.type,
      periodType: formData.periodType,
      periodValue: periodValueWestern, // Use converted western digits
      amount: Math.round(Number.parseFloat(formData.amount)),
      description: formData.description,
    })

    // Reset form
    setFormData({
      type: "electricity",
      amount: "",
      periodType: "daily",
      periodValue: today,
      description: "",
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این هزینه اطمینان دارید؟")) {
      onDelete(id)
    }
  }

  const getCostIcon = (type: Cost["type"]) => {
    const costType = COST_TYPES.find((ct) => ct.value === type)
    const Icon = costType?.icon || DollarSign
    return <Icon className="h-4 w-4" />
  }

  const getCostColorClass = (type: Cost["type"]) => {
    const costType = COST_TYPES.find((ct) => ct.value === type)
    const color = costType?.color || "gray"
    const colorMap: Record<string, string> = {
      yellow: "bg-yellow-500/10 text-yellow-600",
      blue: "bg-blue-500/10 text-blue-600",
      orange: "bg-orange-500/10 text-orange-600",
      purple: "bg-purple-500/10 text-purple-600",
      indigo: "bg-indigo-500/10 text-indigo-600",
      gray: "bg-gray-500/10 text-gray-600",
    }
    return colorMap[color] || colorMap.gray
  }

  const getPeriodLabel = (cost: Cost): string => {
    if (cost.periodType === "daily") {
      return `روزانه: ${cost.periodValue}`
    } else if (cost.periodType === "monthly") {
      return `ماهانه: ${cost.periodValue}`
    }
    return cost.periodValue
  }

  const handleExportCosts = async () => {
    try {
      await exportCostsToPDF(costs)
    } catch (error) {
      console.error("Export error:", error)
      alert("خطا در ایجاد فایل PDF")
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Cost Form */}
      <Card>
        <CardHeader>
          <CardTitle>ثبت هزینه تولید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>نوع هزینه *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Cost["type"]) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COST_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مبلغ (تومان) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="۰"
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع دوره *</Label>
                <Select
                  value={formData.periodType}
                  onValueChange={handlePeriodTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">روزانه</SelectItem>
                    <SelectItem value="monthly">ماهانه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                {formData.periodType === "daily" && "تاریخ (YYYY/MM/DD) *"}
                {formData.periodType === "monthly" && "ماه (YYYY/MM) *"}
              </Label>
              <Input
                value={formData.periodValue}
                onChange={(e) => setFormData({ ...formData, periodValue: e.target.value })}
                placeholder={
                  formData.periodType === "daily" ? "۱۴۰۵/۱۰/۱۵" :
                  "۱۴۰۵/۱۰"
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.periodType === "daily" && "فرمت: YYYY/MM/DD (مثال: ۱۴۰۵/۱۰/۱۵)"}
                {formData.periodType === "monthly" && "فرمت: YYYY/MM (مثال: ۱۴۰۵/۱۰)"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>شرح *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="توضیحات هزینه"
                required
              />
            </div>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              افزودن هزینه
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Costs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>لیست هزینه‌ها ({costs.length})</CardTitle>
            {costs.length > 0 && (
              <Button
                onClick={handleExportCosts}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                خروجی PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {costs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">هزینه‌ای ثبت نشده است</p>
            ) : (
              costs
                .sort((a, b) => {
                  // Sort by period value, then by type
                  const periodCompare = b.periodValue.localeCompare(a.periodValue)
                  if (periodCompare !== 0) return periodCompare
                  return b.type.localeCompare(a.type)
                })
                .map((cost) => (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getCostColorClass(cost.type)}`}
                        >
                          {getCostIcon(cost.type)}
                          <span className="mr-1">{cost.typeLabel}</span>
                        </span>
                        <h4 className="font-semibold text-foreground">{cost.description}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{getPeriodLabel(cost)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {formatPersianNumber(cost.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">تومان</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(cost.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
