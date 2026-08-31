-- =============================================
-- INTACTIC CMS DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SERVICE CATEGORIES
-- =============================================
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SERVICES
-- =============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  process JSONB DEFAULT '[]'::jsonb,
  benefits TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  category TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL,
  active_users TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  summary TEXT NOT NULL,
  overview TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  solution_overview TEXT NOT NULL,
  target_audience JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '[]'::jsonb,
  key_features JSONB DEFAULT '[]'::jsonb,
  architecture_highlights TEXT[] DEFAULT '{}',
  vision TEXT DEFAULT '',
  roadmap_highlights TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  pricing_model TEXT DEFAULT '',
  live_url TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDUSTRIES
-- =============================================
CREATE TABLE industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_title TEXT NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  motion_type TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  badge TEXT NOT NULL,
  highlights TEXT[] DEFAULT '{}',
  core_solutions JSONB DEFAULT '[]'::jsonb,
  regulatory_compliance TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  featured_metric_value TEXT DEFAULT '',
  featured_metric_label TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CASE STUDIES
-- =============================================
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  client_industry TEXT NOT NULL,
  client_location TEXT NOT NULL,
  summary TEXT NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  impact_metrics JSONB DEFAULT '[]'::jsonb,
  hero_image TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',
  timeline TEXT DEFAULT '',
  testimonial_quote TEXT,
  testimonial_author TEXT,
  testimonial_role TEXT,
  testimonial_company TEXT,
  architecture_highlights TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BLOG AUTHORS (multi-author support)
-- =============================================
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  role TEXT DEFAULT 'Author',
  company TEXT DEFAULT '',
  website TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BLOG CATEGORIES
-- =============================================
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BLOG POSTS
-- =============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '', -- Markdown content
  featured_image TEXT DEFAULT '',
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  read_time TEXT DEFAULT '5 min read',
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TEAM MEMBERS
-- =============================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  email TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SITE SETTINGS (key-value store)
-- =============================================
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTACT SUBMISSIONS (public lead capture)
-- =============================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT DEFAULT '',
  message TEXT NOT NULL,
  services TEXT[] DEFAULT '{}',
  budget TEXT DEFAULT '',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'converted', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NEWSLETTER SUBSCRIBERS
-- =============================================
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CAREER APPLICATIONS
-- =============================================
CREATE TABLE career_applications (
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

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_published ON services(is_published);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_industries_slug ON industries(slug);
CREATE INDEX idx_industries_published ON industries(is_published);
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_published ON case_studies(is_published);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_authors_slug ON authors(slug);
CREATE INDEX idx_team_members_slug ON team_members(slug);
CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_career_applications_created ON career_applications(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
-- Enable RLS on all tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read published services" ON services FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published products" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published industries" ON industries FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published case_studies" ON case_studies FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published blog posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published authors" ON authors FOR SELECT USING (is_active = true);
CREATE POLICY "Public read categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Public read blog categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Public read team" ON team_members FOR SELECT USING (is_published = true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

-- Authenticated users can read everything
CREATE POLICY "Auth read all services" ON services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read all products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read all industries" ON industries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read all case_studies" ON case_studies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read all blog posts" ON blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read all authors" ON authors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read team" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read all settings" ON site_settings FOR SELECT TO authenticated USING (true);


-- Newsletter: public INSERT, admin read/delete
CREATE POLICY "Anon insert newsletter" ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin read newsletter" ON newsletter_subscribers FOR SELECT TO authenticated USING ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete newsletter" ON newsletter_subscribers FOR DELETE TO authenticated USING ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin');

-- Career applications: public INSERT, admin read/update/delete
CREATE POLICY "Anon insert careers" ON career_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin read careers" ON career_applications FOR SELECT TO authenticated USING ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update careers" ON career_applications FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete careers" ON career_applications FOR DELETE TO authenticated USING ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin');

-- Contact submissions: public can INSERT (form submissions), admin can read/update/delete
CREATE POLICY "Anon insert contact" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin full contact" ON contact_submissions FOR ALL TO authenticated USING ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() ->> 'app_metadata' ->> 'role') = 'admin');

-- =============================================
-- DEFAULT BLOG CATEGORIES
-- =============================================
INSERT INTO blog_categories (slug, name, description, color, sort_order) VALUES
  ('web-development', 'Web Development', 'Frontend, backend, full-stack web development', '#10b981', 1),
  ('ai-ml', 'AI & Machine Learning', 'Artificial intelligence, machine learning, deep learning', '#8b5cf6', 2),
  ('cloud-devops', 'Cloud & DevOps', 'Cloud computing, CI/CD, infrastructure', '#f59e0b', 3),
  ('cybersecurity', 'Cybersecurity', 'Security best practices, threat analysis', '#ef4444', 4),
  ('software-architecture', 'Software Architecture', 'System design, patterns, scalability', '#3b82f6', 5),
  ('fintech', 'Fintech & Systems', 'Financial technology, payment systems', '#06b6d4', 6),
  ('mobile-development', 'Mobile Development', 'iOS, Android, cross-platform development', '#ec4899', 7),
  ('startup-business', 'Startup & Business', 'Startup insights, business strategy', '#f97316', 8);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_industries_updated_at BEFORE UPDATE ON industries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
