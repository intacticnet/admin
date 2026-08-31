// ============================================================
// Intactic Admin — Client-side API Utility Module
// ============================================================

import type {
  Service,
  ServiceCategory,
  Product,
  Industry,
  CaseStudy,
  Author,
  BlogCategory,
  BlogPost,
  TeamMember,
  SiteSetting,
  Client,
  Project,
  ProjectMilestone,
  Invoice,
} from './types';

const API_BASE = '/api';

// ---- Generic fetch wrapper ----

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options ?? {};
  const res = await fetch(url, {
    ...restOptions,
    headers: { 'Content-Type': 'application/json', ...(customHeaders as Record<string, string>) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---- Helpers ----

type CreatePayload<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
type UpdatePayload<T> = Partial<CreatePayload<T>>;

function crud<T>(path: string) {
  return {
    getAll: () => fetchApi<T[]>(`${API_BASE}${path}`),
    getById: (id: string) => fetchApi<T>(`${API_BASE}${path}/${id}`),
    create: (data: CreatePayload<T>) =>
      fetchApi<T>(`${API_BASE}${path}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdatePayload<T>) =>
      fetchApi<T>(`${API_BASE}${path}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchApi<{ success: boolean }>(`${API_BASE}${path}/${id}`, { method: 'DELETE' }),
  };
}

// ---- Service Categories ----

export const serviceCategories = crud<ServiceCategory>('/service-categories');

// ---- Services ----

export const services = crud<Service>('/services');

// ---- Products ----

export const products = crud<Product>('/products');

// ---- Industries ----

export const industries = crud<Industry>('/industries');

// ---- Case Studies ----

export const caseStudies = crud<CaseStudy>('/case-studies');

// ---- Authors ----

export const authors = crud<Author>('/authors');

// ---- Blog Categories ----

export const blogCategories = crud<BlogCategory>('/blog-categories');

// ---- Blog Posts ----

export const blogPosts = crud<BlogPost>('/blog');

// ---- Team Members ----

export const team = crud<TeamMember>('/team');

// ---- Site Settings (key-value store, slightly different API shape) ----

export const settings = {
  getAll: () => fetchApi<SiteSetting[]>(`${API_BASE}/settings`),

  get: (key: string) => fetchApi<SiteSetting>(`${API_BASE}/settings/${key}`),

  update: (key: string, value: string) =>
    fetchApi<SiteSetting>(`${API_BASE}/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),

  delete: (key: string) =>
    fetchApi<{ success: boolean }>(`${API_BASE}/settings/${key}`, {
      method: 'DELETE',
    }),
};

// ---- Clients ----

export const clients = crud<Client>('/clients');

// ---- Projects ----

export const projects = crud<Project>('/projects');

// ---- Project Milestones ----

export const milestones = {
  getAll: (projectId: string) =>
    fetchApi<ProjectMilestone[]>(`${API_BASE}/projects/${projectId}/milestones`),
  bulkUpsert: (projectId: string, data: ProjectMilestone[]) =>
    fetchApi<ProjectMilestone[]>(`${API_BASE}/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ---- Invoices ----

export const invoices = crud<Invoice>('/invoices');
