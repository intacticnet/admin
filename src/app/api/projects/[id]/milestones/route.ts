import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { serverError } from '@/lib/admin/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id } = await params;

  const { data, error } = await supabase
    .from('project_milestones')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true });

  if (error) return serverError();
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id: projectId } = await params;
  const milestones = (await request.json()) as Record<string, unknown>[];

  // Delete existing milestones for this project
  const { error: deleteError } = await supabase
    .from('project_milestones')
    .delete()
    .eq('project_id', projectId);

  if (deleteError) return serverError();

  if (!milestones || milestones.length === 0) {
    return NextResponse.json([]);
  }

  // Insert new milestones with project_id
  const toInsert = milestones.map((m, i) => ({
    project_id: projectId,
    title: (m.title as string) || '',
    description: (m.description as string) || null,
    status: (m.status as string) || 'pending',
    due_date: (m.due_date as string) || null,
    sort_order: i,
  }));

  const { data, error } = await supabase
    .from('project_milestones')
    .insert(toInsert)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return serverError();
  return NextResponse.json(data);
}
