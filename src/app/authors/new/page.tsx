'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { AuthorForm } from '@/components/admin/AuthorForm';

export default function NewAuthorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Author"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/authors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <AuthorForm initialData={null} mode="create" />
    </div>
  );
}
