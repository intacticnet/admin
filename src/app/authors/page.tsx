'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { authors } from '@/lib/admin/api';
import type { Author } from '@/lib/admin/types';

export default function AuthorsListPage() {
  const router = useRouter();
  const [data, setData] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await authors.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load authors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: Author) => {
    try {
      await authors.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete author');
    }
  };

  const columns: Column<Author>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (item) => (
        <span className="text-muted-foreground">{item.email || '—'}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (item) => (
        <span className="text-muted-foreground">{item.role || '—'}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item) => (
        <StatusBadge
          status={item.is_active ? 'Active' : 'Inactive'}
          variant={item.is_active ? 'success' : 'default'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authors"
        action={
          <Button onClick={() => router.push('/authors/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Author
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<Author>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/authors/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No authors yet. Create your first author to get started."
      />
    </div>
  );
}
