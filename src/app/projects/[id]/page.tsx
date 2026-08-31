'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/PageHeader';
import { projects, milestones, clients, invoices as invoicesApi } from '@/lib/admin/api';
import type { Project, ProjectStatus, ProjectMilestone, MilestoneStatus, Client, Invoice } from '@/lib/admin/types';

interface ProjectWithClient extends Project {
  clients?: { id: string; company_name: string } | null;
}

const emptyMilestone = (): ProjectMilestone => ({
  id: '',
  project_id: '',
  title: '',
  description: '',
  status: 'pending',
  due_date: '',
  sort_order: 0,
  created_at: '',
});

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [milestonesList, setMilestonesList] = useState<ProjectMilestone[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [relatedInvoices, setRelatedInvoices] = useState<Invoice[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    Promise.all([
      projects.getById(id),
      clients.getAll(),
      milestones.getAll(id),
    ]).then(([proj, clnts, ms]) => {
      const p = proj as ProjectWithClient;
      setProject(p);
      setTitle(p.title);
      setClientId(p.client_id);
      setDescription(p.description || '');
      setStatus(p.status);
      setProgress(p.progress);
      setStartDate(p.start_date?.split('T')[0] || '');
      setDeadline(p.deadline?.split('T')[0] || '');
      setBudget(p.budget?.toString() || '');
      setAllClients(clnts as Client[]);
      setMilestonesList((ms as ProjectMilestone[]).length > 0 ? (ms as ProjectMilestone[]) : []);
    }).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load project')).finally(() => setLoading(false));

    invoicesApi.getAll().then((all) => {
      setRelatedInvoices((all as any[]).filter((inv: any) => inv.project_id === id));
    }).catch(() => {});
  }, [id]);

  const handleSaveProject = async () => {
    setSaving(true);
    setError('');
    try {
      await projects.update(id, {
        title,
        client_id: clientId,
        description: description || null,
        status,
        progress,
        start_date: startDate || null,
        deadline: deadline || null,
        budget: budget ? parseFloat(budget) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMilestones = async () => {
    setSaving(true);
    setError('');
    try {
      const clean = milestonesList.map((m, i) => ({ ...m, sort_order: i }));
      const result = await milestones.bulkUpsert(id, clean);
      setMilestonesList(result as ProjectMilestone[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save milestones');
    } finally {
      setSaving(false);
    }
  };

  const addMilestone = () => {
    setMilestonesList([...milestonesList, { ...emptyMilestone(), project_id: id, sort_order: milestonesList.length }]);
  };

  const removeMilestone = (index: number) => {
    setMilestonesList(milestonesList.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...milestonesList];
    (updated[index] as any)[field] = value;
    setMilestonesList(updated);
  };

  const moveMilestone = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= milestonesList.length) return;
    const updated = [...milestonesList];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setMilestonesList(updated);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Project" />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Project" action={<Button variant="outline" size="sm" asChild><Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>} />
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Project"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Project Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="client"><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {allClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Progress: {progress}%</Label>
            <Slider value={[progress]} onValueChange={([v]) => setProgress(v)} max={100} step={5} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProject} disabled={saving || !title || !clientId}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Milestones</CardTitle>
          <Button variant="outline" size="sm" onClick={addMilestone}>
            <Plus className="mr-2 h-3.5 w-3.5" />Add Milestone
          </Button>
        </CardHeader>
        <CardContent>
          {milestonesList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No milestones yet. Add one to track progress.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {milestonesList.map((ms, index) => (
                <div key={ms.id || index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input value={ms.title} onChange={(e) => updateMilestone(index, 'title', e.target.value)} placeholder="Milestone title" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Status</Label>
                          <Select value={ms.status} onValueChange={(v) => updateMilestone(index, 'status', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Due Date</Label>
                          <Input type="date" value={ms.due_date?.split('T')[0] || ''} onChange={(e) => updateMilestone(index, 'due_date', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveMilestone(index, 'up')} disabled={index === 0}>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveMilestone(index, 'down')} disabled={index === milestonesList.length - 1}>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeMilestone(index)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {milestonesList.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveMilestones} disabled={saving}>
                {saving ? 'Saving...' : 'Save Milestones'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Invoices */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Related Invoices ({relatedInvoices.length})</CardTitle></CardHeader>
        <CardContent>
          {relatedInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices for this project yet.</p>
          ) : (
            <div className="divide-y">
              {relatedInvoices.slice(0, 5).map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between py-2 hover:bg-muted/50 px-2 rounded -mx-2">
                  <span className="text-sm font-medium">{inv.invoice_number}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">${inv.total.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground capitalize">{inv.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
