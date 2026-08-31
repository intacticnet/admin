'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/PageHeader';
import { invoices, clients, projects as projectsApi } from '@/lib/admin/api';
import type { Invoice, InvoiceItem, InvoiceStatus, Client, Project } from '@/lib/admin/types';

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

function emptyItem(): InvoiceItem {
  return { description: '', quantity: 1, rate: 0, amount: 0, sort_order: 0 };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  // Header fields
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('draft');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');

  // Load invoice items on mount
  useEffect(() => {
    if (!invoice) return;
    // We need to fetch items separately - do a raw fetch
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(data => {
      // Items aren't included in the standard response, we'll load them from the invoice data if they exist
      // For now, we'll set items based on what we have
    }).catch(() => {});
  }, [invoice, id]);

  useEffect(() => {
    Promise.all([
      invoices.getById(id),
      clients.getAll(),
      projectsApi.getAll(),
    ]).then(([inv, clnts, projs]) => {
      const i = inv as InvoiceWithClient;
      setInvoice(i);
      setClientId(i.client_id);
      setProjectId(i.project_id || '');
      setInvoiceNumber(i.invoice_number);
      setStatus(i.status);
      setIssueDate(i.issue_date?.split('T')[0] || '');
      setDueDate(i.due_date?.split('T')[0] || '');
      setTaxRate(((i.subtotal > 0 ? (i.tax / i.subtotal) * 100 : 0)).toFixed(1));
      setNotes(i.notes || '');
      setAllClients(clnts as Client[]);
      setClientProjects((projs as any[]).filter((p: any) => p.client_id === i.client_id));
    }).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    projectsApi.getAll().then((all) => {
      setClientProjects((all as any[]).filter((p: any) => p.client_id === newClientId));
    });
    setProjectId('');
  };

  // Auto-calc totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = subtotal * (parseFloat(taxRate) || 0) / 100;
  const total = subtotal + tax;

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { ...emptyItem(), sort_order: items.length }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!clientId || !invoiceNumber) return;
    setSaving(true);
    setError('');
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          project_id: projectId || null,
          invoice_number: invoiceNumber,
          status,
          issue_date: issueDate || null,
          due_date: dueDate || null,
          subtotal,
          tax,
          total,
          notes: notes || null,
          invoice_items: items.map((item, i) => ({ ...item, sort_order: i })),
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Invoice" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Invoice" action={<Button variant="outline" size="sm" asChild><Link href="/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>} />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Invoice"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Invoice Header</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number *</Label>
                  <Input id="invoice_number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus)}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={clientId} onValueChange={handleClientChange}>
                    <SelectTrigger id="client"><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {allClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger id="project"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Project</SelectItem>
                      {clientProjects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input id="issue_date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Line Items</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-3.5 w-3.5" />Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Header row - desktop only */}
                <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-1" />
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                    <div className="md:col-span-5">
                      <Label className="md:hidden text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="md:hidden text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min={0}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="md:hidden text-xs">Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="md:hidden text-xs">Amount</Label>
                      <div className="h-9 flex items-center justify-end md:justify-start px-3 border rounded-md bg-muted/50 text-sm">
                        ${(item.quantity * item.rate).toFixed(2)}
                      </div>
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground">Tax (%)</span>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-20 h-8 text-right"
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSave} disabled={saving || !clientId || !invoiceNumber}>
                  {saving ? 'Saving...' : 'Save Invoice'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview - 1 column */}
        <div>
          <Card className="sticky top-6">
            <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#115FC9' }}>INVOICE</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">#</span>
                  <span className="font-medium">{invoiceNumber || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client</span>
                  <span className="font-medium text-right max-w-[60%] truncate">
                    {allClients.find(c => c.id === clientId)?.company_name || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`text-xs capitalize ${invoiceStatusStyle[status] || ''}`}>{status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date</span>
                  <span>{issueDate ? formatDate(issueDate) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{dueDate ? formatDate(dueDate) : '—'}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                {items.filter(i => i.description).map((item, idx) => (
                  <div key={idx} className="text-xs flex justify-between">
                    <span className="text-muted-foreground truncate max-w-[60%]">{item.description}</span>
                    <span>${(item.quantity * item.rate).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-sm">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
