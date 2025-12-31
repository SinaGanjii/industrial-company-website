"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, AlertCircle } from "lucide-react"
import type { Product, Production, Sale } from "../types"
import { StockService } from "../services/StockService"
import { getTodayPersianDate, formatPersianNumber } from "../utils"

interface SalesManagementProps {
  products: Product[]
  productions: Production[]
  sales: Sale[]
  onAdd: (sale: Omit<Sale, "id" | "createdAt">) => void
  onDelete: (id: string) => void
}

export function SalesManagement({
  products,
  productions,
  sales,
  onAdd,
  onDelete,
}: SalesManagementProps) {
  const [formData, setFormData] = useState({
    productId: "",
    customerName: "",
    quantity: "",
    unitPrice: "",
    date: getTodayPersianDate(),
  })

  const selectedProduct = products.find((p) => p.id === formData.productId)
  const availableStock = selectedProduct
    ? StockService.getProductStock(selectedProduct.id, productions, sales)
    : 0

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setFormData({
      ...formData,
      productId,
      unitPrice: product?.unitPrice.toString() || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId || !formData.customerName || !formData.quantity || !formData.unitPrice) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید")
      return
    }

    const quantity = Number.parseInt(formData.quantity)
    if (quantity > availableStock) {
      alert(`موجودی کافی نیست. موجودی فعلی: ${formatPersianNumber(availableStock)} عدد`)
      return
    }

    onAdd({
      customerName: formData.customerName,
      productId: formData.productId,
      productName: selectedProduct?.name || "",
      quantity,
      unitPrice: Number.parseFloat(formData.unitPrice),
      totalPrice: quantity * Number.parseFloat(formData.unitPrice),
      date: formData.date,
    })

    setFormData({
      productId: "",
      customerName: "",
      quantity: "",
      unitPrice: "",
      date: getTodayPersianDate(),
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این فروش اطمینان دارید؟")) {
      onDelete(id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Sale Form */}
      <Card>
        <CardHeader>
          <CardTitle>ثبت فروش</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>محصول *</Label>
                <Select value={formData.productId} onValueChange={handleProductChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب محصول" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => {
                      const stock = StockService.getProductStock(product.id, productions, sales)
                      return (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (موجودی: {formatPersianNumber(stock)})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مشتری *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="نام مشتری"
                  required
                />
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
                  max={availableStock}
                />
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">
                    موجودی: {formatPersianNumber(availableStock)} عدد
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>قیمت واحد (تومان) *</Label>
                <Input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
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
              {selectedProduct && formData.quantity && formData.unitPrice && (
                <div className="space-y-2">
                  <Label>مجموع</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {formatPersianNumber(
                        Number.parseInt(formData.quantity) * Number.parseFloat(formData.unitPrice || "0")
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">تومان</div>
                  </div>
                </div>
              )}
            </div>
            {selectedProduct && Number.parseInt(formData.quantity || "0") > availableStock && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  موجودی کافی نیست. موجودی فعلی: {formatPersianNumber(availableStock)} عدد
                </span>
              </div>
            )}
            <Button type="submit" disabled={Number.parseInt(formData.quantity || "0") > availableStock}>
              <Plus className="h-4 w-4 mr-2" />
              ثبت فروش
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>لیست فروشات ({sales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">فروشی ثبت نشده است</p>
            ) : (
              sales
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2">{sale.productName}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>مشتری: {sale.customerName}</span>
                        <span>تعداد: {formatPersianNumber(sale.quantity)} عدد</span>
                        <span>تاریخ: {sale.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatPersianNumber(sale.totalPrice)}
                        </div>
                        <div className="text-xs text-muted-foreground">تومان</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(sale.id)}
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

