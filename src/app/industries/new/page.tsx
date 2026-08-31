'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { IndustryForm } from '@/components/admin/IndustryForm';

export default function NewIndustryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Industry"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/industries">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <IndustryForm mode="create" />
    </div>
  );
}
