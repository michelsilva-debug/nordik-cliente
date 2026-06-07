import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://lursrpxvzrynibdpezme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cnNycHh2enJ5bmliZHBlem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzI5NDQsImV4cCI6MjA5NjEwODk0NH0.6Taso0ye8Bnl8ixDGTeuUrx9kj2bi61iqXxGFdCtuqg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixData() {
  // 1. Mover agendamento do Michel duplicado para o Michel original
  await supabase.from('agenda').update({ cliente_id: 'b4a0ba02-8610-4606-ab54-413b2d7b1816' }).eq('id', 'fbe6bdac-1d14-47d8-b79c-9ad413b663da');
  
  // 2. Excluir o Michel duplicado
  await supabase.from('clientes').delete().eq('id', 'a66f0dc4-4078-4bd1-818f-933d023060ab');
  
  // 3. Atualizar o telefone do Michel original para o padrão sem espaço duplo
  await supabase.from('clientes').update({ telefone: '(66) 99620-0180' }).eq('id', 'b4a0ba02-8610-4606-ab54-413b2d7b1816');
  
  console.log('Correção finalizada!');
}
fixData();
