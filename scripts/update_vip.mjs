import fs from 'fs';
import path from 'path';

const appTsxPath = path.join('src', 'App.tsx');
let appContent = fs.readFileSync(appTsxPath, 'utf8');
appContent = appContent.replace('import { useState, useEffect, createContext, useContext } from "react";', 'import { useState, useEffect } from "react";');
fs.writeFileSync(appTsxPath, appContent);

const vipTsxPath = path.join('src', 'pages', 'Vip.tsx');
let content = fs.readFileSync(vipTsxPath, 'utf8');

// Import useTenant
content = content.replace(
  "import { ptBR } from 'date-fns/locale';",
  "import { ptBR } from 'date-fns/locale';\nimport { useTenant } from '../contexts/TenantContext';"
);

// Get tenant inside Vip
content = content.replace(
  "export function Vip() {",
  "export function Vip() {\n  const { tenant } = useTenant();"
);

// Fix fetchClienteData
content = content.replace(
  "const { data: cData, error: cErr } = await supabase\n        .from('clientes')\n        .select('*')\n        .eq('id', id)\n        .single();",
  "const { data: cData, error: cErr } = await supabase\n        .from('clientes')\n        .select('*')\n        .eq('id', id)\n        .eq('barbearia_id', tenant?.id)\n        .single();"
);

content = content.replace(
  ".eq('cliente_id', id)\n        .eq('status', 'ativo')",
  ".eq('cliente_id', id)\n        .eq('status', 'ativo')\n        .eq('barbearia_id', tenant?.id)"
);

content = content.replace(
  ".eq('cliente_id', id)\n        .order('data', { ascending: false })",
  ".eq('cliente_id', id)\n        .eq('barbearia_id', tenant?.id)\n        .order('data', { ascending: false })"
);

// Fix useEffect dependencies
content = content.replace(
  "checkSession();\n    };\n    load();\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);",
  "if (tenant?.id) checkSession();\n    };\n    load();\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [tenant?.id]);"
);

// Fix handleLogin
content = content.replace(
  ".eq('telefone', telefone)\n        .limit(1);",
  ".eq('telefone', telefone)\n        .eq('barbearia_id', tenant?.id)\n        .limit(1);"
);

content = content.replace(
  "insert([{ nome, telefone, pontos_fidelidade: 0 }])",
  "insert([{ barbearia_id: tenant?.id, nome, telefone, pontos_fidelidade: 0 }])"
);

content = content.replace(
  "window.location.href = '/agendar'",
  "window.location.href = `/${tenant?.slug}/agendar`"
);

fs.writeFileSync(vipTsxPath, content);
console.log('Vip.tsx updated!');
