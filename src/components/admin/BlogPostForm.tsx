'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
import { blogPosts, authors, blogCategories } from '@/lib/admin/api';
import type { BlogPost, Author, BlogCategory } from '@/lib/admin/types';

interface BlogPostFormProps {
  initialData: BlogPost | null;
  mode: 'create' | 'edit';
  onSubmit?: () => void;
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

export function BlogPostForm({ initialData, mode, onSubmit }: BlogPostFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ---- Lookups ----
  const [authorList, setAuthorList] = useState<Author[]>([]);
  const [categoryList, setCategoryList] = useState<BlogCategory[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);

  // ---- Basic Info ----
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');

  // ---- Featured Image ----
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image ?? '');

  // ---- Meta ----
  const [authorId, setAuthorId] = useState(initialData?.author_id ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '');
  const [status, setStatus] = useState<string>(initialData?.status ?? 'draft');
  const [readTime, setReadTime] = useState(initialData?.read_time ?? '');
  const [tagsStr, setTagsStr] = useState(arrayToString(initialData?.tags ?? []));

  // ---- SEO ----
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? '');
  const [ogImage, setOgImage] = useState(initialData?.og_image ?? '');

  // ---- Options ----
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);
  const [isTrending, setIsTrending] = useState(initialData?.is_trending ?? false);

  // ---- UI state ----
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ---- Load lookups ----
  useEffect(() => {
    Promise.all([authors.getAll(), blogCategories.getAll()])
      .then(([a, c]) => {
        setAuthorList(a);
        setCategoryList(c);
      })
      .catch(() => {})
      .finally(() => setLookupsLoading(false));
  }, []);

  // ---- Auto-generate slug from title ----
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (!isEdit) {
        setSlug(toKebabCase(value));
      }
    },
    [isEdit]
  );

  // ---- Handle status change (auto-set published_at) ----
  const handleStatusChange = (value: string) => {
    const prevStatus = status;
    setStatus(value);
    // If changing from draft to published, we'll handle published_at in submit
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const shouldSetPublishedAt =
      status === 'published' && initialData?.status === 'draft';

    const payload = {
      slug,
      title,
      subtitle,
      excerpt,
      content,
      featured_image: featuredImage,
      author_id: authorId || null,
      category_id: categoryId || null,
      status: status as 'draft' | 'published' | 'archived',
      read_time: readTime,
      tags: stringToArray(tagsStr),
      meta_title: metaTitle,
      meta_description: metaDescription,
      og_image: ogImage,
      published_at:
        shouldSetPublishedAt
          ? new Date().toISOString()
          : initialData?.published_at ?? null,
      is_featured: isFeatured,
      is_trending: isTrending,
    };

    try {
      if (isEdit && initialData?.id) {
        await blogPosts.update(initialData.id, payload);
      } else {
        await blogPosts.create(payload);
      }
      onSubmit?.();
      router.push('/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
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
                placeholder="e.g. Getting Started with AI"
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

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A brief subtitle for the post"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary of the article (shown in cards and SEO)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Content ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Your Article Title\n\nWrite your content here..."
            className="min-h-[500px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Write your article in Markdown format. Supports headings, code blocks, links, images, lists, etc.
          </p>
        </CardContent>
      </Card>

      {/* ---- Featured Image ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={featuredImage}
            onChange={setFeaturedImage}
            label="Featured Image"
          />
        </CardContent>
      </Card>

      {/* ---- Meta ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={lookupsLoading ? 'Loading...' : 'Select author'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {authorList.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={lookupsLoading ? 'Loading...' : 'Select category'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="read_time">Read Time</Label>
              <Input
                id="read_time"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. AI, Technology, Tutorial"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of tags.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---- SEO ---- */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Override the page title for search engines"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="A brief description for search engine results"
              rows={3}
            />
          </div>
          <ImageUpload value={ogImage} onChange={setOgImage} label="OG Image" />
        </CardContent>
      </Card>

      {/* ---- Options ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_featured"
              checked={isFeatured}
              onCheckedChange={(checked) => setIsFeatured(checked === true)}
            />
            <Label htmlFor="is_featured" className="cursor-pointer">
              Featured Post
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_trending"
              checked={isTrending}
              onCheckedChange={(checked) => setIsTrending(checked === true)}
            />
            <Label htmlFor="is_trending" className="cursor-pointer">
              Trending Post
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Post' : 'Create Post'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/blog')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
