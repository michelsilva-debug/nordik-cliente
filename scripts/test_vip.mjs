import { createSupabaseClientFromEnv } from './_env.mjs';

const supabase = await createSupabaseClientFromEnv();

async function test() {
  const { data: barbearia } = await supabase.from('barbearias').select('id').limit(1);
  const barbearia_id = barbearia?.[0]?.id;
  
  if (!barbearia_id) {
    console.error("No barbearia found");
    return;
  }

  const payload = {
    p_telefone: '(00) 00000-0000',
    p_nome: 'Cliente Teste',
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
