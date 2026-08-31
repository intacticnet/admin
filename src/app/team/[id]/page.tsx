'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { TeamMemberForm } from '@/components/admin/TeamMemberForm';
import { team } from '@/lib/admin/api';
import type { TeamMember } from '@/lib/admin/types';

export default function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    team
      .getById(id)
      .then(setMember)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load team member')
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Team Member" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Team Member"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/team">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error || 'Team member not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Team Member"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/team">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />
      <TeamMemberForm initialData={member} mode="edit" />
    </div>
  );
}
