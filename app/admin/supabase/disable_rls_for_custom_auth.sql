-- =====================================================
-- DÉSACTIVER RLS POUR AUTHENTIFICATION PERSONNALISÉE
-- Utilisez ce fichier si vous utilisez l'authentification par cookies
-- au lieu de Supabase Auth
-- =====================================================

-- Désactiver RLS sur toutes les tables
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE productions DISABLE ROW LEVEL SECURITY;
ALTER TABLE costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- NOTE
-- =====================================================
-- La sécurité est maintenant gérée par:
-- 1. Le middleware Next.js (vérifie le cookie)
-- 2. Les API routes (vérifient l'authentification)
-- 3. Le client Supabase côté serveur (utilise service role key)
--
-- C'est acceptable pour un système d'authentification personnalisé.
-- En production, considérez utiliser Supabase Auth pour une meilleure sécurité.

