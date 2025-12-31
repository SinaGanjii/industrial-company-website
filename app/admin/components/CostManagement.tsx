"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Zap, Droplets, Flame, Users, DollarSign } from "lucide-react"
import type { Product, Cost } from "../types"
import { getTodayPersianDate, formatPersianNumber } from "../utils"

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
  { value: "salary", label: "حقوق", icon: Users, color: "purple" },
  { value: "other", label: "سایر", icon: DollarSign, color: "gray" },
] as const

export function CostManagement({ products, costs, onAdd, onDelete }: CostManagementProps) {
  const [formData, setFormData] = useState({
    type: "electricity" as Cost["type"],
    amount: "",
    date: getTodayPersianDate(),
    description: "",
    productId: "none",
    productionDate: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.date || !formData.description) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید")
      return
    }

    const costType = COST_TYPES.find((ct) => ct.value === formData.type)

    onAdd({
      type: formData.type,
      typeLabel: costType?.label || formData.type,
      amount: Number.parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      productId: formData.productId && formData.productId !== "none" ? formData.productId : undefined,
      productionDate: formData.productionDate || undefined,
    })

    setFormData({
      type: "electricity",
      amount: "",
      date: getTodayPersianDate(),
      description: "",
      productId: "none",
      productionDate: "",
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
      gray: "bg-gray-500/10 text-gray-600",
    }
    return colorMap[color] || colorMap.gray
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
                <Label>تاریخ *</Label>
                <Input
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="۱۴۰۳/۱۰/۱۵"
                  required
                />
              </div>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>لینک به محصول (اختیاری)</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب محصول (اختیاری)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون لینک</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>لینک به تاریخ تولید (اختیاری)</Label>
                <Input
                  value={formData.productionDate}
                  onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                  placeholder="۱۴۰۳/۱۰/۱۵"
                />
              </div>
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
          <CardTitle>لیست هزینه‌ها ({costs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {costs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">هزینه‌ای ثبت نشده است</p>
            ) : (
              costs
                .sort((a, b) => b.date.localeCompare(a.date))
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
                        <span>تاریخ: {cost.date}</span>
                        {cost.productId && (
                          <span>
                            محصول: {products.find((p) => p.id === cost.productId)?.name}
                          </span>
                        )}
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

