// API Route for single Loan operations - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateLoanSchema = z.object({
  personId: z.string().uuid().optional(),
  personName: z.string().min(1).optional(),
  transactionType: z.enum(["lend", "borrow"]).optional(),
  amount: z.number().min(0).optional(),
  transactionDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/).optional(),
  description: z.string().max(1000).nullable().optional(),
})

// GET - Get loan by ID
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
      .from("loans")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("[API /admin/loans/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: "Prêt non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/loans/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - Update loan
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
    const validationResult = updateLoanSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[API /admin/loans/[id]] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const updateData: any = {}

    if (validationResult.data.personId !== undefined) updateData.person_id = validationResult.data.personId
    if (validationResult.data.personName !== undefined) updateData.person_name = validationResult.data.personName
    if (validationResult.data.transactionType !== undefined) {
      updateData.transaction_type = validationResult.data.transactionType
      // Recalculate amount if transaction type changes
      if (validationResult.data.amount !== undefined) {
        const amount = validationResult.data.transactionType === "lend" 
          ? Math.round(validationResult.data.amount)
          : -Math.round(validationResult.data.amount)
        updateData.amount = amount
      }
    } else if (validationResult.data.amount !== undefined) {
      // Get current transaction type to determine sign
      const { data: current } = await supabase
        .from("loans")
        .select("transaction_type")
        .eq("id", id)
        .single()
      
      const amount = current?.transaction_type === "lend"
        ? Math.round(validationResult.data.amount)
        : -Math.round(validationResult.data.amount)
      updateData.amount = amount
    }
    if (validationResult.data.transactionDate !== undefined) updateData.transaction_date = validationResult.data.transactionDate
    if (validationResult.data.description !== undefined) updateData.description = validationResult.data.description

    const { data, error } = await supabase
      .from("loans")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[API /admin/loans/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du prêt" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/loans/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete loan
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
    const { error } = await supabase.from("loans").delete().eq("id", id)

    if (error) {
      console.error("[API /admin/loans/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la suppression du prêt" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/loans/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

