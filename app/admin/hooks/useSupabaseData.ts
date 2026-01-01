// Supabase Data Hook
// React hook for managing admin data with Supabase

"use client"

import { useState, useEffect, useCallback } from "react"
import type { Product, Production, Cost, Sale, Invoice } from "../types"
import {
  ProductsDB,
  ProductionsDB,
  CostsDB,
  SalesDB,
  InvoicesDB,
} from "../lib/db"

export function useSupabaseData() {
  const [products, setProducts] = useState<Product[]>([])
  const [productions, setProductions] = useState<Production[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data
  const fetchAll = useCallback(async () => {
    try {
      console.log("[useSupabaseData] Starting to fetch all data...")
      setLoading(true)
      setError(null)

      const [productsData, productionsData, costsData, salesData, invoicesData] =
        await Promise.all([
          ProductsDB.getAll(),
          ProductionsDB.getAll(),
          CostsDB.getAll(),
          SalesDB.getAll(),
          InvoicesDB.getAll(),
        ])

      console.log("[useSupabaseData] Data fetched successfully:", {
        products: productsData.length,
        productions: productionsData.length,
        costs: costsData.length,
        sales: salesData.length,
        invoices: invoicesData.length,
      })

      setProducts(productsData)
      setProductions(productionsData)
      setCosts(costsData)
      setSales(salesData)
      setInvoices(invoicesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
      setError(errorMessage)
      console.error("[useSupabaseData] Error fetching data:", {
        error: err,
        errorMessage,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
      })
    } finally {
      setLoading(false)
      console.log("[useSupabaseData] Fetch completed, loading set to false")
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Products operations
  const addProduct = useCallback(
    async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newProduct = await ProductsDB.create(product)
        setProducts((prev) => [newProduct, ...prev])
        return newProduct
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create product"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>) => {
      try {
        const updatedProduct = await ProductsDB.update(id, updates)
        setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)))
        return updatedProduct
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update product"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await ProductsDB.delete(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product"
      setError(errorMessage)
      throw err
    }
  }, [])

  // Productions operations
  const addProduction = useCallback(
    async (production: Omit<Production, "id" | "createdAt">) => {
      try {
        const newProduction = await ProductionsDB.create(production)
        setProductions((prev) => [newProduction, ...prev])
        return newProduction
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create production"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteProduction = useCallback(async (id: string) => {
    try {
      await ProductionsDB.delete(id)
      setProductions((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete production"
      setError(errorMessage)
      throw err
    }
  }, [])

  // Costs operations
  const addCost = useCallback(async (cost: Omit<Cost, "id" | "createdAt">) => {
    try {
      const newCost = await CostsDB.create(cost)
      setCosts((prev) => [newCost, ...prev])
      return newCost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create cost"
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteCost = useCallback(async (id: string) => {
    try {
      await CostsDB.delete(id)
      setCosts((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete cost"
      setError(errorMessage)
      throw err
    }
  }, [])

  // Sales operations (only from invoices - no direct sales)
  const addSales = useCallback(async (sales: Array<Omit<Sale, "id" | "createdAt">>) => {
    try {
      // Ensure all sales have invoiceId
      const validSales = sales.map(sale => {
        if (!sale.invoiceId) {
          throw new Error("All sales must be linked to an invoice")
        }
        return sale
      })
      
      const newSales = await SalesDB.createMany(validSales)
      setSales((prev) => [...newSales, ...prev])
      return newSales
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create sales"
      setError(errorMessage)
      throw err
    }
  }, [])

  // Invoices operations
  const addInvoice = useCallback(async (invoice: Invoice) => {
    try {
      const newInvoice = await InvoicesDB.create(invoice, invoice.items)
      setInvoices((prev) => [newInvoice, ...prev])
      return newInvoice
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create invoice"
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateInvoice = useCallback(
    async (id: string, updates: Partial<Invoice>) => {
      try {
        const invoice = invoices.find((inv) => inv.id === id)
        if (!invoice) throw new Error("Invoice not found")

        // Preserve items from original invoice if not provided in updates
        const itemsToUpdate = updates.items !== undefined ? updates.items : invoice.items
        
        const updatedInvoice = await InvoicesDB.update(id, updates, itemsToUpdate)
        setInvoices((prev) => prev.map((inv) => (inv.id === id ? updatedInvoice : inv)))
        return updatedInvoice
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update invoice"
        setError(errorMessage)
        throw err
      }
    },
    [invoices]
  )

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      await InvoicesDB.delete(id)
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete invoice"
      setError(errorMessage)
      throw err
    }
  }, [])

  return {
    // Data
    products,
    productions,
    costs,
    sales,
    invoices,
    // Loading state
    loading,
    error,
    // Operations
    fetchAll,
    // Products
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts,
    // Productions
    addProduction,
    deleteProduction,
    setProductions,
    // Costs
    addCost,
    deleteCost,
    setCosts,
    // Sales
    addSales,
    setSales,
    // Invoices
    addInvoice,
    updateInvoice,
    deleteInvoice,
    setInvoices,
  }
}

