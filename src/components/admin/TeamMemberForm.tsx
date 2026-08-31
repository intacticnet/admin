'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { team } from '@/lib/admin/api';
import type { TeamMember } from '@/lib/admin/types';

interface TeamMemberFormProps {
  initialData: TeamMember | null;
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

export function TeamMemberForm({ initialData, mode, onSubmit }: TeamMemberFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ---- Basic Info ----
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [role, setRole] = useState(initialData?.role ?? '');
  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');

  // ---- Image ----
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '');

  // ---- Social Links ----
  const [socialTwitter, setSocialTwitter] = useState(initialData?.social_links?.twitter ?? '');
  const [socialLinkedin, setSocialLinkedin] = useState(initialData?.social_links?.linkedin ?? '');
  const [socialGithub, setSocialGithub] = useState(initialData?.social_links?.github ?? '');

  // ---- Options ----
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);

  // ---- UI state ----
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ---- Auto-generate slug from name ----
  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!isEdit) {
        setSlug(toKebabCase(value));
      }
    },
    [isEdit]
  );

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const social_links: Record<string, string> = {};
    if (socialTwitter) social_links.twitter = socialTwitter;
    if (socialLinkedin) social_links.linkedin = socialLinkedin;
    if (socialGithub) social_links.github = socialGithub;

    const payload = {
      slug,
      name,
      role,
      image_url: imageUrl,
      bio,
      email,
      social_links,
      sort_order: sortOrder,
      is_published: isPublished,
    };

    try {
      if (isEdit && initialData?.id) {
        await team.update(initialData.id, payload);
      } else {
        await team.create(payload);
      }
      onSubmit?.();
      router.push('/team');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team member');
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
                placeholder="e.g. Jane Smith"
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
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. CTO"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short biography"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Image ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload value={imageUrl} onChange={setImageUrl} label="Team Photo" />
        </CardContent>
      </Card>

      {/* ---- Social Links ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="social_twitter">Twitter / X</Label>
              <Input
                id="social_twitter"
                value={socialTwitter}
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_linkedin">LinkedIn</Label>
              <Input
                id="social_linkedin"
                value={socialLinkedin}
                onChange={(e) => setSocialLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_github">GitHub</Label>
              <Input
                id="social_github"
                value={socialGithub}
                onChange={(e) => setSocialGithub(e.target.value)}
                placeholder="https://github.com/username"
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
        <CardContent className="space-y-4">
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
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Team Member' : 'Create Team Member'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/team')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
