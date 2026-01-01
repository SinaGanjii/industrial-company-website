// API Route for Products - Secured with session verification
// All operations use SERVICE_ROLE_KEY server-side

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { productSchema } from "@/app/admin/lib/validations"

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    // Verify session
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API /admin/products] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des produits" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/products] Error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = productSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: validationResult.data.name,
        dimensions: validationResult.data.dimensions,
        material: validationResult.data.material || null,
        unit_price: validationResult.data.unitPrice,
      })
      .select()
      .single()

    if (error) {
      console.error("[API /admin/products] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création du produit" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API /admin/products] Error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

