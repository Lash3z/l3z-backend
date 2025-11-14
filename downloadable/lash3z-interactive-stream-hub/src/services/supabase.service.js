import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let client = null;

export function getSupabaseClient() {
  if (client) return client;
  if (!config.supabase.url || !config.supabase.key) {
    return null;
  }
  client = createClient(config.supabase.url, config.supabase.key, {
    auth: {
      persistSession: false
    }
  });
  return client;
}
