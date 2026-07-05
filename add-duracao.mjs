

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lursrpxvzrynibdpezme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cnNycHh2enJ5bmliZHBlem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzI5NDQsImV4cCI6MjA5NjEwODk0NH0.6Taso0ye8Bnl8ixDGTeuUrx9kj2bi61iqXxGFdCtuqg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('🔧 FASE 1 — Migrando tabela "servicos" no Supabase...\n');

  // 1. Buscar todos os serviços cadastrados
  const { data: servicos, error: fetchError } = await supabase
    .from('servicos')
    .select('id, nome, ativo');

  if (fetchError) {
    console.error('❌ Erro ao buscar serviços:', fetchError.message);
    process.exit(1);
  }

  console.log(`📋 ${servicos.length} serviço(s) encontrado(s):\n`);

  // 2. Definir duração para cada serviço baseado no nome
  const atualizacoes = servicos.map(s => {
    const nome = s.nome.toUpperCase();
    let duracao = 30; // padrão: cortes simples

    if (nome.includes('PLATINADO') || nome.includes('PIGMENT')) {
      duracao = 60;
    } else if (
      nome.includes('SOBRANCELHA') ||
      nome.includes('BARBOTERAPIA') ||
      nome.includes('BARBA') ||
      nome.includes('COMBO')
    ) {
      duracao = 45;
    }

    console.log(`  ${s.nome.padEnd(45)} → ${duracao} min`);
    return { id: s.id, duracao_min: duracao };
  });

  console.log('\n⏳ Atualizando durações no banco...\n');

  // 3. Atualizar cada serviço com sua duração
  let erros = 0;
  let sucessos = 0;

  for (const s of atualizacoes) {
    const { error } = await supabase
      .from('servicos')
      .update({ duracao_min: s.duracao_min })
      .eq('id', s.id);

    if (error) {
      console.error(`  ❌ Erro ao atualizar ID ${s.id}:`, error.message);
      erros++;
    } else {
      sucessos++;
    }
  }

  console.log(`\n📊 Resultado: ${sucessos} atualizados com sucesso, ${erros} erro(s).`);

  if (erros > 0) {
    console.log('\n⚠️  ATENÇÃO: Alguns registros falharam.');
    console.log('   Isso indica que a coluna "duracao_min" ainda NAO existe na tabela.');
    console.log('   Adicione a coluna manualmente no painel do Supabase:');
    console.log('   Tabela: servicos | Coluna: duracao_min | Tipo: int4 | Default: 30');
    console.log('   Depois execute este script novamente.\n');
    process.exit(1);
  }

  // 4. DIAGNÓSTICO FINAL
  console.log('\n✅ Atualização concluída! Rodando diagnóstico...\n');
  console.log('═'.repeat(60));
  console.log('DIAGNÓSTICO — Tabela servicos (ordenado por duração)');
  console.log('═'.repeat(60));

  const { data: diagnostico, error: diagError } = await supabase
    .from('servicos')
    .select('id, nome, duracao_min, ativo')
    .order('duracao_min')
    .order('nome');

  if (diagError) {
    console.error('❌ Erro no diagnóstico:', diagError.message);
    process.exit(1);
  }

  let tudo_ok = true;
  for (const s of diagnostico) {
    const status = s.duracao_min ? '✅' : '❌';
    if (!s.duracao_min) tudo_ok = false;
    console.log(`  ${status} ${s.nome.padEnd(45)} ${s.duracao_min ?? '---'} min  [ativo: ${s.ativo}]`);
  }

  console.log('═'.repeat(60));
  if (tudo_ok) {
    console.log('\n🎉 FASE 1 CONCLUÍDA COM SUCESSO!');
    console.log('   Todos os serviços estão com duracao_min configurado.');
    console.log('   Aguardando aprovação para iniciar a FASE 2.\n');
  } else {
    console.log('\n⚠️  Alguns serviços estão sem duracao_min. Verifique acima.\n');
  }
}

run();
