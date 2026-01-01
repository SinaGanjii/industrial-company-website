// Environment Variables Validation
// Valide les variables d'environnement au démarrage

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ADMIN_USERS: process.env.ADMIN_USERS, // OBLIGATOIRE maintenant
} as const

const optionalEnvVars = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NODE_ENV: process.env.NODE_ENV || "development",
} as const

/**
 * Valider que toutes les variables d'environnement requises sont présentes
 */
export function validateEnv() {
  const missing: string[] = []

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      "Please check your .env.local file\n\n" +
      "Format pour ADMIN_USERS: ADMIN_USERS=username1:password1,username2:password2"
    )
  }

  // Valider le format de ADMIN_USERS
  if (requiredEnvVars.ADMIN_USERS) {
    const users = requiredEnvVars.ADMIN_USERS.split(",")
    for (const user of users) {
      const parts = user.trim().split(":")
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error(
          `Format invalide pour ADMIN_USERS: "${user}". ` +
          "Format attendu: username:password,username2:password2"
        )
      }
    }
  }

  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
  }
}

// Valider au chargement du module (côté serveur uniquement)
if (typeof window === "undefined") {
  try {
    validateEnv()
  } catch (error) {
    console.error("[lib/env] Environment validation failed:", error)
    // Ne pas bloquer en développement, mais afficher un avertissement
    if (process.env.NODE_ENV === "production") {
      console.error("[lib/env] ⚠️ PRODUCTION: Les variables d'environnement sont requises!")
    } else {
      console.warn("[lib/env] ⚠️ Variables d'environnement manquantes. Ajoutez-les dans .env.local")
    }
  }
}

export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
} as const
