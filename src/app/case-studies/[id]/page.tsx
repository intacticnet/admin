'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { CaseStudyForm } from '@/components/admin/CaseStudyForm';
import { caseStudies } from '@/lib/admin/api';
import type { CaseStudy } from '@/lib/admin/types';

export default function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    caseStudies
      .getById(id)
      .then(setCaseStudy)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load case study')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Case Study" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Case Study"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/case-studies">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || 'Case study not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Case Study"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/case-studies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <CaseStudyForm mode="edit" caseStudyId={id} initialData={caseStudy} />
    </div>
  );
}
