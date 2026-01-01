// API Route for Employees - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const employeeSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(255, "نام نباید بیشتر از 255 کاراکتر باشد"),
  phone: z.string().max(50, "تلفن نباید بیشتر از 50 کاراکتر باشد").optional().nullable(),
  address: z.string().max(1000, "آدرس نباید بیشتر از 1000 کاراکتر باشد").optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000, "یادداشت نباید بیشتر از 1000 کاراکتر باشد").optional().nullable(),
})

// GET - Fetch all employees
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("[API /admin/employees] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des employés" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/employees] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create a new employee
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = employeeSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[API /admin/employees] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("employees")
      .insert({
        name: validationResult.data.name,
        phone: validationResult.data.phone || null,
        address: validationResult.data.address || null,
        is_active: validationResult.data.isActive !== undefined ? validationResult.data.isActive : true,
        notes: validationResult.data.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[API /admin/employees] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création de l'employé" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API /admin/employees] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

