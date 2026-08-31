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
import { caseStudies } from '@/lib/admin/api';
import type { CaseStudy, MetricItem } from '@/lib/admin/types';

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

const emptyMetric = (): MetricItem => ({ metric: '', label: '', description: '' });

// ---- Constants ----

const CLIENT_INDUSTRIES = [
  'Fintech & Banking',
  'Logistics & Supply Chain',
  'Healthcare & Biotech',
  'Enterprise SaaS',
  'Defence & Security',
] as const;

// ---- Types ----

type CaseStudyFormMode = 'create' | 'edit';

interface CaseStudyFormProps {
  mode: CaseStudyFormMode;
  caseStudyId?: string;
  initialData?: CaseStudy | null;
  onSubmit?: () => void;
}

// ---- Component ----

export function CaseStudyForm({ mode, caseStudyId, initialData, onSubmit }: CaseStudyFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ---- Basic Info ----
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [client, setClient] = useState(initialData?.client ?? '');
  const [clientIndustry, setClientIndustry] = useState(initialData?.client_industry ?? '');
  const [clientLocation, setClientLocation] = useState(initialData?.client_location ?? '');
  const [timeline, setTimeline] = useState(initialData?.timeline ?? '');

  // ---- Content ----
  const [summary, setSummary] = useState(initialData?.summary ?? '');
  const [challenge, setChallenge] = useState(initialData?.challenge ?? '');
  const [solution, setSolution] = useState(initialData?.solution ?? '');
  const [heroImage, setHeroImage] = useState(initialData?.hero_image ?? '');
  const [impactMetrics, setImpactMetrics] = useState<MetricItem[]>(
    initialData?.impact_metrics?.length ? initialData.impact_metrics : [emptyMetric()]
  );
  const [technologiesStr, setTechnologiesStr] = useState(
    arrayToString(initialData?.technologies ?? [])
  );
  const [deliverablesStr, setDeliverablesStr] = useState(
    arrayToString(initialData?.deliverables ?? [])
  );
  const [archHighlightsStr, setArchHighlightsStr] = useState(
    arrayToString(initialData?.architecture_highlights ?? [])
  );

  // ---- Testimonial ----
  const [testimonialQuote, setTestimonialQuote] = useState(
    initialData?.testimonial_quote ?? ''
  );
  const [testimonialAuthor, setTestimonialAuthor] = useState(
    initialData?.testimonial_author ?? ''
  );
  const [testimonialRole, setTestimonialRole] = useState(
    initialData?.testimonial_role ?? ''
  );
  const [testimonialCompany, setTestimonialCompany] = useState(
    initialData?.testimonial_company ?? ''
  );

  // ---- Options ----
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);

  // ---- UI state ----
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ---- Auto-generate slug ----
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (!isEdit) {
        setSlug(toKebabCase(value));
      }
    },
    [isEdit]
  );

  // ---- Impact Metrics handlers ----
  const updateMetric = (index: number, field: keyof MetricItem, value: string) => {
    setImpactMetrics((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };
  const addMetric = () => setImpactMetrics((prev) => [...prev, emptyMetric()]);
  const removeMetric = (index: number) =>
    setImpactMetrics((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      slug,
      title,
      client,
      client_industry: clientIndustry,
      client_location: clientLocation,
      summary,
      challenge,
      solution,
      hero_image: heroImage,
      impact_metrics: impactMetrics,
      technologies: stringToArray(technologiesStr),
      deliverables: stringToArray(deliverablesStr),
      timeline,
      testimonial_quote: testimonialQuote || null,
      testimonial_author: testimonialAuthor || null,
      testimonial_role: testimonialRole || null,
      testimonial_company: testimonialCompany || null,
      architecture_highlights: stringToArray(archHighlightsStr),
      is_published: isPublished,
      is_featured: isFeatured,
      sort_order: sortOrder,
    };

    try {
      if (isEdit && caseStudyId) {
        await caseStudies.update(caseStudyId, payload);
      } else {
        await caseStudies.create(payload);
      }
      onSubmit?.();
      router.push('/case-studies');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save case study');
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
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Transforming Payment Processing for Global Bank"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from title. Edit manually if needed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Acme Corporation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_industry">Client Industry</Label>
              <Select value={clientIndustry} onValueChange={setClientIndustry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_location">Client Location</Label>
              <Input
                id="client_location"
                value={clientLocation}
                onChange={(e) => setClientLocation(e.target.value)}
                placeholder="e.g. London, UK"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 12 weeks, Q1 2024"
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
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief overview of the case study"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge">Challenge</Label>
            <Textarea
              id="challenge"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="What challenge did the client face?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="How did we solve it?"
              rows={4}
            />
          </div>

          <ImageUpload
            value={heroImage}
            onChange={setHeroImage}
            label="Hero Image"
          />

          {/* Impact Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Impact Metrics</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Metric
              </Button>
            </div>
            {impactMetrics.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-start rounded-lg border p-4"
              >
                <div className="space-y-2">
                  <Label>Metric</Label>
                  <Input
                    value={item.metric}
                    onChange={(e) => updateMetric(index, 'metric', e.target.value)}
                    placeholder="e.g. 40%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateMetric(index, 'label', e.target.value)}
                    placeholder="e.g. Cost Reduction"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateMetric(index, 'description', e.target.value)}
                    placeholder="Brief explanation"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeMetric(index)}
                  disabled={impactMetrics.length <= 1}
                  aria-label="Remove metric"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies</Label>
            <Input
              id="technologies"
              value={technologiesStr}
              onChange={(e) => setTechnologiesStr(e.target.value)}
              placeholder="e.g. React, Node.js, PostgreSQL, AWS"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of technologies.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Deliverables</Label>
            <Input
              id="deliverables"
              value={deliverablesStr}
              onChange={(e) => setDeliverablesStr(e.target.value)}
              placeholder="e.g. Web Platform, Mobile App, API Gateway, Admin Dashboard"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of deliverables.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="architecture_highlights">Architecture Highlights</Label>
            <Input
              id="architecture_highlights"
              value={archHighlightsStr}
              onChange={(e) => setArchHighlightsStr(e.target.value)}
              placeholder="e.g. Microservices, Event-Driven, Multi-Region"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list.</p>
          </div>
        </CardContent>
      </Card>

      {/* ---- Testimonial ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testimonial_quote">Quote</Label>
            <Textarea
              id="testimonial_quote"
              value={testimonialQuote}
              onChange={(e) => setTestimonialQuote(e.target.value)}
              placeholder="Client testimonial quote"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="testimonial_author">Author</Label>
              <Input
                id="testimonial_author"
                value={testimonialAuthor}
                onChange={(e) => setTestimonialAuthor(e.target.value)}
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testimonial_role">Role</Label>
              <Input
                id="testimonial_role"
                value={testimonialRole}
                onChange={(e) => setTestimonialRole(e.target.value)}
                placeholder="e.g. CTO"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testimonial_company">Company</Label>
              <Input
                id="testimonial_company"
                value={testimonialCompany}
                onChange={(e) => setTestimonialCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
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
          <div className="grid gap-4 sm:grid-cols-[auto_auto_1fr]">
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
          {isEdit ? 'Update Case Study' : 'Create Case Study'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/case-studies')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
