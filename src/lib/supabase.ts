import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Creates a fresh Supabase client on every call.
// No caching — guarantees env vars are read at call time, not module load time.
// This is critical for Next.js Server Components where module-level code
// may execute before environment variables are available.
export function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn('[Service Serigraphie] Failed to initialize Supabase client:', e)
    return null;
  }
}

// Backward-compatible export for client components (they run in browser where env vars are always available)
export const supabase = getSupabase() as SupabaseClient;
