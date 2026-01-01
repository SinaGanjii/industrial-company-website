// API Route for single Invoice operations - Secured with session verification

import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth/verify-session"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  status: z.enum(["draft", "approved", "paid"]).optional(), // Fixed: removed invalid statuses
  customerName: z.string().optional(),
  customerInfo: z.object({
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    taxId: z.string().nullable().optional(),
  }).optional(),
  subtotal: z.number().optional(),
  tax: z.number().nullable().optional(),
  total: z.number().optional(),
  date: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ باید YYYY/MM/DD باشد").optional(),
  dueDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ سررسید باید YYYY/MM/DD باشد").nullable().optional(),
  paidDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ پرداخت باید YYYY/MM/DD باشد").nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(z.any()).optional(),
})

// GET - Get invoice by ID
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
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single()

    if (invoiceError) {
      if (invoiceError.code === "PGRST116") {
        return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 })
      }
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      )
    }

    // Fetch items
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at", { ascending: true })

    return NextResponse.json(
      { data: { ...invoice, items: items || [] } },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API /admin/invoices/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH - Update invoice
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
    
    // Log the received data for debugging
    
    const validationResult = updateInvoiceSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error("[API /admin/invoices/[id]] Validation errors:", validationResult.error.errors)
      return NextResponse.json(
        { error: "Données invalides", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const updateData: any = {}
    
    if (validationResult.data.invoiceNumber !== undefined) updateData.invoice_number = validationResult.data.invoiceNumber
    if (validationResult.data.status !== undefined) updateData.status = validationResult.data.status
    if (validationResult.data.customerName !== undefined) updateData.customer_name = validationResult.data.customerName
    if (validationResult.data.customerInfo !== undefined) {
      updateData.customer_address = validationResult.data.customerInfo.address
      updateData.customer_phone = validationResult.data.customerInfo.phone
      updateData.customer_tax_id = validationResult.data.customerInfo.taxId
    }
    if (validationResult.data.subtotal !== undefined) updateData.subtotal = validationResult.data.subtotal
    if (validationResult.data.tax !== undefined) updateData.tax = validationResult.data.tax
    if (validationResult.data.total !== undefined) updateData.total = validationResult.data.total
    if (validationResult.data.date !== undefined) updateData.date = validationResult.data.date
    if (validationResult.data.dueDate !== undefined) updateData.due_date = validationResult.data.dueDate
    if (validationResult.data.paidDate !== undefined) updateData.paid_date = validationResult.data.paidDate
    if (validationResult.data.notes !== undefined) updateData.notes = validationResult.data.notes

    const { data, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[API /admin/invoices/[id]] Supabase update error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      )
    }

    // Update items if provided and valid
    if (validationResult.data.items !== undefined && Array.isArray(validationResult.data.items)) {
      // Delete existing items
      await supabase.from("invoice_items").delete().eq("invoice_id", id)
      
      // Create new items only if they have all required fields
      const validItems = validationResult.data.items.filter((item: any) => 
        item.productId && item.productName && item.unitPrice !== null && item.unitPrice !== undefined
      )
      
      if (validItems.length > 0) {
        const items = validItems.map((item: any) => ({
          invoice_id: id,
          product_id: item.productId,
          product_name: item.productName,
          dimensions: item.dimensions || "",
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
        }))

        const { error: itemsError } = await supabase.from("invoice_items").insert(items)
        
        if (itemsError) {
          console.error("[API /admin/invoices/[id]] Error updating items:", itemsError)
          return NextResponse.json(
            { error: "Erreur lors de la mise à jour des articles" },
            { status: 500 }
          )
        }
      }
    }

    // Fetch complete invoice with items
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at", { ascending: true })

    return NextResponse.json(
      { data: { ...data, items: items || [] } },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API /admin/invoices/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Delete invoice
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
    // Items will be cascade deleted
    const { error } = await supabase
      .from("invoices")
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
    console.error("[API /admin/invoices/[id]] Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

