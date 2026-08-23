import fs from 'fs';
import path from 'path';

const agendamentoTsxPath = path.join('src', 'pages', 'Agendamento.tsx');
let content = fs.readFileSync(agendamentoTsxPath, 'utf8');

// Import useTenant
content = content.replace(
  "import { ptBR } from 'date-fns/locale';",
  "import { ptBR } from 'date-fns/locale';\nimport { useTenant } from '../contexts/TenantContext';"
);

// Get tenant inside Agendamento
content = content.replace(
  "export function Agendamento() {",
  "export function Agendamento() {\n  const { tenant } = useTenant();"
);

// Fix fetchIniciais
content = content.replace(
  "const { data: bData } = await supabase.from('barbeiros').select('id, nome').order('nome');",
  "const { data: bData } = await supabase.from('barbeiros').select('id, nome').eq('barbearia_id', tenant?.id).order('nome');"
);

content = content.replace(
  "const { data: sData, error: sErr } = await supabase.from('servicos').select('id, nome, nome_nordik, valor, duracao_min, exclusivo_pm').eq('ativo', true).order('nome');",
  "const { data: sData, error: sErr } = await supabase.from('servicos').select('id, nome, nome_nordik, valor, duracao_min, exclusivo_pm').eq('ativo', true).eq('barbearia_id', tenant?.id).order('nome');"
);

// Fix PM Verificacao (adiciona barbearia_id na query)
content = content.replace(
  "const { data: pmData } = await supabase.from('clientes').select('pm_status').eq('telefone', savedPmPhone).limit(1);",
  "const { data: pmData } = await supabase.from('clientes').select('pm_status').eq('telefone', savedPmPhone).eq('barbearia_id', tenant?.id).limit(1);"
);

// Fix useEffect dependencies
content = content.replace(
  "fetchIniciais();\n  }, []);",
  "if (tenant?.id) fetchIniciais();\n  }, [tenant?.id]);"
);

// Fix agenda fetch
content = content.replace(
  ".eq('data', dataStr);",
  ".eq('data', dataStr)\n        .eq('barbearia_id', tenant?.id);"
);

// Fix PM Submit
content = content.replace(
  ".eq('telefone', pmTelefone).limit(1);",
  ".eq('telefone', pmTelefone).eq('barbearia_id', tenant?.id).limit(1);"
);

content = content.replace(
  "insert([{ telefone: pmTelefone, nome: 'PM ' + pmMatricula, pm_matricula: pmMatricula, pm_status: 'pendente', pontos_fidelidade: 0 }]);",
  "insert([{ barbearia_id: tenant?.id, telefone: pmTelefone, nome: 'PM ' + pmMatricula, pm_matricula: pmMatricula, pm_status: 'pendente', pontos_fidelidade: 0 }]);"
);

// Fix Confirmar Agendamento (Clientes e Agenda)
content = content.replace(
  ".eq('telefone', clienteTelefone)\n        .limit(1);",
  ".eq('telefone', clienteTelefone)\n        .eq('barbearia_id', tenant?.id)\n        .limit(1);"
);

content = content.replace(
  "insert([{ nome: clienteNome, telefone: clienteTelefone }])",
  "insert([{ barbearia_id: tenant?.id, nome: clienteNome, telefone: clienteTelefone }])"
);

content = content.replace(
  "data: dataStr,\n          horario: horaSelecionada,",
  "barbearia_id: tenant?.id,\n          data: dataStr,\n          horario: horaSelecionada,"
);

fs.writeFileSync(agendamentoTsxPath, content);
console.log('Agendamento.tsx updated!');
