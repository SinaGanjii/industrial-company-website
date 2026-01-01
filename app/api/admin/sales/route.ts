// API Route for Sales - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { saleSchema } from "@/app/admin/lib/validations"

// GET - Fetch all sales
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API /admin/sales] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des ventes" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/sales] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create a new sale or multiple sales
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    
    // Log the received data for debugging
    
    // Check if it's a single sale or array
    const isArray = Array.isArray(body)
    const salesArray = isArray ? body : [body]
    
    // Validate all sales
    const validationResults = salesArray.map(sale => saleSchema.safeParse(sale))
    const invalidIndex = validationResults.findIndex(result => !result.success)
    
    if (invalidIndex !== -1) {
      console.error("[API /admin/sales] Validation errors:", validationResults[invalidIndex].error?.errors)
      return NextResponse.json(
        { 
          error: "Données invalides", 
          details: validationResults[invalidIndex].error?.errors 
        },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const dbSales = salesArray.map(sale => ({
      invoice_id: sale.invoiceId, // Now required
      customer_name: sale.customerName,
      product_id: sale.productId,
      product_name: sale.productName,
      quantity: sale.quantity,
      unit_price: sale.unitPrice,
      total_price: sale.totalPrice,
      date: sale.date,
    }))

    const { data, error } = await supabase
      .from("sales")
      .insert(dbSales)
      .select()

    if (error) {
      console.error("[API /admin/sales] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création de la vente" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: isArray ? data : data[0] }, { status: 201 })
  } catch (error) {
    console.error("[API /admin/sales] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

