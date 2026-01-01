// API Route for single Product operations - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  dimensions: z.string().optional(),
  material: z.string().nullable().optional(),
  unitPrice: z.number().positive().optional(),
})

// GET - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
      }
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/products/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = updateProductSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (validationResult.data.name !== undefined) updateData.name = validationResult.data.name
    if (validationResult.data.dimensions !== undefined) updateData.dimensions = validationResult.data.dimensions
    if (validationResult.data.material !== undefined) updateData.material = validationResult.data.material
    if (validationResult.data.unitPrice !== undefined) updateData.unit_price = validationResult.data.unitPrice

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/products/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/products/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

