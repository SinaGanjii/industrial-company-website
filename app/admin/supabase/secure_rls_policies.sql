-- =====================================================
-- SECURE RLS POLICIES
-- Politiques RLS sécurisées pour l'admin panel
-- =====================================================

-- Supprimer les anciennes politiques permissives
DROP POLICY IF EXISTS "Enable all operations for products" ON products;
DROP POLICY IF EXISTS "Enable all operations for productions" ON productions;
DROP POLICY IF EXISTS "Enable all operations for costs" ON costs;
DROP POLICY IF EXISTS "Enable all operations for sales" ON sales;
DROP POLICY IF EXISTS "Enable all operations for invoices" ON invoices;
DROP POLICY IF EXISTS "Enable all operations for invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON productions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON costs;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON sales;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON invoice_items;

-- =====================================================
-- NOUVELLES POLITIQUES SÉCURISÉES
-- =====================================================

-- Products: Seuls les utilisateurs authentifiés peuvent lire/écrire
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Productions: Seuls les utilisateurs authentifiés peuvent lire/écrire
CREATE POLICY "Authenticated users can manage productions" ON productions
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Costs: Seuls les utilisateurs authentifiés peuvent lire/écrire
CREATE POLICY "Authenticated users can manage costs" ON costs
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Sales: Seuls les utilisateurs authentifiés peuvent lire/écrire
CREATE POLICY "Authenticated users can manage sales" ON sales
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Invoices: Seuls les utilisateurs authentifiés peuvent lire/écrire
CREATE POLICY "Authenticated users can manage invoices" ON invoices
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Invoice Items: Seuls les utilisateurs authentifiés peuvent lire/écrire
CREATE POLICY "Authenticated users can manage invoice_items" ON invoice_items
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- NOTE IMPORTANTE
-- =====================================================
-- ⚠️ ATTENTION: Ces politiques RLS nécessitent que les utilisateurs soient authentifiés
-- via Supabase Auth (auth.role() = 'authenticated').
--
-- Comme ce projet utilise un système d'authentification personnalisé (cookies),
-- ces politiques RLS ne fonctionneront PAS directement.
--
-- OPTIONS:
--
-- Option 1: Désactiver RLS temporairement (pour développement)
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- (Faites ça pour toutes les tables)
--
-- Option 2: Utiliser le Service Role Key (recommandé pour production)
-- Utilisez SUPABASE_SERVICE_ROLE_KEY dans lib/supabase/server.ts
-- pour bypasser RLS depuis le serveur
--
-- Option 3: Créer une table admin_users et vérifier dans le middleware
-- Plus complexe mais plus sécurisé
--
-- Pour l'instant, si vous avez des erreurs RLS, utilisez Option 1 en développement.

