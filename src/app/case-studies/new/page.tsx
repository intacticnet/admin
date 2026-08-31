'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { CaseStudyForm } from '@/components/admin/CaseStudyForm';

export default function NewCaseStudyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Case Study"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/case-studies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <CaseStudyForm mode="create" />
    </div>
  );
}
