'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { ServiceForm } from '@/components/admin/ServiceForm';

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Service"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <ServiceForm mode="create" />
    </div>
  );
}
