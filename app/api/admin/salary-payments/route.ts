// API Route for Salary Payments - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const salaryPaymentSchema = z.object({
  employeeId: z.string().uuid("شناسه کارمند نامعتبر است"),
  employeeName: z.string().min(1, "نام کارمند الزامی است"),
  month: z.string().regex(/^\d{4}\/\d{2}$/, "فرمت ماه باید YYYY/MM باشد"),
  paymentDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ باید YYYY/MM/DD باشد"),
  dailySalary: z.number().min(0, "حقوق روزانه باید مثبت باشد"),
  amount: z.number().min(0, "مبلغ باید مثبت باشد"),
  daysWorked: z.number().int("تعداد روزها باید عدد صحیح باشد").min(1, "تعداد روزها باید حداقل 1 باشد"),
  paymentMethod: z.enum(["cash", "transfer", "check"], { errorMap: () => ({ message: "نوع پرداخت نامعتبر است" }) }),
  description: z.string().max(1000, "شرح نباید بیشتر از 1000 کاراکتر باشد").optional().nullable(),
})

// GET - Fetch all salary payments (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const month = searchParams.get("month")

    const supabase = createAdminSupabaseClient()
    let query = supabase.from("salary_payments").select("*")

    if (employeeId) {
      query = query.eq("employee_id", employeeId)
    }
    if (month) {
      query = query.eq("month", month)
    }

    query = query.order("payment_date", { ascending: false })
      .order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("[API /admin/salary-payments] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des paiements" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/salary-payments] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create a new salary payment
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = salaryPaymentSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[API /admin/salary-payments] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("salary_payments")
      .insert({
        employee_id: validationResult.data.employeeId,
        employee_name: validationResult.data.employeeName,
        month: validationResult.data.month,
        payment_date: validationResult.data.paymentDate,
        daily_salary: Math.round(validationResult.data.dailySalary),
        amount: Math.round(validationResult.data.amount),
        days_worked: validationResult.data.daysWorked,
        payment_method: validationResult.data.paymentMethod,
        description: validationResult.data.description || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[API /admin/salary-payments] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création du paiement" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API /admin/salary-payments] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

