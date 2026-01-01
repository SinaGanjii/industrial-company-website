// API Route for Productions - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { productionSchema } from "@/app/admin/lib/validations"

// GET - Fetch all productions
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("productions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API /admin/productions] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des productions" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/productions] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create a new production
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = productionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("productions")
      .insert({
        product_id: validationResult.data.productId,
        quantity: validationResult.data.quantity,
        date: validationResult.data.date,
      })
      .select()
      .single()

    if (error) {
      console.error("[API /admin/productions] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création de la production" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API /admin/productions] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

