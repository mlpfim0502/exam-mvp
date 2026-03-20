// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — only created when first accessed (avoids SSR/build-time errors
// when env vars are not present in the build environment).
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local'
      );
    }
    _client = createClient(url, key);
  }
  return _client;
}

// Proxy: every property access is forwarded to the lazy client.
// This preserves the `supabase.from(...)` call syntax used throughout the app.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
