// Utility function to verify admin session
// Used by API routes to check authentication

import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

/**
 * Verify if the request has a valid admin session
 * @param request - NextRequest object (optional, if not provided, uses cookies() directly)
 * @returns true if session exists, false otherwise
 */
export async function verifyAdminSession(request?: NextRequest): Promise<boolean> {
  try {
    let sessionToken: string | undefined

    if (request) {
      // From middleware or API route with NextRequest
      sessionToken = request.cookies.get("admin_session")?.value
    } else {
      // From server component or API route without NextRequest
      const cookieStore = cookies()
      sessionToken = cookieStore.get("admin_session")?.value
    }

    // For now, we just check if the cookie exists
    // In production, you could verify the token against a database or JWT
    return !!sessionToken
  } catch (error) {
    console.error("[verifyAdminSession] Error:", error)
    return false
  }
}

