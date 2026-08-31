'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { projects } from '@/lib/admin/api';
import type { Project, ProjectStatus } from '@/lib/admin/types';

interface ProjectWithClient {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  start_date: string | null;
  deadline: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
  clients?: { id: string; company_name: string } | null;
}

const projectStatusVariant: Record<string, 'success' | 'default' | 'warning' | 'danger'> = {
  active: 'success',
  completed: 'success',
  planning: 'default',
  on_hold: 'warning',
  cancelled: 'danger',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectsListPage() {
  const router = useRouter();
  const [data, setData] = useState<ProjectWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await projects.getAll();
      setData(result as ProjectWithClient[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: ProjectWithClient) => {
    try {
      await projects.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const columns: Column<ProjectWithClient>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (item) => <span className="font-medium">{item.title}</span>,
    },
    {
      key: 'client',
      label: 'Client',
      render: (item) => (
        <span className="text-muted-foreground">{item.clients?.company_name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <StatusBadge
          status={item.status.replace('_', ' ')}
          variant={projectStatusVariant[item.status] || 'default'}
        />
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (item) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress value={item.progress} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground w-8 text-right">{item.progress}%</span>
        </div>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (item) => <span className="text-muted-foreground">{formatDate(item.deadline)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        action={
          <Button onClick={() => router.push('/projects/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<ProjectWithClient>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/projects/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No projects yet. Create your first project to get started."
      />
    </div>
  );
}
