// API Route for Loans - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const loanSchema = z.object({
  personId: z.string().uuid("شناسه شخص نامعتبر است"),
  personName: z.string().min(1, "نام شخص الزامی است"),
  transactionType: z.enum(["lend", "borrow"], { errorMap: () => ({ message: "نوع تراکنش نامعتبر است" }) }),
  amount: z.number().min(0, "مبلغ باید مثبت باشد"),
  transactionDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ باید YYYY/MM/DD باشد"),
  description: z.string().max(1000, "شرح نباید بیشتر از 1000 کاراکتر باشد").optional().nullable(),
})

// GET - Fetch all loans (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const personId = searchParams.get("personId")

    const supabase = createAdminSupabaseClient()
    let query = supabase.from("loans").select("*").order("transaction_date", { ascending: false })

    if (personId) {
      query = query.eq("person_id", personId)
    }

    const { data, error } = await query

    if (error) {
      console.error("[API /admin/loans] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des prêts" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/loans] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create a new loan transaction
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = loanSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[API /admin/loans] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Calculate amount: positive for lend, negative for borrow
    const amount = validationResult.data.transactionType === "lend" 
      ? Math.round(validationResult.data.amount)
      : -Math.round(validationResult.data.amount)

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("loans")
      .insert({
        person_id: validationResult.data.personId,
        person_name: validationResult.data.personName,
        transaction_type: validationResult.data.transactionType,
        amount: amount,
        transaction_date: validationResult.data.transactionDate,
        description: validationResult.data.description || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[API /admin/loans] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création du prêt" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API /admin/loans] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

