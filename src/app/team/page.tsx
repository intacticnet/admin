'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { team } from '@/lib/admin/api';
import type { TeamMember } from '@/lib/admin/types';

export default function TeamListPage() {
  const router = useRouter();
  const [data, setData] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await team.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: TeamMember) => {
    try {
      await team.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team member');
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (item) => (
        <span className="text-muted-foreground">{item.role || '—'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (item) => (
        <span className="text-muted-foreground">{item.email || '—'}</span>
      ),
    },
    {
      key: 'is_published',
      label: 'Status',
      render: (item) => (
        <StatusBadge
          status={item.is_published ? 'Published' : 'Draft'}
          variant={item.is_published ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'sort_order',
      label: 'Order',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        action={
          <Button onClick={() => router.push('/team/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Member
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<TeamMember>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/team/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No team members yet. Add your first team member to get started."
      />
    </div>
  );
}
