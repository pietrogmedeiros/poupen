import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization - valida apenas se usado
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function initializeSupabase() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const supabase = new Proxy(
  {},
  {
    get: (_, prop) => {
      const instance = initializeSupabase();
      return (instance as any)[prop];
    }
  }
) as ReturnType<typeof createClient>;

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt_url?: string;
  created_at: string;
};
