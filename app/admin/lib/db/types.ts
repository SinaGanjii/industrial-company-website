// Database Types
// Type definitions for Supabase database tables

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          dimensions: string
          material: string | null
          unit_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          dimensions: string
          material?: string | null
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          dimensions?: string
          material?: string | null
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      productions: {
        Row: {
          id: string
          product_id: string
          product_name: string
          quantity: number
          date: string
          shift: "صبح" | "عصر" | "شب"
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          product_name: string
          quantity: number
          date: string
          shift: "صبح" | "عصر" | "شب"
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          date?: string
          shift?: "صبح" | "عصر" | "شب"
          created_at?: string
        }
      }
      costs: {
        Row: {
          id: string
          type: "electricity" | "water" | "gas" | "salary" | "other"
          type_label: string
          amount: number
          period_type: "daily" | "monthly" | "yearly"
          period_value: string
          description: string
          date: string | null // Legacy field, kept for backward compatibility
          product_id: string | null // Legacy field, deprecated
          production_date: string | null // Legacy field, deprecated
          created_at: string
        }
        Insert: {
          id?: string
          type: "electricity" | "water" | "gas" | "salary" | "other"
          type_label: string
          amount: number
          period_type: "daily" | "monthly" | "yearly"
          period_value: string
          description: string
          date?: string | null // Legacy field
          product_id?: string | null // Legacy field
          production_date?: string | null // Legacy field
          created_at?: string
        }
        Update: {
          id?: string
          type?: "electricity" | "water" | "gas" | "salary" | "other"
          type_label?: string
          amount?: number
          period_type?: "daily" | "monthly" | "yearly"
          period_value?: string
          description?: string
          date?: string | null
          product_id?: string | null
          production_date?: string | null
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          invoice_id: string | null
          customer_name: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          customer_name: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string | null
          customer_name?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          date?: string
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          status: "draft" | "approved" | "paid"
          customer_name: string
          customer_address: string | null
          customer_phone: string | null
          customer_tax_id: string | null
          subtotal: number
          tax: number | null
          total: number
          date: string
          due_date: string | null
          paid_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          status?: "draft" | "approved" | "paid"
          customer_name: string
          customer_address?: string | null
          customer_phone?: string | null
          customer_tax_id?: string | null
          subtotal: number
          tax?: number | null
          total: number
          date: string
          due_date?: string | null
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          status?: "draft" | "approved" | "paid"
          customer_name?: string
          customer_address?: string | null
          customer_phone?: string | null
          customer_tax_id?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          date?: string
          due_date?: string | null
          paid_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string
          product_name: string
          dimensions: string
          quantity: number
          unit_price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id: string
          product_name: string
          dimensions: string
          quantity: number
          unit_price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string
          product_name?: string
          dimensions?: string
          quantity?: number
          unit_price?: number
          total?: number
          created_at?: string
        }
      }
    }
  }
}

