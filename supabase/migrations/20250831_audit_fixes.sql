-- =============================================
-- AUDIT FIX MIGRATION — 2025-08-31
-- STATUS: ALREADY APPLIED via Supabase Management API
-- =============================================

-- =============================================
-- 1. CREATE MISSING TABLES
-- =============================================

-- Newsletter subscribers (used by /api/newsletter)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career applications (used by /api/careers)
CREATE TABLE IF NOT EXISTS career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  portfolio TEXT DEFAULT '',
  position TEXT NOT NULL,
  introduction TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'rejected', 'hired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_career_applications_created ON career_applications(created_at DESC);

-- =============================================
-- 2. ENABLE RLS ON NEW TABLES
-- =============================================
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. RLS POLICIES FOR NEW TABLES
-- =============================================

-- Newsletter: anyone can insert (public subscription form)
CREATE POLICY "Anon insert newsletter" ON newsletter_subscribers
  FOR INSERT TO anon WITH CHECK (true);

-- Newsletter: admins can read/delete
CREATE POLICY "Admin read newsletter" ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete newsletter" ON newsletter_subscribers
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Careers: anyone can insert (public application form)
CREATE POLICY "Anon insert careers" ON career_applications
  FOR INSERT TO anon WITH CHECK (true);

-- Careers: admins can read/update/delete
CREATE POLICY "Admin read careers" ON career_applications
  FOR SELECT TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update careers" ON career_applications
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete careers" ON career_applications
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================
-- 4. FIX EXISTING RLS WRITE POLICIES
--    Replace permissive "TO authenticated WITH CHECK (true)"
--    with admin-role-only restrictions
-- =============================================

-- Drop old permissive write policies
DROP POLICY IF EXISTS "Auth insert services" ON services;
DROP POLICY IF EXISTS "Auth update services" ON services;
DROP POLICY IF EXISTS "Auth delete services" ON services;

DROP POLICY IF EXISTS "Auth insert products" ON products;
DROP POLICY IF EXISTS "Auth update products" ON products;
DROP POLICY IF EXISTS "Auth delete products" ON products;

DROP POLICY IF EXISTS "Auth insert industries" ON industries;
DROP POLICY IF EXISTS "Auth update industries" ON industries;
DROP POLICY IF EXISTS "Auth delete industries" ON industries;

DROP POLICY IF EXISTS "Auth insert case_studies" ON case_studies;
DROP POLICY IF EXISTS "Auth update case_studies" ON case_studies;
DROP POLICY IF EXISTS "Auth delete case_studies" ON case_studies;

DROP POLICY IF EXISTS "Auth insert blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Auth update blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Auth delete blog_posts" ON blog_posts;

DROP POLICY IF EXISTS "Auth insert authors" ON authors;
DROP POLICY IF EXISTS "Auth update authors" ON authors;
DROP POLICY IF EXISTS "Auth delete authors" ON authors;

DROP POLICY IF EXISTS "Auth insert blog_categories" ON blog_categories;
DROP POLICY IF EXISTS "Auth update blog_categories" ON blog_categories;
DROP POLICY IF EXISTS "Auth delete blog_categories" ON blog_categories;

DROP POLICY IF EXISTS "Auth insert team" ON team_members;
DROP POLICY IF EXISTS "Auth update team" ON team_members;
DROP POLICY IF EXISTS "Auth delete team" ON team_members;

DROP POLICY IF EXISTS "Auth insert categories" ON service_categories;
DROP POLICY IF EXISTS "Auth update categories" ON service_categories;
DROP POLICY IF EXISTS "Auth delete categories" ON service_categories;

DROP POLICY IF EXISTS "Auth manage settings" ON site_settings;
DROP POLICY IF EXISTS "Auth full contact" ON contact_submissions;

-- Create new admin-only write policies
-- The check mirrors verifyAdmin() in src/lib/admin/auth.ts

-- Services
CREATE POLICY "Admin insert services" ON services
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update services" ON services
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete services" ON services
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Products
CREATE POLICY "Admin insert products" ON products
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update products" ON products
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete products" ON products
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Industries
CREATE POLICY "Admin insert industries" ON industries
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update industries" ON industries
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete industries" ON industries
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Case Studies
CREATE POLICY "Admin insert case_studies" ON case_studies
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update case_studies" ON case_studies
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete case_studies" ON case_studies
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Blog Posts
CREATE POLICY "Admin insert blog_posts" ON blog_posts
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update blog_posts" ON blog_posts
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete blog_posts" ON blog_posts
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Authors
CREATE POLICY "Admin insert authors" ON authors
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update authors" ON authors
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete authors" ON authors
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Blog Categories
CREATE POLICY "Admin insert blog_categories" ON blog_categories
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update blog_categories" ON blog_categories
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete blog_categories" ON blog_categories
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Team Members
CREATE POLICY "Admin insert team" ON team_members
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update team" ON team_members
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete team" ON team_members
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Service Categories
CREATE POLICY "Admin insert categories" ON service_categories
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update categories" ON service_categories
  FOR UPDATE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete categories" ON service_categories
  FOR DELETE TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Site Settings (ALL operations — admin only)
CREATE POLICY "Admin manage settings" ON site_settings
  FOR ALL TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- Contact Submissions (public INSERT stays, admin gets READ/UPDATE/DELETE)
CREATE POLICY "Admin full contact" ON contact_submissions
  FOR ALL TO authenticated
  USING ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt()::json -> 'app_metadata' ->> 'role') = 'admin');

-- =============================================
-- 5. UPDATED_AT TRIGGERS FOR NEW TABLES
-- =============================================
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_applications_updated_at
  BEFORE UPDATE ON career_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
