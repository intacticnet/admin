'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { services } from '@/lib/admin/api';
import type { Service } from '@/lib/admin/types';

interface ServiceWithCategory extends Service {
  service_categories?: { title: string; slug: string } | null;
}

export default function ServicesListPage() {
  const router = useRouter();
  const [data, setData] = useState<ServiceWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await services.getAll();
      setData(result as ServiceWithCategory[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: ServiceWithCategory) => {
    try {
      await services.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  const columns: Column<ServiceWithCategory>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (item) => (
        <span className="font-medium">{item.title}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className="text-muted-foreground">
          {item.service_categories?.title ?? '—'}
        </span>
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
        title="Services"
        action={
          <Button onClick={() => router.push('/services/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Service
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<ServiceWithCategory>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/services/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No services yet. Create your first service to get started."
      />
    </div>
  );
}
