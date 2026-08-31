'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { caseStudies } from '@/lib/admin/api';
import type { CaseStudy } from '@/lib/admin/types';

export default function CaseStudiesListPage() {
  const router = useRouter();
  const [data, setData] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await caseStudies.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load case studies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: CaseStudy) => {
    try {
      await caseStudies.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete case study');
    }
  };

  const columns: Column<CaseStudy>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (item) => <span className="font-medium">{item.title}</span>,
    },
    {
      key: 'client',
      label: 'Client',
      render: (item) => (
        <span className="text-muted-foreground">{item.client || '—'}</span>
      ),
    },
    {
      key: 'client_industry',
      label: 'Industry',
      render: (item) => (
        <span className="text-muted-foreground">{item.client_industry || '—'}</span>
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
      key: 'is_featured',
      label: 'Featured',
      render: (item) => (
        <StatusBadge
          status={item.is_featured ? 'Featured' : 'No'}
          variant={item.is_featured ? 'warning' : 'default'}
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
        title="Case Studies"
        action={
          <Button onClick={() => router.push('/case-studies/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Case Study
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<CaseStudy>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/case-studies/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No case studies yet. Create your first case study to get started."
      />
    </div>
  );
}
