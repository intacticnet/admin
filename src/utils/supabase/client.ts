import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // During prerendering, return a no-op dummy client to avoid build failures
    return null as any;
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};
