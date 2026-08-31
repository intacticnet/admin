'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { clients } from '@/lib/admin/api';
import type { Client, ClientStatus } from '@/lib/admin/types';

const clientStatusVariant: Record<ClientStatus, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  lead: 'warning',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ClientsListPage() {
  const router = useRouter();
  const [data, setData] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await clients.getAll();
      setData(result as Client[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let items = data;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          c.contact_person.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      items = items.filter((c) => c.status === statusFilter);
    }
    setFiltered(items);
  }, [data, search, statusFilter]);

  const handleDelete = async (item: Client) => {
    try {
      await clients.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  const columns: Column<Client>[] = [
    {
      key: 'company_name',
      label: 'Company',
      render: (item) => <span className="font-medium">{item.company_name}</span>,
    },
    {
      key: 'contact_person',
      label: 'Contact',
      render: (item) => <span className="text-muted-foreground">{item.contact_person}</span>,
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <StatusBadge
          status={item.status}
          variant={clientStatusVariant[item.status] || 'default'}
        />
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (item) => <span className="text-muted-foreground">{formatDate(item.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        action={
          <Button onClick={() => router.push('/clients/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<Client>
        columns={columns}
        data={filtered}
        onEdit={(item) => router.push(`/clients/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No clients yet. Create your first client to get started."
      />
    </div>
  );
}
