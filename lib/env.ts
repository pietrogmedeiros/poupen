// Centralizar validação de variáveis de ambiente
export const getEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const cronSecret = process.env.CRON_SECRET;

  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!geminiKey) {
    console.error('Missing GEMINI_API_KEY');
  }

  return {
    supabaseUrl: supabaseUrl || '',
    supabaseKey: supabaseKey || '',
    geminiKey: geminiKey || '',
    cronSecret: cronSecret || '',
    isConfigured: !!(supabaseUrl && supabaseKey && geminiKey),
  };
};

export const createSupabaseServer = () => {
  const { supabaseUrl, supabaseKey } = getEnv();
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseKey);
};
