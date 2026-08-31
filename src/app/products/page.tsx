'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { products } from '@/lib/admin/api';
import type { Product } from '@/lib/admin/types';

export default function ProductsListPage() {
  const router = useRouter();
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await products.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: Product) => {
    try {
      await products.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className="text-muted-foreground">{item.category || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <StatusBadge
          status={item.status || 'Unknown'}
          variant={item.status ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'is_published',
      label: 'Published',
      render: (item) => (
        <StatusBadge
          status={item.is_published ? 'Yes' : 'No'}
          variant={item.is_published ? 'success' : 'default'}
        />
      ),
    },
    {
      key: 'is_featured',
      label: 'Featured',
      render: (item) => (
        <StatusBadge
          status={item.is_featured ? 'Yes' : 'No'}
          variant={item.is_featured ? 'warning' : 'default'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        action={
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<Product>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/products/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No products yet. Create your first product to get started."
      />
    </div>
  );
}
