import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2].replace('\r', '');
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: barbearia } = await supabase.from('barbearias').select('id').limit(1);
  const barbearia_id = barbearia?.[0]?.id;
  
  if (!barbearia_id) {
    console.error("No barbearia found");
    return;
  }

  const payload = {
    p_telefone: '(66) 99620-0180',
    p_nome: 'michel silva',
    p_barbearia_id: barbearia_id
  };

  console.log("Testing rpc_login_vip with:", payload);

  const { data, error } = await supabase.rpc('rpc_login_vip', payload);
  console.log('Login VIP Result:', data);
  if (error) console.error('Login VIP Error:', error);

  if (data) {
    console.log("Testing rpc_get_vip_data for id:", data);
    const { data: vipData, error: vipError } = await supabase.rpc('rpc_get_vip_data', {
      p_cliente_id: data,
      p_barbearia_id: barbearia_id
    });
    console.log('Get VIP Data Result:', JSON.stringify(vipData, null, 2));
    if (vipError) console.error('Get VIP Data Error:', vipError);
  }
}

test();
