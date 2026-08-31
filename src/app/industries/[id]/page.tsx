'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { IndustryForm } from '@/components/admin/IndustryForm';
import { industries } from '@/lib/admin/api';
import type { Industry } from '@/lib/admin/types';

export default function EditIndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    industries
      .getById(id)
      .then(setIndustry)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load industry')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Industry" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !industry) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Industry"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/industries">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || 'Industry not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Industry"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/industries">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <IndustryForm mode="edit" industryId={id} initialData={industry} />
    </div>
  );
}
