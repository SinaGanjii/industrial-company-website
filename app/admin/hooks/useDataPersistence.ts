// Data Persistence Hook
// Manages localStorage for all admin data

import { useState, useEffect } from "react"
import type { Product, Production, Cost, Sale, Invoice } from "../types"

const STORAGE_KEYS = {
  products: "admin_products",
  productions: "admin_productions",
  costs: "admin_costs",
  sales: "admin_sales",
  invoices: "admin_invoices",
} as const

export function useDataPersistence() {
  const [products, setProducts] = useState<Product[]>([])
  const [productions, setProductions] = useState<Production[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedProducts = localStorage.getItem(STORAGE_KEYS.products)
        const savedProductions = localStorage.getItem(STORAGE_KEYS.productions)
        const savedCosts = localStorage.getItem(STORAGE_KEYS.costs)
        const savedSales = localStorage.getItem(STORAGE_KEYS.sales)
        const savedInvoices = localStorage.getItem(STORAGE_KEYS.invoices)

        if (savedProducts) setProducts(JSON.parse(savedProducts))
        if (savedProductions) setProductions(JSON.parse(savedProductions))
        if (savedCosts) setCosts(JSON.parse(savedCosts))
        if (savedSales) setSales(JSON.parse(savedSales))
        if (savedInvoices) setInvoices(JSON.parse(savedInvoices))
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
      }
    }

    loadData()
  }, [])

  // Save products to localStorage
  useEffect(() => {
    if (products.length > 0 || localStorage.getItem(STORAGE_KEYS.products)) {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products))
    }
  }, [products])

  // Save productions to localStorage
  useEffect(() => {
    if (productions.length > 0 || localStorage.getItem(STORAGE_KEYS.productions)) {
      localStorage.setItem(STORAGE_KEYS.productions, JSON.stringify(productions))
    }
  }, [productions])

  // Save costs to localStorage
  useEffect(() => {
    if (costs.length > 0 || localStorage.getItem(STORAGE_KEYS.costs)) {
      localStorage.setItem(STORAGE_KEYS.costs, JSON.stringify(costs))
    }
  }, [costs])

  // Save sales to localStorage
  useEffect(() => {
    if (sales.length > 0 || localStorage.getItem(STORAGE_KEYS.sales)) {
      localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales))
    }
  }, [sales])

  // Save invoices to localStorage
  useEffect(() => {
    if (invoices.length > 0 || localStorage.getItem(STORAGE_KEYS.invoices)) {
      localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices))
    }
  }, [invoices])

  // Export all data
  const exportAllData = () => {
    return {
      products,
      productions,
      costs,
      sales,
      invoices,
      exportedAt: new Date().toISOString(),
    }
  }

  // Import all data
  const importAllData = (data: {
    products?: Product[]
    productions?: Production[]
    costs?: Cost[]
    sales?: Sale[]
    invoices?: Invoice[]
  }) => {
    if (data.products) setProducts(data.products)
    if (data.productions) setProductions(data.productions)
    if (data.costs) setCosts(data.costs)
    if (data.sales) setSales(data.sales)
    if (data.invoices) setInvoices(data.invoices)
  }

  // Clear all data
  const clearAllData = () => {
    setProducts([])
    setProductions([])
    setCosts([])
    setSales([])
    setInvoices([])
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  return {
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
    exportAllData,
    importAllData,
    clearAllData,
  }
}

