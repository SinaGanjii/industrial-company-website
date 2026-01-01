// Supabase Data Hook
// React hook for managing admin data with Supabase

"use client"

import { useState, useEffect, useCallback } from "react"
import type { Product, Production, Cost, Sale, Invoice, Employee, SalaryPayment, Person, Loan } from "../types"
import {
  ProductsDB,
  ProductionsDB,
  CostsDB,
  SalesDB,
  InvoicesDB,
} from "../lib/db"
import { EmployeesDB } from "../lib/db/employees"
import { SalaryPaymentsDB } from "../lib/db/salary_payments"
import { PeopleDB } from "../lib/db/people"
import { LoansDB } from "../lib/db/loans"

export function useSupabaseData(isAuthenticated: boolean = false) {
  const [products, setProducts] = useState<Product[]>([])
  const [productions, setProductions] = useState<Production[]>([])
  const [costs, setCosts] = useState<Cost[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data
  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [productsData, productionsData, costsData, salesData, invoicesData, employeesData, salaryPaymentsData, peopleData, loansData] =
        await Promise.all([
          ProductsDB.getAll(),
          ProductionsDB.getAll(),
          CostsDB.getAll(),
          SalesDB.getAll(),
          InvoicesDB.getAll(),
          EmployeesDB.getAll(),
          SalaryPaymentsDB.getAll(),
          PeopleDB.getAll(),
          LoansDB.getAll(),
        ])

      setProducts(productsData)
      setProductions(productionsData)
      setCosts(costsData)
      setSales(salesData)
      setInvoices(invoicesData)
      setEmployees(employeesData)
      setSalaryPayments(salaryPaymentsData)
      setPeople(peopleData)
      setLoans(loansData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
      setError(errorMessage)
      // Only log errors in production for debugging
      if (process.env.NODE_ENV === "development") {
        console.error("[useSupabaseData] Error fetching data:", err)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Load data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAll()
    } else {
      // Clear data when not authenticated
      setProducts([])
      setProductions([])
      setCosts([])
      setSales([])
      setInvoices([])
      setEmployees([])
      setSalaryPayments([])
      setPeople([])
      setLoans([])
      setError(null)
      setLoading(false)
    }
  }, [isAuthenticated, fetchAll])

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

  // Employees operations
  const addEmployee = useCallback(
    async (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newEmployee = await EmployeesDB.create(employee)
        setEmployees((prev) => [newEmployee, ...prev])
        return newEmployee
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create employee"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const updateEmployee = useCallback(
    async (id: string, updates: Partial<Omit<Employee, "id" | "createdAt" | "updatedAt">>) => {
      try {
        const updatedEmployee = await EmployeesDB.update(id, updates)
        setEmployees((prev) => prev.map((e) => (e.id === id ? updatedEmployee : e)))
        return updatedEmployee
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update employee"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await EmployeesDB.delete(id)
      setEmployees((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete employee"
      setError(errorMessage)
      throw err
    }
  }, [])

  // Salary Payments operations
  const addSalaryPayment = useCallback(
    async (payment: Omit<SalaryPayment, "id" | "createdAt">) => {
      try {
        const newPayment = await SalaryPaymentsDB.create(payment)
        setSalaryPayments((prev) => [newPayment, ...prev])
        return newPayment
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create salary payment"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const updateSalaryPayment = useCallback(
    async (id: string, updates: Partial<Omit<SalaryPayment, "id" | "createdAt">>) => {
      try {
        const updatedPayment = await SalaryPaymentsDB.update(id, updates)
        setSalaryPayments((prev) => prev.map((p) => (p.id === id ? updatedPayment : p)))
        return updatedPayment
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update salary payment"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteSalaryPayment = useCallback(async (id: string) => {
    try {
      await SalaryPaymentsDB.delete(id)
      setSalaryPayments((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete salary payment"
      setError(errorMessage)
      throw err
    }
  }, [])

  // People operations
  const addPerson = useCallback(
    async (person: Omit<Person, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newPerson = await PeopleDB.create(person)
        setPeople((prev) => [newPerson, ...prev])
        return newPerson
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create person"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const updatePerson = useCallback(
    async (id: string, updates: Partial<Omit<Person, "id" | "createdAt" | "updatedAt">>) => {
      try {
        const updatedPerson = await PeopleDB.update(id, updates)
        setPeople((prev) => prev.map((p) => (p.id === id ? updatedPerson : p)))
        return updatedPerson
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update person"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deletePerson = useCallback(async (id: string) => {
    try {
      await PeopleDB.delete(id)
      setPeople((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete person"
      setError(errorMessage)
      throw err
    }
  }, [])

  // Loans operations
  const addLoan = useCallback(
    async (loan: Omit<Loan, "id" | "createdAt">) => {
      try {
        const newLoan = await LoansDB.create(loan)
        setLoans((prev) => [newLoan, ...prev])
        return newLoan
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create loan"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const updateLoan = useCallback(
    async (id: string, updates: Partial<Omit<Loan, "id" | "createdAt">>) => {
      try {
        const updatedLoan = await LoansDB.update(id, updates)
        setLoans((prev) => prev.map((l) => (l.id === id ? updatedLoan : l)))
        return updatedLoan
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update loan"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteLoan = useCallback(async (id: string) => {
    try {
      await LoansDB.delete(id)
      setLoans((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete loan"
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
    employees,
    salaryPayments,
    people,
    loans,
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
    // Employees
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setEmployees,
    // Salary Payments
    addSalaryPayment,
    updateSalaryPayment,
    deleteSalaryPayment,
    setSalaryPayments,
    // People
    addPerson,
    updatePerson,
    deletePerson,
    setPeople,
    // Loans
    addLoan,
    updateLoan,
    deleteLoan,
    setLoans,
  }
}

