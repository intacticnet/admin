// ============================================================
// Intactic Admin — Database-matched TypeScript Types
// ============================================================

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  tagline: string;
  icon_name: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon_name: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  category_id: string | null;
  tagline: string;
  description: string;
  hero_description: string;
  features: FeatureItem[];
  process: ProcessStep[];
  benefits: string[];
  technologies: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TargetAudience {
  role: string;
  benefit: string;
  description: string;
}

export interface MetricItem {
  metric: string;
  label: string;
  description: string;
}

export interface KeyFeature {
  title: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  version: string;
  status: string;
  active_users: string;
  hero_image: string;
  summary: string;
  overview: string;
  problem_statement: string;
  solution_overview: string;
  target_audience: TargetAudience[];
  metrics: MetricItem[];
  key_features: KeyFeature[];
  architecture_highlights: string[];
  vision: string;
  roadmap_highlights: string[];
  tech_stack: string[];
  pricing_model: string;
  live_url: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CoreSolution {
  title: string;
  description: string;
}

export interface Industry {
  id: string;
  slug: string;
  name: string;
  short_title: string;
  category: string;
  tagline: string;
  hero_description: string;
  icon_name: string;
  motion_type: string;
  accent_color: string;
  badge: string;
  highlights: string[];
  core_solutions: CoreSolution[];
  regulatory_compliance: string[];
  tech_stack: string[];
  featured_metric_value: string;
  featured_metric_label: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  client_industry: string;
  client_location: string;
  summary: string;
  challenge: string;
  solution: string;
  impact_metrics: MetricItem[];
  hero_image: string;
  technologies: string[];
  deliverables: string[];
  timeline: string;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  testimonial_role: string | null;
  testimonial_company: string | null;
  architecture_highlights: string[];
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  slug: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  role: string;
  company: string;
  website: string;
  social_links: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string | null;
  author_id: string | null;
  status: 'draft' | 'published' | 'archived';
  read_time: string;
  is_featured: boolean;
  is_trending: boolean;
  tags: string[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  image_url: string;
  bio: string;
  email: string;
  social_links: Record<string, string>;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}
