'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/PageHeader';
import { clients, projects as projectsApi, invoices as invoicesApi } from '@/lib/admin/api';
import type { Client, ClientStatus, Project, Invoice } from '@/lib/admin/types';

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [relatedInvoices, setRelatedInvoices] = useState<Invoice[]>([]);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    clients
      .getById(id)
      .then((data) => {
        const c = data as Client;
        setClient(c);
        setCompanyName(c.company_name);
        setContactPerson(c.contact_person);
        setEmail(c.email);
        setPhone(c.phone || '');
        setStatus(c.status);
        setAddress(c.address || '');
        setNotes(c.notes || '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load client'))
      .finally(() => setLoading(false));

    // Fetch related data
    projectsApi.getAll().then((all) => {
      setRelatedProjects((all as any[]).filter((p: any) => p.client_id === id));
    }).catch(() => {});

    invoicesApi.getAll().then((all) => {
      setRelatedInvoices((all as any[]).filter((inv: any) => inv.client_id === id));
    }).catch(() => {});
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await clients.update(id, {
        company_name: companyName,
        contact_person: contactPerson,
        email,
        phone: phone || null,
        status,
        address: address || null,
        notes: notes || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Client" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Client"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/clients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Client"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input id="company_name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input id="contact_person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || !companyName || !contactPerson || !email}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Related Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Projects ({relatedProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects for this client yet.</p>
          ) : (
            <div className="divide-y">
              {relatedProjects.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between py-2 hover:bg-muted/50 px-2 rounded -mx-2"
                >
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">{p.status.replace('_', ' ')}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Related Invoices ({relatedInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices for this client yet.</p>
          ) : (
            <div className="divide-y">
              {relatedInvoices.slice(0, 5).map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between py-2 hover:bg-muted/50 px-2 rounded -mx-2"
                >
                  <span className="text-sm font-medium">{inv.invoice_number}</span>
                  <span className="text-xs text-muted-foreground capitalize">{inv.status}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
