// API Route for single Cost operations - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"

// GET - Get cost by ID
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
      .from("costs")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Coût non trouvé" }, { status: 404 })
      }
      if (process.env.NODE_ENV === "development") {
        console.error("[API /admin/costs/[id]] Supabase error:", error)
      }
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API /admin/costs/[id]] Error:", error)
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete cost
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
    
    // First check if the cost exists
    const { data: existingCost, error: checkError } = await supabase
      .from("costs")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return NextResponse.json({ error: "Coût non trouvé" }, { status: 404 })
      }
      if (process.env.NODE_ENV === "development") {
        console.error("[API /admin/costs/[id]] Error checking cost:", checkError)
      }
      return NextResponse.json(
        { error: "Erreur lors de la vérification" },
        { status: 500 }
      )
    }

    // Delete the cost
    const { error, data } = await supabase
      .from("costs")
      .delete()
      .eq("id", id)
      .select()

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[API /admin/costs/[id]] Supabase delete error:", error)
      }
      return NextResponse.json(
        { error: "Erreur lors de la suppression", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API /admin/costs/[id]] Error:", error)
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

