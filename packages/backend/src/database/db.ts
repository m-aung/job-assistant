import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { LocalDB } from './local-db';

config();
let localDb: LocalDB | null = null;
let useLocalDb = true;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  // seed local db for local dev
  localDb = new LocalDB();
} else {
  useLocalDb = false;
}

const supabase = createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_ANON_KEY ?? '');

export { supabase, localDb, useLocalDb };

// Simple file-based storage
// For production, consider using a real database like Supabase, PostgreSQL, etc.
