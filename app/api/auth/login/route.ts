import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Schema de validation pour le login
const loginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
})

// Interface pour un utilisateur admin
interface AdminUser {
  username: string
  password: string
}

/**
 * Charger les utilisateurs admin depuis les variables d'environnement
 * Format: ADMIN_USERS=user1:pass1,user2:pass2
 */
function getAdminUsers(): AdminUser[] {
  const adminUsersEnv = process.env.ADMIN_USERS

  if (!adminUsersEnv) {
    throw new Error(
      "ADMIN_USERS n'est pas défini dans .env.local. " +
      "Format: ADMIN_USERS=username1:password1,username2:password2"
    )
  }

  // Parser: "user1:pass1,user2:pass2" → [{username: "user1", password: "pass1"}, ...]
  const users: AdminUser[] = []
  const userStrings = adminUsersEnv.split(",")

  for (const userString of userStrings) {
    const [username, password] = userString.trim().split(":")
    
    if (!username || !password) {
      throw new Error(
        `Format invalide dans ADMIN_USERS: "${userString}". ` +
        "Format attendu: username:password"
      )
    }

    users.push({ username: username.trim(), password: password.trim() })
  }

  if (users.length === 0) {
    throw new Error("Aucun utilisateur admin trouvé dans ADMIN_USERS")
  }

  return users
}

/**
 * Vérifier si les credentials sont valides
 */
function validateCredentials(username: string, password: string): boolean {
  try {
    const adminUsers = getAdminUsers()
    return adminUsers.some(
      (user) => user.username === username && user.password === password
    )
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API /auth/login] Error loading admin users:", error)
    }
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données d'entrée
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "داده‌های ورودی نامعتبر", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { username, password } = validationResult.data

    // Vérifier les credentials
    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      )
    }

    // Créer une session sécurisée
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Session de 24h

    // Stocker la session dans un cookie sécurisé
    const response = NextResponse.json(
      { success: true, message: "ورود موفقیت‌آمیز بود" },
      { status: 200 }
    )

    response.cookies.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Use default domain
    })

    return response
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API /auth/login] Error:", error)
    }
    return NextResponse.json(
      { error: "خطا در پردازش درخواست" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // Logout: Supprimer le cookie de session
  const response = NextResponse.json(
    { success: true, message: "خروج موفقیت‌آمیز بود" },
    { status: 200 }
  )

  response.cookies.delete("admin_session")

  return response
}
