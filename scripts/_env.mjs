import fs from 'fs';
import path from 'path';

/**
 * Lê o .env da raiz do projeto (sem depender de nenhuma lib externa) e
 * devolve as variáveis como um objeto. Usado pelos scripts utilitários
 * desta pasta para não precisar de chaves/URLs do Supabase hardcoded
 * no código-fonte.
 */
export function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2].replace('\r', '');
    }
  });
  return envVars;
}

/**
 * Cria um client Supabase a partir das variáveis do .env
 * (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY), lançando um erro
 * explícito se alguma estiver faltando.
 */
export async function createSupabaseClientFromEnv() {
  const { createClient } = await import('@supabase/supabase-js');
  const env = loadEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórios no .env para rodar este script.'
    );
  }
  return createClient(supabaseUrl, supabaseKey);
}
