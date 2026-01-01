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
          type: "electricity" | "water" | "gas" | "salary" | "rent" | "other"
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
          type: "electricity" | "water" | "gas" | "salary" | "rent" | "other"
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
          type?: "electricity" | "water" | "gas" | "salary" | "rent" | "other"
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
          discount: number | null
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
          discount?: number | null
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
          discount?: number | null
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
    employees: {
      Row: {
        id: string
        name: string
        phone: string | null
        address: string | null
        is_active: boolean
        notes: string | null
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        name: string
        phone?: string | null
        address?: string | null
        is_active?: boolean
        notes?: string | null
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        name?: string
        phone?: string | null
        address?: string | null
        is_active?: boolean
        notes?: string | null
        created_at?: string
        updated_at?: string
      }
    }
    salary_payments: {
      Row: {
        id: string
        employee_id: string
        employee_name: string
        month: string
        payment_date: string
        daily_salary: number
        amount: number
        days_worked: number
        payment_method: "cash" | "transfer" | "check"
        description: string | null
        created_at: string
      }
      Insert: {
        id?: string
        employee_id: string
        employee_name: string
        month: string
        payment_date: string
        daily_salary: number
        amount: number
        days_worked: number
        payment_method: "cash" | "transfer" | "check"
        description?: string | null
        created_at?: string
      }
      Update: {
        id?: string
        employee_id?: string
        employee_name?: string
        month?: string
        payment_date?: string
        daily_salary?: number
        amount?: number
        days_worked?: number
        payment_method?: "cash" | "transfer" | "check"
        description?: string | null
        created_at?: string
      }
    }
    people: {
      Row: {
        id: string
        name: string
        phone: string | null
        address: string | null
        notes: string | null
        is_active: boolean
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        name: string
        phone?: string | null
        address?: string | null
        notes?: string | null
        is_active?: boolean
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        name?: string
        phone?: string | null
        address?: string | null
        notes?: string | null
        is_active?: boolean
        created_at?: string
        updated_at?: string
      }
    }
    loans: {
      Row: {
        id: string
        person_id: string
        person_name: string
        transaction_type: "lend" | "borrow"
        amount: number
        transaction_date: string
        description: string | null
        created_at: string
      }
      Insert: {
        id?: string
        person_id: string
        person_name: string
        transaction_type: "lend" | "borrow"
        amount: number
        transaction_date: string
        description?: string | null
        created_at?: string
      }
      Update: {
        id?: string
        person_id?: string
        person_name?: string
        transaction_type?: "lend" | "borrow"
        amount?: number
        transaction_date?: string
        description?: string | null
        created_at?: string
      }
    }
  }
}

