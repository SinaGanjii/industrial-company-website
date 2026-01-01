// API Route for single Person operations - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const updatePersonSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

// GET - Get person by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("[API /admin/people/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: "Personne non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/people/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - Update person
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validationResult = updatePersonSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[API /admin/people/[id]] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const updateData: any = {}

    if (validationResult.data.name !== undefined) updateData.name = validationResult.data.name
    if (validationResult.data.phone !== undefined) updateData.phone = validationResult.data.phone
    if (validationResult.data.address !== undefined) updateData.address = validationResult.data.address
    if (validationResult.data.isActive !== undefined) updateData.is_active = validationResult.data.isActive
    if (validationResult.data.notes !== undefined) updateData.notes = validationResult.data.notes

    const { data, error } = await supabase
      .from("people")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[API /admin/people/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la personne" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/people/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete person
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminSupabaseClient()
    const { error } = await supabase.from("people").delete().eq("id", id)

    if (error) {
      console.error("[API /admin/people/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la suppression de la personne" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/people/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

