"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Edit, Trash2 } from "lucide-react"
import type { Product } from "../types"
import { formatPersianNumber } from "../utils"

interface ProductManagementProps {
  products: Product[]
  onAdd: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  onUpdate: (id: string, product: Partial<Product>) => void
  onDelete: (id: string) => void
}

export function ProductManagement({ products, onAdd, onUpdate, onDelete }: ProductManagementProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    dimensions: "",
    material: "",
    unitPrice: "",
  })

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.dimensions || !formData.unitPrice) {
      alert("لطفاً تمام فیلدهای الزامی را پر کنید")
      return
    }

    if (editingId) {
      onUpdate(editingId, {
        name: formData.name,
        dimensions: formData.dimensions,
        material: formData.material,
        unitPrice: Number.parseFloat(formData.unitPrice),
        updatedAt: new Date().toISOString(),
      })
      setEditingId(null)
    } else {
      onAdd({
        name: formData.name,
        dimensions: formData.dimensions,
        material: formData.material,
        unitPrice: Number.parseFloat(formData.unitPrice),
      })
    }

    setFormData({ name: "", dimensions: "", material: "", unitPrice: "" })
    setIsAdding(false)
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      dimensions: product.dimensions,
      material: product.material,
      unitPrice: product.unitPrice.toString(),
    })
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: "", dimensions: "", material: "", unitPrice: "" })
  }

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      onDelete(id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "ویرایش محصول" : "افزودن محصول جدید"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام محصول *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: بلوک سبک ۱۰ دوجداره"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>ابعاد *</Label>
                  <Input
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="مثال: ۴۰×۱۰×۲۰"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>مواد اولیه</Label>
                  <Input
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="مثال: پوکه معدنی"
                  />
                </div>
                <div className="space-y-2">
                  <Label>قیمت واحد (تومان) *</Label>
                  <Input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="۰"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "ذخیره تغییرات" : "افزودن محصول"}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="جستجوی محصول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            افزودن محصول
          </Button>
        )}
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>لیست محصولات ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">محصولی یافت نشد</p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{product.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>ابعاد: {product.dimensions}</span>
                      {product.material && <span>مواد: {product.material}</span>}
                      <span className="font-bold text-foreground">
                        قیمت: {formatPersianNumber(product.unitPrice)} تومان
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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

