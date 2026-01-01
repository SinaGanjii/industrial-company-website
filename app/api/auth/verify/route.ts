import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("admin_session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // TODO: Vérifier le token avec Supabase ou une base de données
    // Pour l'instant, on vérifie juste l'existence du cookie

    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    )
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API /auth/verify] Error:", error)
    }
    return NextResponse.json(
      { authenticated: false, error: "خطا در بررسی احراز هویت" },
      { status: 500 }
    )
  }
}

