// API Route for single Salary Payment operations - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateSalaryPaymentSchema = z.object({
  employeeId: z.string().uuid().optional(),
  employeeName: z.string().min(1).optional(),
  month: z.string().regex(/^\d{4}\/\d{2}$/).optional(),
  paymentDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/).optional(),
  dailySalary: z.number().min(0).optional(),
  amount: z.number().min(0).optional(),
  daysWorked: z.number().int().min(1).optional(),
  paymentMethod: z.enum(["cash", "transfer", "check"]).optional(),
  description: z.string().max(1000).nullable().optional(),
})

// GET - Get salary payment by ID
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
      .from("salary_payments")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Paiement non trouvé" }, { status: 404 })
      }
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/salary-payments/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - Update salary payment
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
    const validationResult = updateSalaryPaymentSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[API /admin/salary-payments/[id]] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const updateData: any = {}

    if (validationResult.data.employeeId !== undefined) updateData.employee_id = validationResult.data.employeeId
    if (validationResult.data.employeeName !== undefined) updateData.employee_name = validationResult.data.employeeName
    if (validationResult.data.month !== undefined) updateData.month = validationResult.data.month
    if (validationResult.data.paymentDate !== undefined) updateData.payment_date = validationResult.data.paymentDate
    if (validationResult.data.dailySalary !== undefined) updateData.daily_salary = Math.round(validationResult.data.dailySalary)
    if (validationResult.data.amount !== undefined) updateData.amount = Math.round(validationResult.data.amount)
    if (validationResult.data.daysWorked !== undefined) updateData.days_worked = validationResult.data.daysWorked
    if (validationResult.data.paymentMethod !== undefined) updateData.payment_method = validationResult.data.paymentMethod
    if (validationResult.data.description !== undefined) updateData.description = validationResult.data.description

    const { data, error } = await supabase
      .from("salary_payments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[API /admin/salary-payments/[id]] Supabase update error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/salary-payments/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete salary payment
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
    const { error } = await supabase
      .from("salary_payments")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/salary-payments/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

