// Centralizar validação de variáveis de ambiente
// Lazy evaluation - não valida durante build, apenas em runtime
export const getEnv = () => {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    cronSecret: process.env.CRON_SECRET || '',
  };
};

export const validateEnv = (required: string[]) => {
  const env = getEnv();
  const missing: string[] = [];

  if (required.includes('supabase') && (!env.supabaseUrl || !env.supabaseKey)) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY');
  }
  if (required.includes('gemini') && !env.geminiKey) {
    missing.push('GEMINI_API_KEY');
  }
  if (required.includes('cron') && !env.cronSecret) {
    missing.push('CRON_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return env;
};

export const createSupabaseServer = () => {
  const { supabaseUrl, supabaseKey } = validateEnv(['supabase']);
  
  const { createClient } = require('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseKey);
};
