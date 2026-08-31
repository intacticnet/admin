import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin/auth';

/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data file upload, validates it (image only, ≤5 MB),
 * uploads to the public Supabase Storage bucket "content-images", and returns
 * the resulting public URL.
 *
 * Auth: requires an authenticated user with the 'admin' role.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const BUCKET = 'content-images';

export async function POST(request: NextRequest) {
  /* ── Auth gate ─────────────────────────────────────────────────── */
  const { response } = await verifyAdmin();
  if (response) return response;

  /* ── Parse multipart ───────────────────────────────────────────── */
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  /* ── Validate file type ────────────────────────────────────────── */
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Invalid file type "${file.type}". Only JPEG, PNG, GIF, and WebP images are allowed.`,
      },
      { status: 400 },
    );
  }

  /* ── Validate file size ────────────────────────────────────────── */
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`,
      },
      { status: 400 },
    );
  }

  /* ── Upload to Supabase Storage ────────────────────────────────── */
  // Build a unique path: {year}/{month}/{timestamp}-{sanitizedName}
  const ext = file.name.split('.').pop() ?? 'bin';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const now = new Date();
  const storagePath = [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
    `${now.getTime()}-${safeName}`,
  ].join('/');

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Use the service-role client for storage upload (bypasses RLS for admin)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Storage is not configured (missing Supabase credentials).' },
      { status: 500 },
    );
  }

  // Import dynamically to avoid bundling the client on every request
  const { createClient: createServiceClient } = await import('@supabase/supabase-js');
  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { error: uploadError } = await serviceClient.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 },
    );
  }

  /* ── Return public URL ─────────────────────────────────────────── */
  const {
    data: { publicUrl },
  } = serviceClient.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
