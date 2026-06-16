import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://lursrpxvzrynibdpezme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cnNycHh2enJ5bmliZHBlem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzI5NDQsImV4cCI6MjA5NjEwODk0NH0.6Taso0ye8Bnl8ixDGTeuUrx9kj2bi61iqXxGFdCtuqg';
const supabase = createClient(supabaseUrl, supabaseKey);

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
