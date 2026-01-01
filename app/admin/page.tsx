"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Package,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Factory,
  X,
  BarChart3,
  FileText,
  ShoppingCart,
} from "lucide-react"

// Import new types and services
import type { Product, Production, Cost, Sale, Invoice } from "./types"
import { useSupabaseData } from "./hooks/useSupabaseData"
import { Dashboard } from "./components/Dashboard"
import { ProductManagement } from "./components/ProductManagement"
import { ProductionManagement } from "./components/ProductionManagement"
import { CostManagement } from "./components/CostManagement"
import { InvoiceManagement } from "./components/InvoiceManagement"
import { getTodayPersianDate } from "./utils"
import { AuthProvider, useAuth } from "./providers/AuthProvider"
import { useToast } from "@/components/ui/use-toast"

function AdminContent() {
  const { isAuthenticated, isLoading, login, logout } = useAuth()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Use Supabase data hook
  const {
    products,
    productions,
    costs,
    sales,
    invoices,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addProduction,
    deleteProduction,
    addCost,
    deleteCost,
    addSales,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  } = useSupabaseData()

  // Handlers using Supabase
  const handleAddProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addProduct(productData)
    } catch (error) {
      alert("خطا در افزودن محصول: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await updateProduct(id, updates)
    } catch (error) {
      alert("خطا در بروزرسانی محصول: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)
    } catch (error) {
      alert("خطا در حذف محصول: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleAddProduction = async (productionData: Omit<Production, "id" | "createdAt">) => {
    try {
      await addProduction(productionData)
    } catch (error) {
      alert("خطا در ثبت تولید: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleDeleteProduction = async (id: string) => {
    try {
      await deleteProduction(id)
    } catch (error) {
      alert("خطا در حذف رکورد تولید: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleAddCost = async (costData: Omit<Cost, "id" | "createdAt">) => {
    try {
      await addCost(costData)
    } catch (error) {
      alert("خطا در افزودن هزینه: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleDeleteCost = async (id: string) => {
    try {
      await deleteCost(id)
    } catch (error) {
      alert("خطا در حذف هزینه: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }


  const handleAddInvoice = async (invoice: Invoice) => {
    try {
      await addInvoice(invoice)
    } catch (error) {
      alert("خطا در ایجاد فاکتور: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleUpdateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await updateInvoice(id, updates)
    } catch (error) {
      alert("خطا در بروزرسانی فاکتور: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    try {
      await deleteInvoice(id)
    } catch (error) {
      alert("خطا در حذف فاکتور: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    
    const result = await login(credentials.username, credentials.password)
    
    if (!result.success) {
      toast({
        title: "خطا در ورود",
        description: result.error || "نام کاربری یا رمز عبور اشتباه است",
        variant: "destructive",
      })
    } else {
      toast({
        title: "ورود موفق",
        description: "با موفقیت وارد شدید",
      })
    }
    
    setIsLoggingIn(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">در حال بررسی احراز هویت...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Building2 className="h-10 w-10 text-accent" />
              <CardTitle className="text-3xl">پنل مدیریت</CardTitle>
            </div>
            <p className="text-center text-muted-foreground">برای دسترسی وارد شوید</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">نام کاربری</label>
                <Input
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="admin"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رمز عبور</label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoggingIn}>
                {isLoggingIn ? "در حال ورود..." : "ورود به پنل"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">در حال بارگذاری داده‌ها...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">خطا در بارگذاری داده‌ها</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>تلاش مجدد</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Admin Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold text-foreground">پنل مدیریت</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/" target="_blank" rel="noreferrer">
                  مشاهده سایت
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="dashboard" className="gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              داشبورد
            </TabsTrigger>
            <TabsTrigger value="production" className="gap-2 py-3">
              <Factory className="h-4 w-4" />
              تولید
            </TabsTrigger>
            <TabsTrigger value="sales-invoices" className="gap-2 py-3">
              <FileText className="h-4 w-4" />
              فاکتورها
            </TabsTrigger>
            <TabsTrigger value="costs" className="gap-2 py-3">
              <DollarSign className="h-4 w-4" />
              هزینه‌ها
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 py-3">
              <Package className="h-4 w-4" />
              محصولات
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard products={products} productions={productions} invoices={invoices} costs={costs} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <ProductManagement
              products={products}
              onAdd={handleAddProduct}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct}
            />
          </TabsContent>

          {/* Production Tab */}
          <TabsContent value="production" className="space-y-4">
            <ProductionManagement
              products={products}
              productions={productions}
              onAdd={handleAddProduction}
              onDelete={handleDeleteProduction}
            />
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-4">
            <CostManagement
              products={products}
              costs={costs}
              invoices={invoices}
              onAdd={handleAddCost}
              onDelete={handleDeleteCost}
            />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="sales-invoices" className="space-y-4">
            <InvoiceManagement
              products={products}
              productions={productions}
              invoices={invoices}
              sales={sales}
              onAdd={handleAddInvoice}
              onUpdate={handleUpdateInvoice}
              onDelete={handleDeleteInvoice}
              onAddSales={async (newSales) => {
                // Add multiple sales at once (only from invoices)
                try {
                  await addSales(newSales)
                } catch (error) {
                  alert("خطا در ثبت فروشات: " + (error instanceof Error ? error.message : "خطای ناشناخته"))
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  )
}