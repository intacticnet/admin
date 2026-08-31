'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { products } from '@/lib/admin/api';
import type {
  Product,
  TargetAudience,
  MetricItem,
  KeyFeature,
} from '@/lib/admin/types';

// ---- Helpers ----

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function arrayToString(arr: string[]): string {
  return arr.join(', ');
}

function stringToArray(str: string): string[] {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const emptyAudience = (): TargetAudience => ({ role: '', benefit: '', description: '' });
const emptyMetric = (): MetricItem => ({ metric: '', label: '', description: '' });
const emptyFeature = (): KeyFeature => ({ title: '', description: '' });

// ---- Constants ----

const CATEGORIES = [
  'Workplace & Team SaaS',
  'Fintech & Global Payments',
  'DevOps & FinOps Platform',
  'Cybersecurity & Compliance',
] as const;

const STATUSES = [
  'Live SaaS Product',
  'Enterprise Active',
  '4.9/5 Rated',
] as const;

// ---- Types ----

type ProductFormMode = 'create' | 'edit';

interface ProductFormProps {
  mode: ProductFormMode;
  productId?: string;
  initialData?: Product | null;
}

// ---- Component ----

export function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ---- Basic Info ----
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [tagline, setTagline] = useState(initialData?.tagline ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [version, setVersion] = useState(initialData?.version ?? '');
  const [status, setStatus] = useState(initialData?.status ?? '');
  const [activeUsers, setActiveUsers] = useState(initialData?.active_users ?? '');
  const [pricingModel, setPricingModel] = useState(initialData?.pricing_model ?? '');
  const [liveUrl, setLiveUrl] = useState(initialData?.live_url ?? '');

  // ---- Content ----
  const [heroImage, setHeroImage] = useState(initialData?.hero_image ?? '');
  const [summary, setSummary] = useState(initialData?.summary ?? '');
  const [overview, setOverview] = useState(initialData?.overview ?? '');
  const [problemStatement, setProblemStatement] = useState(initialData?.problem_statement ?? '');
  const [solutionOverview, setSolutionOverview] = useState(initialData?.solution_overview ?? '');

  // ---- Dynamic Lists ----
  const [targetAudience, setTargetAudience] = useState<TargetAudience[]>(
    initialData?.target_audience?.length ? initialData.target_audience : [emptyAudience()]
  );
  const [metrics, setMetrics] = useState<MetricItem[]>(
    initialData?.metrics?.length ? initialData.metrics : [emptyMetric()]
  );
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>(
    initialData?.key_features?.length ? initialData.key_features : [emptyFeature()]
  );

  // ---- Technical ----
  const [archHighlights, setArchHighlights] = useState(
    arrayToString(initialData?.architecture_highlights ?? [])
  );
  const [techStack, setTechStack] = useState(
    arrayToString(initialData?.tech_stack ?? [])
  );
  const [vision, setVision] = useState(initialData?.vision ?? '');
  const [roadmapHighlights, setRoadmapHighlights] = useState(
    arrayToString(initialData?.roadmap_highlights ?? [])
  );

  // ---- Options ----
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);

  // ---- UI state ----
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ---- Auto-generate slug ----
  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!isEdit) {
        setSlug(toKebabCase(value));
      }
    },
    [isEdit]
  );

  // ---- Target Audience handlers ----
  const updateAudience = (index: number, field: keyof TargetAudience, value: string) => {
    setTargetAudience((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };
  const addAudience = () => setTargetAudience((prev) => [...prev, emptyAudience()]);
  const removeAudience = (index: number) =>
    setTargetAudience((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  // ---- Metrics handlers ----
  const updateMetric = (index: number, field: keyof MetricItem, value: string) => {
    setMetrics((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };
  const addMetric = () => setMetrics((prev) => [...prev, emptyMetric()]);
  const removeMetric = (index: number) =>
    setMetrics((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  // ---- Key Features handlers ----
  const updateFeature = (index: number, field: keyof KeyFeature, value: string) => {
    setKeyFeatures((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };
  const addFeature = () => setKeyFeatures((prev) => [...prev, emptyFeature()]);
  const removeFeature = (index: number) =>
    setKeyFeatures((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      slug,
      name,
      tagline,
      category,
      version,
      status,
      active_users: activeUsers,
      hero_image: heroImage,
      summary,
      overview,
      problem_statement: problemStatement,
      solution_overview: solutionOverview,
      target_audience: targetAudience,
      metrics,
      key_features: keyFeatures,
      architecture_highlights: stringToArray(archHighlights),
      vision,
      roadmap_highlights: stringToArray(roadmapHighlights),
      tech_stack: stringToArray(techStack),
      pricing_model: pricingModel,
      live_url: liveUrl,
      is_published: isPublished,
      is_featured: isFeatured,
      sort_order: sortOrder,
    };

    try {
      if (isEdit && productId) {
        await products.update(productId, payload);
      } else {
        await products.create(payload);
      }
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ---- Basic Info ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. SyncBoard"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-name"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Edit manually if needed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short catchy phrase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 3.2.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="active_users">Active Users</Label>
              <Input
                id="active_users"
                value={activeUsers}
                onChange={(e) => setActiveUsers(e.target.value)}
                placeholder="e.g. 10,000+"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pricing_model">Pricing Model</Label>
              <Input
                id="pricing_model"
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                placeholder="e.g. Freemium, Enterprise"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="live_url">Live URL</Label>
              <Input
                id="live_url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Content ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            value={heroImage}
            onChange={setHeroImage}
            label="Hero Image"
          />

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief product summary"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Detailed product overview"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_statement">Problem Statement</Label>
            <Textarea
              id="problem_statement"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="What problem does this product solve?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution_overview">Solution Overview</Label>
            <Textarea
              id="solution_overview"
              value={solutionOverview}
              onChange={(e) => setSolutionOverview(e.target.value)}
              placeholder="How does this product solve the problem?"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Target Audience ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Target Audience</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addAudience}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Audience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {targetAudience.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-start rounded-lg border p-4"
            >
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={item.role}
                  onChange={(e) => updateAudience(index, 'role', e.target.value)}
                  placeholder="e.g. CTO"
                />
              </div>
              <div className="space-y-2">
                <Label>Benefit</Label>
                <Input
                  value={item.benefit}
                  onChange={(e) => updateAudience(index, 'benefit', e.target.value)}
                  placeholder="Key benefit"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateAudience(index, 'description', e.target.value)}
                  placeholder="Detailed description"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeAudience(index)}
                disabled={targetAudience.length <= 1}
                aria-label="Remove audience"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---- Metrics ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Metrics</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addMetric}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-start rounded-lg border p-4"
            >
              <div className="space-y-2">
                <Label>Metric</Label>
                <Input
                  value={item.metric}
                  onChange={(e) => updateMetric(index, 'metric', e.target.value)}
                  placeholder="e.g. 99.9%"
                />
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={item.label}
                  onChange={(e) => updateMetric(index, 'label', e.target.value)}
                  placeholder="e.g. Uptime"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateMetric(index, 'description', e.target.value)}
                  placeholder="Metric description"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeMetric(index)}
                disabled={metrics.length <= 1}
                aria-label="Remove metric"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---- Key Features ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Key Features</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {keyFeatures.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-start rounded-lg border p-4"
            >
              <div className="space-y-2">
                <Label>Feature Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  placeholder="Feature name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  placeholder="Brief description"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeFeature(index)}
                disabled={keyFeatures.length <= 1}
                aria-label="Remove feature"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---- Technical ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Technical</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="architecture_highlights">Architecture Highlights</Label>
            <Input
              id="architecture_highlights"
              value={archHighlights}
              onChange={(e) => setArchHighlights(e.target.value)}
              placeholder="e.g. Microservices, Event-Driven, Multi-Region"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech_stack">Tech Stack</Label>
            <Input
              id="tech_stack"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. React, Node.js, PostgreSQL, AWS"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Vision</Label>
            <Textarea
              id="vision"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="Product vision statement"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roadmap_highlights">Roadmap Highlights</Label>
            <Input
              id="roadmap_highlights"
              value={roadmapHighlights}
              onChange={(e) => setRoadmapHighlights(e.target.value)}
              placeholder="e.g. AI Integration, Mobile App, Global CDN"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list.</p>
          </div>
        </CardContent>
      </Card>

      {/* ---- Options ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_published"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked === true)}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Published
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked === true)}
              />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Featured
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/products')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
