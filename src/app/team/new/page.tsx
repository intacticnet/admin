'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { TeamMemberForm } from '@/components/admin/TeamMemberForm';

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Team Member"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/team">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <TeamMemberForm initialData={null} mode="create" />
    </div>
  );
}
