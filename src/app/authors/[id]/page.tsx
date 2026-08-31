'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { AuthorForm } from '@/components/admin/AuthorForm';
import { authors } from '@/lib/admin/api';
import type { Author } from '@/lib/admin/types';

export default function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authors
      .getById(id)
      .then(setAuthor)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load author')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Author" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Author"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/authors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || 'Author not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Author"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/authors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <AuthorForm initialData={author} mode="edit" />
    </div>
  );
}
