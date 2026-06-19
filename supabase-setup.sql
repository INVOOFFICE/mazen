-- ============================================================
-- Mazen Chef — Setup Supabase
-- Exécute ces commandes dans l'éditeur SQL de Supabase
-- (SQL Editor > New Query)
-- ============================================================

-- 1. Table menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  branch TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests TEXT NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Activer Row Level Security (optionnel mais recommandé)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 4. Politiques d'accès public (nécessaires pour le site)
--    Le menu doit être lisible par tout le monde (site public)
CREATE POLICY "Menu public read" ON menu_items
  FOR SELECT USING (true);

--    Les réservations doivent pouvoir être insérées par le public
CREATE POLICY "Reservations public insert" ON reservations
  FOR INSERT WITH CHECK (true);

--    Les admins peuvent tout faire (via auth)
CREATE POLICY "Admin full access menu" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access reservations" ON reservations
  FOR ALL USING (auth.role() = 'authenticated');
