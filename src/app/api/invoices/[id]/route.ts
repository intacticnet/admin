import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';
import { serverError, notFound, sanitizeBody } from '@/lib/admin/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id } = await params;

  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(id, company_name)')
    .eq('id', id)
    .single();

  if (error) return notFound();
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id } = await params;
  const body = sanitizeBody(await request.json());

  const { invoice_items, ...invoiceData } = body as Record<string, unknown>;

  const { data, error } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id)
    .select('*, clients(id, company_name)')
    .single();

  if (error) return serverError();

  // Handle invoice items - delete and re-insert
  if (invoice_items !== undefined) {
    await supabase.from('invoice_items').delete().eq('invoice_id', id);

    if (Array.isArray(invoice_items) && invoice_items.length > 0) {
      const items = invoice_items.map((item: Record<string, unknown>, i: number) => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        sort_order: i,
      }));

      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert(items);

      if (itemError) return serverError();
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, response } = await verifyAdmin();
  if (response) return response;

  const { id } = await params;

  // Delete invoice items first
  await supabase.from('invoice_items').delete().eq('invoice_id', id);

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) return serverError();
  return NextResponse.json({ success: true });
}
