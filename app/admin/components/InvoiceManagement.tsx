"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Check, FileText, Download } from "lucide-react"
import type { Product, Invoice, InvoiceItem, Sale, Production } from "../types"
import { InvoiceService } from "../services/InvoiceService"
import { StockService } from "../services/StockService"
import { exportInvoiceToPDF, exportInvoiceToExcel } from "../utils/exportUtils"
import { getTodayPersianDate, formatPersianNumber } from "../utils"

interface InvoiceManagementProps {
  products: Product[]
  productions: Production[] // Needed for stock calculation
  invoices: Invoice[]
  sales: Sale[] // Sales array to check if invoice already created sales
  onAdd: (invoice: Invoice) => void
  onUpdate: (id: string, invoice: Partial<Invoice>) => void
  onDelete: (id: string) => void
  onAddSales?: (sales: Array<Omit<Sale, "id" | "createdAt">>) => void // Callback to create sales when invoice is paid
}

export function InvoiceManagement({
  products,
  productions,
  invoices,
  sales,
  onAdd,
  onUpdate,
  onDelete,
  onAddSales,
}: InvoiceManagementProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    customerTaxId: "",
    items: [] as Array<{ productId: string; quantity: number }>,
    notes: "",
  })
  const [selectedProduct, setSelectedProduct] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")

  const handleAddItem = () => {
    if (!selectedProduct || !itemQuantity) return
    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    // Calculate available stock (considering items already in the invoice)
    const currentStock = StockService.getProductStock(selectedProduct, productions, sales)
    const quantityInInvoice = formData.items
      .filter((item) => item.productId === selectedProduct)
      .reduce((sum, item) => sum + item.quantity, 0)
    const availableStock = currentStock - quantityInInvoice
    const requestedQuantity = Number.parseInt(itemQuantity)

    // Check if stock is sufficient
    if (requestedQuantity > availableStock) {
      alert(
        `موجودی کافی نیست.\nموجودی فعلی: ${formatPersianNumber(currentStock)} عدد\nدر فاکتور: ${formatPersianNumber(quantityInInvoice)} عدد\nموجودی قابل استفاده: ${formatPersianNumber(availableStock)} عدد`
      )
      return
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: selectedProduct, quantity: requestedQuantity },
      ],
    })
    setSelectedProduct("")
    setItemQuantity("")
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleCreateInvoice = () => {
    if (!formData.customerName || formData.items.length === 0) {
      alert("لطفاً اطلاعات مشتری و حداقل یک محصول را وارد کنید")
      return
    }

    const invoiceItems: InvoiceItem[] = formData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      return InvoiceService.createInvoiceItem(product, item.quantity)
    })

    const invoice = InvoiceService.createInvoice(
      formData.customerName,
      invoiceItems,
      invoices,
      {
        address: formData.customerAddress || undefined,
        phone: formData.customerPhone || undefined,
        taxId: formData.customerTaxId || undefined,
      },
      formData.notes || undefined
    )

    onAdd(invoice)
    setIsCreating(false)
    setFormData({
      customerName: "",
      customerAddress: "",
      customerPhone: "",
      customerTaxId: "",
      items: [],
      notes: "",
    })
  }

  const handleApprove = (invoice: Invoice) => {
    const approved = InvoiceService.approveInvoice(invoice)
    onUpdate(invoice.id, approved)
  }

  const handleMarkPaid = (invoice: Invoice) => {
    // Check if sales already exist for this invoice
    const existingSales = sales.filter((s) => s.invoiceId === invoice.id)
    
    // Mark invoice as paid first to get the paidDate
    const paid = InvoiceService.markAsPaid(invoice)
    onUpdate(invoice.id, paid)
    
    // Create sales entries from invoice items if they don't exist yet
    if (existingSales.length === 0 && onAddSales) {
      // Use InvoiceService to convert invoice to sales
      const newSales = InvoiceService.invoiceToSales(paid)
      // Add all sales at once
      onAddSales(newSales)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این فاکتور اطمینان دارید؟")) {
      onDelete(id)
    }
  }

  const getStatusLabel = (status: Invoice["status"]) => {
    const labels = {
      draft: "پیش‌نویس",
      approved: "تایید شده",
      paid: "پرداخت شده",
    }
    return labels[status]
  }

  const getStatusColor = (status: Invoice["status"]) => {
    const colors = {
      draft: "bg-gray-500/10 text-gray-600",
      approved: "bg-blue-500/10 text-blue-600",
      paid: "bg-green-500/10 text-green-600",
    }
    return colors[status]
  }

  return (
    <div className="space-y-4">
      {/* Create Invoice Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>ایجاد فاکتور جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام مشتری *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="نام مشتری"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>آدرس</Label>
                  <Input
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    placeholder="آدرس"
                  />
                </div>
                <div className="space-y-2">
                  <Label>تلفن</Label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="تلفن"
                  />
                </div>
                <div className="space-y-2">
                  <Label>کد اقتصادی</Label>
                  <Input
                    value={formData.customerTaxId}
                    onChange={(e) => setFormData({ ...formData, customerTaxId: e.target.value })}
                    placeholder="کد اقتصادی"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>افزودن محصول</Label>
                <div className="flex gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="انتخاب محصول" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => {
                        const stock = StockService.getProductStock(product.id, productions, sales)
                        const quantityInInvoice = formData.items
                          .filter((item) => item.productId === product.id)
                          .reduce((sum, item) => sum + item.quantity, 0)
                        const availableStock = stock - quantityInInvoice
                        return (
                          <SelectItem 
                            key={product.id} 
                            value={product.id}
                            disabled={availableStock <= 0}
                          >
                            {product.name} - {formatPersianNumber(product.unitPrice)} تومان
                            {availableStock <= 0 ? " (موجودی: ۰)" : ` (موجودی: ${formatPersianNumber(availableStock)})`}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    placeholder="تعداد"
                    className="w-32"
                    min="1"
                    max={
                      selectedProduct
                        ? (() => {
                            const stock = StockService.getProductStock(selectedProduct, productions, sales)
                            const quantityInInvoice = formData.items
                              .filter((item) => item.productId === selectedProduct)
                              .reduce((sum, item) => sum + item.quantity, 0)
                            return stock - quantityInInvoice
                          })()
                        : undefined
                    }
                  />
                  <Button type="button" onClick={handleAddItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">
                    موجودی قابل استفاده:{" "}
                    {formatPersianNumber(
                      (() => {
                        const stock = StockService.getProductStock(selectedProduct, productions, sales)
                        const quantityInInvoice = formData.items
                          .filter((item) => item.productId === selectedProduct)
                          .reduce((sum, item) => sum + item.quantity, 0)
                        return stock - quantityInInvoice
                      })()
                    )}{" "}
                    عدد
                  </p>
                )}
              </div>

              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <Label>محصولات</Label>
                  <div className="border rounded-lg p-4 space-y-2">
                    {formData.items.map((item, index) => {
                      const product = products.find((p) => p.id === item.productId)!
                      const stock = StockService.getProductStock(item.productId, productions, sales)
                      const quantityInInvoice = formData.items
                        .filter((i) => i.productId === item.productId)
                        .slice(0, index + 1)
                        .reduce((sum, i) => sum + i.quantity, 0)
                      const availableStock = stock - quantityInInvoice + item.quantity
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded ${
                            availableStock < item.quantity ? "bg-red-500/10 border border-red-500/20" : "bg-muted"
                          }`}
                        >
                          <div className="flex-1">
                            <span>
                              {product.name} × {item.quantity} ={" "}
                              {formatPersianNumber(product.unitPrice * item.quantity)} تومان
                            </span>
                            {availableStock < item.quantity && (
                              <p className="text-xs text-red-600 mt-1">
                                ⚠️ موجودی کافی نیست (موجودی: {formatPersianNumber(stock)})
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-bold">
                        <span>جمع کل:</span>
                        <span>
                          {formatPersianNumber(
                            formData.items.reduce((sum, item) => {
                              const product = products.find((p) => p.id === item.productId)!
                              return sum + product.unitPrice * item.quantity
                            }, 0)
                          )}{" "}
                          تومان
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>یادداشت</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="یادداشت (اختیاری)"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateInvoice}>ایجاد فاکتور</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  انصراف
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          ایجاد فاکتور جدید
        </Button>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>لیست فاکتورها ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">فاکتوری ایجاد نشده است</p>
            ) : (
              invoices
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm">{invoice.invoiceNumber}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}
                          >
                            {getStatusLabel(invoice.status)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground">{invoice.customerName}</h4>
                        <p className="text-sm text-muted-foreground">تاریخ: {invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {formatPersianNumber(invoice.total)} تومان
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {invoice.items.length} آیتم
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invoice.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(invoice)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          تایید
                        </Button>
                      )}
                      {invoice.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkPaid(invoice)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          پرداخت شده
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportInvoiceToPDF(invoice)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportInvoiceToExcel(invoice)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(invoice.id)}
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

