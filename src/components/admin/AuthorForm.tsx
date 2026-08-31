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
import { authors } from '@/lib/admin/api';
import type { Author } from '@/lib/admin/types';

interface AuthorFormProps {
  initialData: Author | null;
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

export function AuthorForm({ initialData, mode, onSubmit }: AuthorFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';

  // ---- Basic Info ----
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [bio, setBio] = useState(initialData?.bio ?? '');
  const [role, setRole] = useState(initialData?.role ?? '');
  const [company, setCompany] = useState(initialData?.company ?? '');
  const [website, setWebsite] = useState(initialData?.website ?? '');

  // ---- Avatar ----
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url ?? '');

  // ---- Social Links ----
  const [socialTwitter, setSocialTwitter] = useState(initialData?.social_links?.twitter ?? '');
  const [socialLinkedin, setSocialLinkedin] = useState(initialData?.social_links?.linkedin ?? '');
  const [socialGithub, setSocialGithub] = useState(initialData?.social_links?.github ?? '');
  const [socialWebsite, setSocialWebsite] = useState(initialData?.social_links?.website ?? '');

  // ---- Options ----
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

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
    if (socialWebsite) social_links.website = socialWebsite;

    const payload = {
      slug,
      name,
      email,
      avatar_url: avatarUrl,
      bio,
      role,
      company,
      website,
      social_links,
      is_active: isActive,
    };

    try {
      if (isEdit && initialData?.id) {
        await authors.update(initialData.id, payload);
      } else {
        await authors.create(payload);
      }
      onSubmit?.();
      router.push('/authors');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save author');
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
                placeholder="e.g. John Doe"
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role / Title</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Developer"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short biography of the author"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---- Avatar ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload value={avatarUrl} onChange={setAvatarUrl} label="Avatar Image" />
        </CardContent>
      </Card>

      {/* ---- Social Links ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="social_github">GitHub</Label>
              <Input
                id="social_github"
                value={socialGithub}
                onChange={(e) => setSocialGithub(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social_website">Website</Label>
              <Input
                id="social_website"
                value={socialWebsite}
                onChange={(e) => setSocialWebsite(e.target.value)}
                placeholder="https://personal-site.com"
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Author' : 'Create Author'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/authors')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
