'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { blogPosts } from '@/lib/admin/api';
import type { BlogPost } from '@/lib/admin/types';

interface BlogPostWithJoins extends BlogPost {
  authors?: { name: string; slug: string } | null;
  blog_categories?: { name: string; slug: string } | null;
}

const statusVariant = (s: string): 'success' | 'warning' | 'default' => {
  if (s === 'published') return 'success';
  if (s === 'draft') return 'warning';
  return 'default';
};

export default function BlogListPage() {
  const router = useRouter();
  const [data, setData] = useState<BlogPostWithJoins[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await blogPosts.getAll();
      setData(result as BlogPostWithJoins[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: BlogPostWithJoins) => {
    try {
      await blogPosts.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
    }
  };

  const columns: Column<BlogPostWithJoins>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (item) => <span className="font-medium">{item.title}</span>,
    },
    {
      key: 'author',
      label: 'Author',
      render: (item) => (
        <span className="text-muted-foreground">{item.authors?.name ?? '—'}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className="text-muted-foreground">{item.blog_categories?.name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <StatusBadge status={item.status} variant={statusVariant(item.status)} />
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
    {
      key: 'is_trending',
      label: 'Trending',
      render: (item) => (
        <StatusBadge
          status={item.is_trending ? 'Yes' : 'No'}
          variant={item.is_trending ? 'warning' : 'default'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        action={
          <Button onClick={() => router.push('/blog/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<BlogPostWithJoins>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/blog/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No blog posts yet. Create your first post to get started."
      />
    </div>
  );
}
