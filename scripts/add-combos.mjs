import { createSupabaseClientFromEnv } from './_env.mjs';

const supabase = await createSupabaseClientFromEnv();

async function run() {
  const { data, error } = await supabase.from('servicos').insert([
    { nome: 'CABELO E BARBA', nome_nordik: 'COMBO 1', valor: 70, ativo: true },
    { nome: 'CABELO, BARBA E SOBRANCELHA', nome_nordik: 'COMBO 2', valor: 80, ativo: true }
  ]);
  if (error) {
    console.error('Erro ao adicionar combos:', error);
  } else {
    console.log('Combos adicionados com sucesso!');
  }
}
run();
