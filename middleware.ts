import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware pour protéger les routes /admin et /api/admin
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protéger toutes les routes /admin (sauf la page de login elle-même)
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const sessionToken = request.cookies.get("admin_session")?.value

    if (!sessionToken) {
      const loginUrl = new URL("/admin", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protéger toutes les routes API /api/admin (sauf /api/auth/*)
  if (pathname.startsWith("/api/admin")) {
    const sessionToken = request.cookies.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

