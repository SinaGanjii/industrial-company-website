// API Route for Invoices - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { invoiceSchema } from "@/app/admin/lib/validations"

// GET - Fetch all invoices
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (invoicesError) {
      console.error("[API /admin/invoices] Supabase error:", invoicesError)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des factures" },
        { status: 500 }
      )
    }

    // Fetch items for each invoice
    const invoicesWithItems = []
    for (const invoice of invoices || []) {
      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id)
        .order("created_at", { ascending: true })

      if (itemsError) {
        console.error("[API /admin/invoices] Error fetching items:", itemsError)
      }

      invoicesWithItems.push({
        ...invoice,
        items: items || [],
      })
    }

    return NextResponse.json({ data: invoicesWithItems }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/invoices] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create a new invoice with items
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    
    // Log the received data for debugging
    
    const validationResult = invoiceSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error("[API /admin/invoices] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    
    // Create invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: validationResult.data.invoiceNumber,
        status: validationResult.data.status,
        customer_name: validationResult.data.customerName,
        customer_address: validationResult.data.customerInfo?.address || null,
        customer_phone: validationResult.data.customerInfo?.phone || null,
        customer_tax_id: validationResult.data.customerInfo?.taxId || null,
        subtotal: validationResult.data.subtotal,
        discount: validationResult.data.discount || null,
        tax: validationResult.data.tax || null,
        total: validationResult.data.total,
        date: validationResult.data.date,
        due_date: validationResult.data.dueDate || null,
        paid_date: validationResult.data.paidDate || null,
        notes: validationResult.data.notes || null,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error("[API /admin/invoices] Supabase error:", invoiceError)
      return NextResponse.json(
        { error: "Erreur lors de la création de la facture" },
        { status: 500 }
      )
    }

    // Create invoice items if provided
    if (validationResult.data.items && validationResult.data.items.length > 0) {
      const items = validationResult.data.items.map((item: any) => ({
        invoice_id: invoiceData.id,
        product_id: item.productId,
        product_name: item.productName,
        dimensions: item.dimensions,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
      }))

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items)

      if (itemsError) {
        console.error("[API /admin/invoices] Error creating items:", itemsError)
        // Rollback invoice creation
        await supabase.from("invoices").delete().eq("id", invoiceData.id)
        return NextResponse.json(
          { error: "Erreur lors de la création des articles" },
          { status: 500 }
        )
      }
    }

    // Fetch complete invoice with items
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceData.id)
      .order("created_at", { ascending: true })

    return NextResponse.json(
      { data: { ...invoiceData, items: items || [] } },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API /admin/invoices] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

