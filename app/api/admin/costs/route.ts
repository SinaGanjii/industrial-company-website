// API Route for Costs - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

// GET - Fetch all costs
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from("costs")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API /admin/costs] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des coûts" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API /admin/costs] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Create a new cost
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    
    // Create a more flexible schema that matches what the client sends
    const flexibleCostSchema = z.object({
      type: z.enum(["electricity", "water", "gas", "salary", "other"]),
      typeLabel: z.string().optional(),
      amount: z.number().min(0),
      periodType: z.enum(["daily", "monthly", "yearly"]),
      periodValue: z.string().min(1),
      description: z.string().optional().nullable(),
      date: z.string().optional(),
      productId: z.union([z.string().uuid(), z.string().length(0), z.null(), z.undefined()]).optional().nullable(),
      productionDate: z.union([z.string(), z.null(), z.undefined()]).optional().nullable(),
    })
    
    const validationResult = flexibleCostSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error("[API /admin/costs] Validation error:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Map type to typeLabel if not provided
    const typeLabelMap: Record<string, string> = {
      electricity: "برق",
      water: "آب",
      gas: "گاز",
      salary: "حقوق",
      other: "سایر",
    }
    
    const typeLabel = validationResult.data.typeLabel || typeLabelMap[validationResult.data.type] || validationResult.data.type

    const supabase = createAdminSupabaseClient()
    
    // Clean up optional fields
    const productId = validationResult.data.productId && validationResult.data.productId.length > 0 
      ? validationResult.data.productId 
      : null
    const productionDate = validationResult.data.productionDate && validationResult.data.productionDate.length > 0
      ? validationResult.data.productionDate
      : null
    
    const { data, error } = await supabase
      .from("costs")
      .insert({
        type: validationResult.data.type,
        type_label: typeLabel,
        amount: validationResult.data.amount,
        date: validationResult.data.date || validationResult.data.periodValue,
        description: validationResult.data.description || null,
        product_id: productId,
        production_date: productionDate,
        period_type: validationResult.data.periodType,
        period_value: validationResult.data.periodValue,
      })
      .select()
      .single()

    if (error) {
      console.error("[API /admin/costs] Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la création du coût" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API /admin/costs] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

