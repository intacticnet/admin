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
import { industries } from '@/lib/admin/api';
import type { Industry, CoreSolution } from '@/lib/admin/types';

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

const emptySolution = (): CoreSolution => ({ title: '', description: '' });

// ---- Constants ----

const CATEGORIES = [
  { value: 'finance-commerce', label: 'Finance & Commerce' },
  { value: 'healthcare-enterprise', label: 'Healthcare & Enterprise' },
  { value: 'operations-gov', label: 'Operations & Gov' },
  { value: 'media-tech', label: 'Media & Tech' },
] as const;

const MOTION_TYPES = [
  { value: 'fintech-ledger', label: 'Fintech Ledger' },
  { value: 'edtech-nodes', label: 'EdTech Nodes' },
  { value: 'ecommerce-checkout', label: 'E-Commerce Checkout' },
  { value: 'health-ecg', label: 'Health ECG' },
  { value: 'logistics-radar', label: 'Logistics Radar' },
  { value: 'manufacturing-gears', label: 'Manufacturing Gears' },
  { value: 'media-equalizer', label: 'Media Equalizer' },
  { value: 'govtech-shield', label: 'GovTech Shield' },
  { value: 'travel-flight', label: 'Travel Flight' },
  { value: 'legaltech-seal', label: 'LegalTech Seal' },
  { value: 'saas-cluster', label: 'SaaS Cluster' },
  { value: 'startup-trajectory', label: 'Startup Trajectory' },
  { value: 'proptech-blueprint', label: 'PropTech Blueprint' },
] as const;

// ---- Types ----

type IndustryFormMode = 'create' | 'edit';

interface IndustryFormProps {
  mode: IndustryFormMode;
  industryId?: string;
  initialData?: Industry | null;
  onSubmit?: () => void;
}

// ---- Component ----

export function IndustryForm({ mode, industryId, initialData, onSubmit }: IndustryFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ---- Basic Info ----
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [shortTitle, setShortTitle] = useState(initialData?.short_title ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [tagline, setTagline] = useState(initialData?.tagline ?? '');
  const [heroDescription, setHeroDescription] = useState(initialData?.hero_description ?? '');
  const [iconName, setIconName] = useState(initialData?.icon_name ?? '');
  const [motionType, setMotionType] = useState(initialData?.motion_type ?? '');
  const [accentColor, setAccentColor] = useState(initialData?.accent_color ?? '');
  const [badge, setBadge] = useState(initialData?.badge ?? '');

  // ---- Content ----
  const [highlightsStr, setHighlightsStr] = useState(
    arrayToString(initialData?.highlights ?? [])
  );
  const [coreSolutions, setCoreSolutions] = useState<CoreSolution[]>(
    initialData?.core_solutions?.length ? initialData.core_solutions : [emptySolution()]
  );
  const [regulatoryStr, setRegulatoryStr] = useState(
    arrayToString(initialData?.regulatory_compliance ?? [])
  );
  const [techStackStr, setTechStackStr] = useState(
    arrayToString(initialData?.tech_stack ?? [])
  );

  // ---- Featured Metric ----
  const [featuredMetricValue, setFeaturedMetricValue] = useState(
    initialData?.featured_metric_value ?? ''
  );
  const [featuredMetricLabel, setFeaturedMetricLabel] = useState(
    initialData?.featured_metric_label ?? ''
  );

  // ---- Options ----
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
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

  // ---- Core Solutions handlers ----
  const updateSolution = (index: number, field: keyof CoreSolution, value: string) => {
    setCoreSolutions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };
  const addSolution = () => setCoreSolutions((prev) => [...prev, emptySolution()]);
  const removeSolution = (index: number) =>
    setCoreSolutions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      slug,
      name,
      short_title: shortTitle,
      category,
      tagline,
      hero_description: heroDescription,
      icon_name: iconName,
      motion_type: motionType,
      accent_color: accentColor,
      badge,
      highlights: stringToArray(highlightsStr),
      core_solutions: coreSolutions,
      regulatory_compliance: stringToArray(regulatoryStr),
      tech_stack: stringToArray(techStackStr),
      featured_metric_value: featuredMetricValue,
      featured_metric_label: featuredMetricLabel,
      is_published: isPublished,
      sort_order: sortOrder,
    };

    try {
      if (isEdit && industryId) {
        await industries.update(industryId, payload);
      } else {
        await industries.create(payload);
      }
      onSubmit?.();
      router.push('/industries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save industry');
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
                placeholder="e.g. Fintech & Banking"
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
              <Label htmlFor="short_title">Short Title</Label>
              <Input
                id="short_title"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                placeholder="e.g. Finance"
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
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
            <Label htmlFor="hero_description">Hero Description</Label>
            <Textarea
              id="hero_description"
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              placeholder="Description for the hero section"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="icon_name">Icon Name</Label>
              <Input
                id="icon_name"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="e.g. lucide icon name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motion_type">Motion Type</Label>
              <Select value={motionType} onValueChange={setMotionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select motion type" />
                </SelectTrigger>
                <SelectContent>
                  {MOTION_TYPES.map((mt) => (
                    <SelectItem key={mt.value} value={mt.value}>
                      {mt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={accentColor || '#000000'}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-14 shrink-0 cursor-pointer p-1"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="e.g. #10B981"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Input
                id="badge"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Top Industry"
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
          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights</Label>
            <Input
              id="highlights"
              value={highlightsStr}
              onChange={(e) => setHighlightsStr(e.target.value)}
              placeholder="e.g. Real-time Analytics, Automated Compliance, Global Reach"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of highlights.</p>
          </div>

          {/* Core Solutions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Core Solutions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSolution}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Solution
              </Button>
            </div>
            {coreSolutions.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-start rounded-lg border p-4"
              >
                <div className="space-y-2">
                  <Label>Solution Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateSolution(index, 'title', e.target.value)}
                    placeholder="Solution name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateSolution(index, 'description', e.target.value)}
                    placeholder="Brief description"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSolution(index)}
                  disabled={coreSolutions.length <= 1}
                  aria-label="Remove solution"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="regulatory_compliance">Regulatory Compliance</Label>
            <Input
              id="regulatory_compliance"
              value={regulatoryStr}
              onChange={(e) => setRegulatoryStr(e.target.value)}
              placeholder="e.g. GDPR, SOC 2, HIPAA, PCI-DSS"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of compliance standards.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech_stack">Tech Stack</Label>
            <Input
              id="tech_stack"
              value={techStackStr}
              onChange={(e) => setTechStackStr(e.target.value)}
              placeholder="e.g. React, Node.js, PostgreSQL, AWS"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of technologies.</p>
          </div>
        </CardContent>
      </Card>

      {/* ---- Featured Metric ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Metric</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="featured_metric_value">Metric Value</Label>
              <Input
                id="featured_metric_value"
                value={featuredMetricValue}
                onChange={(e) => setFeaturedMetricValue(e.target.value)}
                placeholder="e.g. 40% or 10M+"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured_metric_label">Metric Label</Label>
              <Input
                id="featured_metric_label"
                value={featuredMetricLabel}
                onChange={(e) => setFeaturedMetricLabel(e.target.value)}
                placeholder="e.g. Cost Reduction or Transactions Processed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Options ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
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
            <div className="space-y-2 sm:max-w-[200px]">
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
          {isEdit ? 'Update Industry' : 'Create Industry'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/industries')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
