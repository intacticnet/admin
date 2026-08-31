'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { industries } from '@/lib/admin/api';
import type { Industry } from '@/lib/admin/types';

const CATEGORY_LABELS: Record<string, string> = {
  'finance-commerce': 'Finance & Commerce',
  'healthcare-enterprise': 'Healthcare & Enterprise',
  'operations-gov': 'Operations & Gov',
  'media-tech': 'Media & Tech',
};

export default function IndustriesListPage() {
  const router = useRouter();
  const [data, setData] = useState<Industry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await industries.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load industries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: Industry) => {
    try {
      await industries.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete industry');
    }
  };

  const columns: Column<Industry>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className="text-muted-foreground">
          {(CATEGORY_LABELS[item.category] ?? item.category) || '—'}
        </span>
      ),
    },
    {
      key: 'short_title',
      label: 'Short Title',
      render: (item) => (
        <span className="text-muted-foreground">{item.short_title || '—'}</span>
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
        title="Industries"
        action={
          <Button onClick={() => router.push('/industries/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Industry
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<Industry>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/industries/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No industries yet. Create your first industry to get started."
      />
    </div>
  );
}
