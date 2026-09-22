// AVISO: este script depende de uma RPC 'exec_sql' que executaria SQL
// arbitrário via supabase.rpc(). Essa função NÃO existe no banco atual
// (confirmado em auditoria) — o script está quebrado/obsoleto. Ele fica
// registrado aqui só como referência de debug; NUNCA crie uma RPC
// genérica de "exec_sql" exposta ao role anon, pois isso equivaleria a
// SQL injection/RCE no banco a partir do client público.
import { createSupabaseClientFromEnv } from './_env.mjs';

const supabase = await createSupabaseClientFromEnv();

async function run() {
  const sql = `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'agenda';
  `;
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  console.log('agenda:', data, error);
}
run();
