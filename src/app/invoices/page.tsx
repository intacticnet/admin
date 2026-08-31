'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { invoices } from '@/lib/admin/api';
import type { Invoice, InvoiceStatus } from '@/lib/admin/types';

interface InvoiceWithClient extends Invoice {
  clients?: { id: string; company_name: string } | null;
}

const invoiceStatusStyle: Record<InvoiceStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  sent: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InvoicesListPage() {
  const router = useRouter();
  const [data, setData] = useState<InvoiceWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await invoices.getAll();
      setData(result as InvoiceWithClient[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (item: InvoiceWithClient) => {
    try {
      await invoices.delete(item.id);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  const columns: Column<InvoiceWithClient>[] = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (item) => <span className="font-medium">{item.invoice_number}</span>,
    },
    {
      key: 'client',
      label: 'Client',
      render: (item) => (
        <span className="text-muted-foreground">{item.clients?.company_name ?? '—'}</span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (item) => <span className="font-medium">${item.total.toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant="outline" className={`text-xs capitalize ${invoiceStatusStyle[item.status] || ''}`}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      render: (item) => <span className="text-muted-foreground">{formatDate(item.issue_date)}</span>,
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (item) => <span className="text-muted-foreground">{formatDate(item.due_date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        action={
          <Button onClick={() => router.push('/invoices/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable<InvoiceWithClient>
        columns={columns}
        data={data}
        onEdit={(item) => router.push(`/invoices/${item.id}`)}
        onDelete={handleDelete}
        isLoading={isLoading}
        emptyMessage="No invoices yet. Create your first invoice to get started."
      />
    </div>
  );
}
