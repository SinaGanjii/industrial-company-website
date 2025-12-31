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
import { useDataPersistence } from "./hooks/useDataPersistence"
import { Dashboard } from "./components/Dashboard"
import { ProductManagement } from "./components/ProductManagement"
import { ProductionManagement } from "./components/ProductionManagement"
import { CostManagement } from "./components/CostManagement"
import { SalesManagement } from "./components/SalesManagement"
import { InvoiceManagement } from "./components/InvoiceManagement"
import { getTodayPersianDate } from "./utils"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })

  // Use new data persistence hook
  const {
    products,
    setProducts,
    productions,
    setProductions,
    costs,
    setCosts,
    sales,
    setSales,
    invoices,
    setInvoices,
  } = useDataPersistence()

  // Handlers for new system
  const handleAddProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts([...products, newProduct])
  }

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const handleAddProduction = (productionData: Omit<Production, "id" | "createdAt">) => {
    const newProduction: Production = {
      ...productionData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setProductions([...productions, newProduction])
  }

  const handleDeleteProduction = (id: string) => {
    setProductions(productions.filter((p) => p.id !== id))
  }

  const handleAddCost = (costData: Omit<Cost, "id" | "createdAt">) => {
    const newCost: Cost = {
      ...costData,
      id: `cost-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setCosts([...costs, newCost])
  }

  const handleDeleteCost = (id: string) => {
    setCosts(costs.filter((c) => c.id !== id))
  }

  const handleAddSale = (saleData: Omit<Sale, "id" | "createdAt">) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setSales([...sales, newSale])
  }

  const handleDeleteSale = (id: string) => {
    setSales(sales.filter((s) => s.id !== id))
  }

  const handleAddInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice])
  }

  const handleUpdateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)))
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter((inv) => inv.id !== id))
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("نام کاربری یا رمز عبور اشتباه است")
    }
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
              <Button type="submit" className="w-full h-12 text-base">
                ورود به پنل
              </Button>
              <p className="text-xs text-center text-muted-foreground">دمو: admin / admin123</p>
            </form>
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
              <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)}>
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="dashboard" className="gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              داشبورد
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 py-3">
              <Package className="h-4 w-4" />
              محصولات
            </TabsTrigger>
            <TabsTrigger value="production" className="gap-2 py-3">
              <Factory className="h-4 w-4" />
              تولید
            </TabsTrigger>
            <TabsTrigger value="costs" className="gap-2 py-3">
              <DollarSign className="h-4 w-4" />
              هزینه‌ها
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2 py-3">
              <ShoppingCart className="h-4 w-4" />
              فروشات
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2 py-3">
              <FileText className="h-4 w-4" />
              فاکتورها
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard products={products} productions={productions} sales={sales} costs={costs} />
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
              onAdd={handleAddCost}
              onDelete={handleDeleteCost}
            />
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4">
            <SalesManagement
              products={products}
              productions={productions}
              sales={sales}
              onAdd={handleAddSale}
              onDelete={handleDeleteSale}
            />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <InvoiceManagement
              products={products}
              productions={productions}
              invoices={invoices}
              sales={sales}
              onAdd={handleAddInvoice}
              onUpdate={handleUpdateInvoice}
              onDelete={handleDeleteInvoice}
              onAddSales={(newSales) => {
                // Add multiple sales at once
                newSales.forEach((saleData) => handleAddSale(saleData))
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}