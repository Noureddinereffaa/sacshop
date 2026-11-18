import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

// Sanitize the URL and Key to prevent "Invalid Compact JWS" if there are spaces or quotes
function sanitizeEnv(v: string | undefined): string | undefined {
  return v?.trim().replace(/['"]/g, "");
}

function resolveCredentials() {
  const url = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = sanitizeEnv(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
  return { url, key };
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const { url, key } = resolveCredentials();
    if (!url || !key) {
      throw new Error("Supabase environment variables are not configured");
    }
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

// Same singleton, but returns null instead of throwing when Supabase is not configured
export function getSupabaseAdminSafe(): SupabaseClient | null {
  if (!supabaseAdmin) {
    const { url, key } = resolveCredentials();
    if (!url || !key) return null;
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}
