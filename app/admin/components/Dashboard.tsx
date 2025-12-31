"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Factory, TrendingUp, TrendingDown, Package, DollarSign, Zap, Droplets, Flame, Users, Wallet } from "lucide-react"
import type { Product, Production, Sale, Cost } from "../types"
import { StockService } from "../services/StockService"
import { getTodayPersianDate, formatPersianNumber } from "../utils"

interface DashboardProps {
  products: Product[]
  productions: Production[]
  sales: Sale[]
  costs: Cost[]
}

export function Dashboard({ products, productions, sales, costs }: DashboardProps) {
  const today = getTodayPersianDate()
  
  // Today's data
  const todayProductions = productions.filter((p) => p.date === today)
  const todaySales = sales.filter((s) => s.date === today)
  const todayCosts = costs.filter((c) => c.date === today)
  
  // Calculate today's metrics
  const todayProductionQty = todayProductions.reduce((sum, p) => sum + p.quantity, 0)
  const todaySalesAmount = todaySales.reduce((sum, s) => sum + s.totalPrice, 0)
  const todaySalesQty = todaySales.reduce((sum, s) => sum + s.quantity, 0)
  const todayExpenses = todayCosts.reduce((sum, c) => sum + c.amount, 0)
  const todayProfit = todaySalesAmount - todayExpenses
  
  // Calculate stocks
  const stocks = StockService.calculateAllStocks(products, productions, sales)
  const totalStock = stocks.reduce((sum, s) => sum + s.remainingStock, 0)
  
  // Cost breakdown
  const electricityCost = todayCosts.filter((c) => c.type === "electricity").reduce((sum, c) => sum + c.amount, 0)
  const waterCost = todayCosts.filter((c) => c.type === "water").reduce((sum, c) => sum + c.amount, 0)
  const gasCost = todayCosts.filter((c) => c.type === "gas").reduce((sum, c) => sum + c.amount, 0)
  const salaryCost = todayCosts.filter((c) => c.type === "salary").reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Production */}
        <Card className="border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Factory className="h-5 w-5 text-accent" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {formatPersianNumber(todayProductionQty)}
            </div>
            <div className="text-xs text-muted-foreground">تولید امروز (عدد)</div>
          </CardContent>
        </Card>

        {/* Today's Sales */}
        <Card className="border-green-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatPersianNumber(todaySalesAmount)}
            </div>
            <div className="text-xs text-muted-foreground">فروش امروز (تومان)</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatPersianNumber(todaySalesQty)} عدد فروخته شده
            </div>
          </CardContent>
        </Card>

        {/* Today's Expenses */}
        <Card className="border-red-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatPersianNumber(todayExpenses)}
            </div>
            <div className="text-xs text-muted-foreground">هزینه امروز (تومان)</div>
          </CardContent>
        </Card>

        {/* Today's Profit */}
        <Card className="border-blue-600/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <TrendingUp className={`h-4 w-4 ${todayProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
            </div>
            <div className={`text-2xl font-bold mb-1 ${todayProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatPersianNumber(todayProfit)}
            </div>
            <div className="text-xs text-muted-foreground">سود امروز (تومان)</div>
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
      {todayExpenses > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">تفکیک هزینه‌های امروز</h3>
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
    </div>
  )
}

