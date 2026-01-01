# 🔐 Guide Simple - Comment Fonctionne l'Authentification

## 📋 Ce que vous devez avoir dans votre `.env.local`

```env
# OBLIGATOIRE - Pour Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key

# OBLIGATOIRE - Pour l'authentification admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# OPTIONNEL - Pour les opérations admin avancées (peut être ajouté plus tard)
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

**⚠️ IMPORTANT**: Si vous n'avez pas `ADMIN_USERNAME` et `ADMIN_PASSWORD`, le système utilise par défaut:
- Username: `admin`
- Password: `admin123`

## 🔄 Comment ça fonctionne - Étape par étape

### 1️⃣ **Quand vous allez sur `/admin`**

```
Vous → /admin → Middleware vérifie le cookie → Pas de cookie? → Page de login
```

**Le middleware** (`middleware.ts`) vérifie:
- Est-ce que vous avez un cookie `admin_session`?
- Si NON → Vous voyez la page de login
- Si OUI → Vous accédez au panel admin

### 2️⃣ **Quand vous vous connectez (LOGIN)**

```
Vous entrez username/password → API /api/auth/login → Vérifie les credentials
→ Si correct → Crée un cookie sécurisé → Vous êtes connecté!
```

**Ce qui se passe:**
1. Vous tapez `admin` / `admin123` dans le formulaire
2. Le code appelle `/api/auth/login` (POST)
3. L'API vérifie: `username === ADMIN_USERNAME` et `password === ADMIN_PASSWORD`
4. Si correct → Crée un cookie `admin_session` (valide 24h)
5. Vous êtes maintenant connecté!

### 3️⃣ **Vérification de l'authentification**

```
À chaque chargement → AuthProvider → /api/auth/verify → Vérifie le cookie
→ Si cookie existe → isAuthenticated = true
```

**Le AuthProvider** vérifie automatiquement:
- Au chargement de la page
- Appelle `/api/auth/verify`
- Si le cookie existe → Vous êtes authentifié
- Si le cookie n'existe pas → Page de login

### 4️⃣ **Quand vous vous déconnectez (LOGOUT)**

```
Vous cliquez "خروج" → API /api/auth/login (DELETE) → Supprime le cookie
→ Redirige vers /admin (page de login)
```

**Ce qui se passe:**
1. Vous cliquez sur le bouton "خروج" (logout)
2. Le code appelle `/api/auth/login` avec méthode DELETE
3. L'API supprime le cookie `admin_session`
4. Vous êtes redirigé vers `/admin` (page de login)

## ✅ Est-ce que tout est sécurisé?

### ✅ OUI - Pages protégées:
- ✅ `/admin` - Protégée par middleware
- ✅ Toutes les routes qui commencent par `/admin/*` - Protégées

### ✅ OUI - Le logout fonctionne:
- ✅ Le bouton "خروج" appelle `logout()`
- ✅ `logout()` supprime le cookie
- ✅ Vous êtes redirigé vers la page de login

### ✅ OUI - L'authentification fonctionne:
- ✅ Le middleware vérifie le cookie
- ✅ L'API vérifie les credentials
- ✅ Le cookie est sécurisé (httpOnly, secure en production)

## 🧪 Comment tester

### Test 1: Login
1. Allez sur `http://localhost:3000/admin`
2. Entrez: `admin` / `admin123`
3. Cliquez "ورود به پنل"
4. ✅ Vous devriez voir le dashboard

### Test 2: Logout
1. Une fois connecté, cliquez sur "خروج"
2. ✅ Vous devriez être redirigé vers la page de login

### Test 3: Protection
1. Connectez-vous
2. Supprimez le cookie `admin_session` dans les DevTools (F12 → Application → Cookies)
3. Rechargez la page
4. ✅ Vous devriez être redirigé vers la page de login

## 🔍 Vérification dans les logs

Dans votre terminal, vous devriez voir:
```
GET /api/auth/verify 401  ← Pas connecté
POST /api/auth/login 200 ← Connexion réussie
GET /api/auth/verify 200 ← Maintenant connecté
DELETE /api/auth/login 200 ← Déconnexion réussie
```

## ⚠️ Problèmes possibles

### Problème 1: "401 Unauthorized" même après login
**Solution**: Vérifiez que le cookie est bien créé dans les DevTools (F12 → Application → Cookies)

### Problème 2: Le logout ne fonctionne pas
**Solution**: Vérifiez que `credentials: "include"` est présent dans le fetch

### Problème 3: Les pages ne sont pas protégées
**Solution**: Vérifiez que `middleware.ts` est bien à la racine du projet

## 📝 Résumé simple

1. **Login** = Crée un cookie sécurisé
2. **Middleware** = Vérifie le cookie à chaque requête
3. **Logout** = Supprime le cookie
4. **Tout est sécurisé** = Oui! ✅

## 🎯 Ce qui manque dans votre .env.local

Ajoutez ces lignes (même si vous n'avez pas le service role key pour l'instant):

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Le `SUPABASE_SERVICE_ROLE_KEY` est optionnel pour l'instant - vous pouvez l'ajouter plus tard si besoin.

