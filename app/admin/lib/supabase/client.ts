// Supabase Client
// Client-side Supabase instance for browser usage

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase Client] Missing environment variables:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  })
  throw new Error(
    "Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file"
  )
}

console.log("[Supabase Client] Initializing Supabase client:", {
  url: supabaseUrl.substring(0, 30) + "...",
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey.length,
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using custom auth
  },
})

// Test connection on initialization
supabase
  .from("products")
  .select("count")
  .limit(1)
  .then(({ error }) => {
    if (error) {
      console.error("[Supabase Client] Connection test failed:", error)
    } else {
      console.log("[Supabase Client] Connection test successful")
    }
  })
  .catch((err) => {
    console.error("[Supabase Client] Connection test error:", err)
  })

