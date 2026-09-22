// AVISO: script histórico de correção pontual (fix de um registro de
// cliente duplicado), com IDs e telefone reais gravados no código.
// Já foi executado em produção; mantido aqui só como registro do que
// foi feito. Não deve ser rodado novamente e é um bom candidato a
// remoção/expurgo do histórico do git (contém PII de cliente).
import { createSupabaseClientFromEnv } from './_env.mjs';

const supabase = await createSupabaseClientFromEnv();

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
