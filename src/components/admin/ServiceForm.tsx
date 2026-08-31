'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { serviceCategories, services } from '@/lib/admin/api';
import type { Service, ServiceCategory, FeatureItem, ProcessStep } from '@/lib/admin/types';

type ServiceFormMode = 'create' | 'edit';

interface ServiceFormProps {
  mode: ServiceFormMode;
  serviceId?: string;
  initialData?: Service;
}

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

const emptyFeature = (): FeatureItem => ({ title: '', description: '', icon_name: '' });
const emptyProcess = (): ProcessStep => ({ step: 1, title: '', description: '' });

export function ServiceForm({ mode, serviceId, initialData }: ServiceFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ---- Categories ----
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ---- Form state ----
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [shortTitle, setShortTitle] = useState(initialData?.short_title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [tagline, setTagline] = useState(initialData?.tagline ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [heroDescription, setHeroDescription] = useState(initialData?.hero_description ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '');
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [features, setFeatures] = useState<FeatureItem[]>(
    initialData?.features?.length ? initialData.features : [emptyFeature()]
  );
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(
    initialData?.process?.length ? initialData.process : [emptyProcess()]
  );
  const [benefitsStr, setBenefitsStr] = useState(arrayToString(initialData?.benefits ?? []));
  const [technologiesStr, setTechnologiesStr] = useState(
    arrayToString(initialData?.technologies ?? [])
  );

  // ---- UI state ----
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ---- Load categories ----
  useEffect(() => {
    serviceCategories
      .getAll()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  // ---- Auto-generate slug ----
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    if (!isEdit) {
      setSlug(toKebabCase(value));
    }
  }, [isEdit]);

  // ---- Feature handlers ----
  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };
  const addFeature = () => setFeatures((prev) => [...prev, emptyFeature()]);
  const removeFeature = (index: number) =>
    setFeatures((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  // ---- Process handlers ----
  const updateProcess = (index: number, field: keyof ProcessStep, value: string | number) => {
    setProcessSteps((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };
  const addProcess = () =>
    setProcessSteps((prev) => [...prev, { step: prev.length + 1, title: '', description: '' }]);
  const removeProcess = (index: number) => {
    setProcessSteps((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.map((p, i) => ({ ...p, step: i + 1 }));
    });
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      slug,
      title,
      short_title: shortTitle,
      category_id: categoryId || null,
      tagline,
      description,
      hero_description: heroDescription,
      features,
      process: processSteps,
      benefits: stringToArray(benefitsStr),
      technologies: stringToArray(technologiesStr),
      is_published: isPublished,
      sort_order: sortOrder,
    };

    try {
      if (isEdit && serviceId) {
        await services.update(serviceId, payload);
      } else {
        await services.create(payload);
      }
      router.push('/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
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
                placeholder="e.g. Digital Transformation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_title">Short Title</Label>
              <Input
                id="short_title"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                placeholder="e.g. Digital"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short catchy phrase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full description of the service"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_description">Hero Description</Label>
            <Textarea
              id="hero_description"
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              placeholder="Short description for hero section"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex items-end gap-2 pb-0.5">
              <Checkbox
                id="is_published"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked === true)}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Published
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Features ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Features</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-start rounded-lg border p-4"
            >
              <div className="space-y-2">
                <Label>Feature Title</Label>
                <Input
                  value={feature.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  placeholder="Feature name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  placeholder="Brief description"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Icon Name</Label>
                <Input
                  value={feature.icon_name}
                  onChange={(e) => updateFeature(index, 'icon_name', e.target.value)}
                  placeholder="lucide icon"
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFeature(index)}
                  disabled={features.length <= 1}
                  aria-label="Remove feature"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---- Process Steps ---- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Process</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addProcess}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] items-start rounded-lg border p-4"
            >
              <div className="space-y-2">
                <Label>Step #</Label>
                <Input
                  type="number"
                  min={1}
                  value={step.step}
                  onChange={(e) => updateProcess(index, 'step', Number(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Step Title</Label>
                <Input
                  value={step.title}
                  onChange={(e) => updateProcess(index, 'title', e.target.value)}
                  placeholder="Step name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={step.description}
                  onChange={(e) => updateProcess(index, 'description', e.target.value)}
                  placeholder="What happens in this step"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeProcess(index)}
                  disabled={processSteps.length <= 1}
                  aria-label="Remove step"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---- Benefits & Technologies ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits & Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <Input
              id="benefits"
              value={benefitsStr}
              onChange={(e) => setBenefitsStr(e.target.value)}
              placeholder="e.g. Cost Reduction, Faster Time-to-Market, Scalability"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of benefits.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies</Label>
            <Input
              id="technologies"
              value={technologiesStr}
              onChange={(e) => setTechnologiesStr(e.target.value)}
              placeholder="e.g. React, Node.js, PostgreSQL, AWS"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of technologies.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Service' : 'Create Service'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/services')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
