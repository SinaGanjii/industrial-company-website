"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import type { Product, Production } from "../types"
import { getTodayPersianDate, formatPersianNumber } from "../utils"

interface ProductionManagementProps {
  products: Product[]
  productions: Production[]
  onAdd: (production: Omit<Production, "id" | "createdAt">) => void
  onDelete: (id: string) => void
}

export function ProductionManagement({
  products,
  productions,
  onAdd,
  onDelete,
}: ProductionManagementProps) {
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    date: getTodayPersianDate(),
    shift: "صبح" as "صبح" | "عصر" | "شب",
  })

  const selectedProduct = products.find((p) => p.id === formData.productId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId || !formData.quantity || !formData.date) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید")
      return
    }

    onAdd({
      productId: formData.productId,
      productName: selectedProduct?.name || "",
      quantity: Number.parseInt(formData.quantity),
      date: formData.date,
      shift: formData.shift,
    })

    setFormData({
      productId: "",
      quantity: "",
      date: getTodayPersianDate(),
      shift: "صبح",
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این رکورد تولید اطمینان دارید؟")) {
      onDelete(id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Production Form */}
      <Card>
        <CardHeader>
          <CardTitle>ثبت تولید روزانه</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>محصول *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب محصول" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تعداد (عدد) *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="۰"
                  required
                  min="1"
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
              <div className="space-y-2">
                <Label>شیفت *</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value: "صبح" | "عصر" | "شب") =>
                    setFormData({ ...formData, shift: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="صبح">صبح</SelectItem>
                    <SelectItem value="عصر">عصر</SelectItem>
                    <SelectItem value="شب">شب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              ثبت تولید
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Productions List */}
      <Card>
        <CardHeader>
          <CardTitle>لیست تولیدات ({productions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {productions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">رکورد تولیدی ثبت نشده است</p>
            ) : (
              productions
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((production) => (
                  <div
                    key={production.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                          {production.shift}
                        </span>
                        <h4 className="font-semibold text-foreground">{production.productName}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">تاریخ: {production.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {formatPersianNumber(production.quantity)}
                        </div>
                        <div className="text-xs text-muted-foreground">عدد</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(production.id)}
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

