import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware pour protéger les routes /admin
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protéger toutes les routes /admin (sauf la page de login elle-même)
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    // Vérifier le cookie de session
    const sessionToken = request.cookies.get("admin_session")?.value

    if (!sessionToken) {
      // Rediriger vers la page de login si pas de session
      const loginUrl = new URL("/admin", request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Vérifier que le token est valide (optionnel: vérifier avec Supabase)
    // Pour l'instant, on vérifie juste l'existence du cookie
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

