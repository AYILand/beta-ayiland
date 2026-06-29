import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

let browserClient: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return browserClient;
}

export function supabaseServer(): SupabaseClient {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY missing");
  return createClient(SUPABASE_URL, secret, {
    auth: { persistSession: false },
  });
}

export const supabaseConfigured = !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
