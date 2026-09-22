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

  const { data: barbeiro } = await supabase.from('barbeiros').select('id').eq('barbearia_id', barbearia_id).limit(1);
  const barbeiro_id = barbeiro?.[0]?.id;
  
  const { data: servico } = await supabase.from('servicos').select('id, nome, valor').eq('barbearia_id', barbearia_id).limit(1);
  const servico_id = servico?.[0]?.id;

  const carrinhoParaBanco = servico ? [{
    id: servico[0].id,
    nome: servico[0].nome,
    valor: servico[0].valor
  }] : [];

  const payload = {
    p_barbearia_id: barbearia_id,
    p_data: '2026-08-24',
    p_horario: '09:00',
    p_nome: 'michel silva',
    p_telefone: '(66) 99620-0180',
    p_barbeiro_id: barbeiro_id || null,
    p_servico_id: servico_id || null,
    p_carrinho_json: carrinhoParaBanco
  };

  console.log("Sending payload:", JSON.stringify(payload, null, 2));

  const { data, error } = await supabase.rpc('rpc_criar_agendamento', payload);
  console.log('Result:', data);
  if (error) console.error('Full Error:', JSON.stringify(error, null, 2));
}

test();
