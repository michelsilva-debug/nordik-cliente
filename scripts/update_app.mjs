import fs from 'fs';
import path from 'path';

const appTsxPath = path.join('src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Add TenantProvider import
content = content.replace(
  'import { Agendamento } from "./pages/Agendamento";',
  'import { Agendamento } from "./pages/Agendamento";\nimport { TenantProvider, useTenant } from "./contexts/TenantContext";'
);

// 2. Remove AgendamentoContext since we'll use useTenant
content = content.replace(
  /\/\/ Context para compartilhar o status do agendamento[\s\S]*?export const useAgendamentoStatus = \(\) => useContext\(AgendamentoContext\);/,
  ''
);

// 3. Update Layout
content = content.replace(
  'function Layout({ children }: { children: React.ReactNode }) {',
  'function Layout({ children }: { children: React.ReactNode }) {\n  const { tenant } = useTenant();\n  const logoUrl = tenant?.configuracoes?.logo_url || "/logo.png";\n  const instaUrl = tenant?.configuracoes?.instagram_url || "https://www.instagram.com/invites/contact/?igsh=1k0vumpjjbvi3&utm_content=5rhyht7";'
);

content = content.replace(
  'href="https://www.instagram.com/invites/contact/?igsh=1k0vumpjjbvi3&utm_content=5rhyht7"',
  'href={instaUrl}'
);

content = content.replace(
  '<Link to="/">',
  '<Link to={`/${tenant?.slug || ""}`}>'
);

content = content.replace(
  'src="/logo.png"',
  'src={logoUrl}'
);

content = content.replace(
  '<Link\n          to="/vip"',
  '<Link\n          to={`/${tenant?.slug || ""}/vip`}'
);

content = content.replace(
  /&copy; \{new Date\(\)\.getFullYear\(\)\} NØRDIK BARBERSHOP/,
  '&copy; {new Date().getFullYear()} {tenant?.nome || "NØRDIK BARBERSHOP"}\n          <br />\n          <span className="text-[8px] text-[var(--color-nordik-gold-dim)]">Powered by NØRDIK SYSTEMS</span>'
);

// 4. Update Home
content = content.replace(
  'function Home() {',
  'function Home() {\n  const { tenant } = useTenant();\n  const agendamentoAtivo = tenant?.configuracoes?.agendamento_ativo !== "false";\n  const whatsUrl = tenant?.configuracoes?.whatsapp_url || "https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%21";\n  const mapsUrl = tenant?.configuracoes?.endereco_maps || "https://maps.google.com/?q=R.+Astorga,+244+-+Módulo+05,+Juína+-+MT";\n  const enderecoTexto = tenant?.configuracoes?.endereco_texto || "R. Astorga, 244 - Módulo 05\\nJuína - MT";'
);

// Remove the old agendamentoAtivo and useAgendamentoStatus
content = content.replace(
  'const { ativo: agendamentoAtivo } = useAgendamentoStatus();',
  ''
);

// Fix Home's fetchPlanos to use tenant_id
content = content.replace(
  '.eq("ativo", true)',
  '.eq("ativo", true)\n        .eq("barbearia_id", tenant?.id)'
);
content = content.replace(
  'fetchPlanos();\n  }, []);',
  'if (tenant?.id) fetchPlanos();\n  }, [tenant?.id]);'
);

// Fix Nørdik Barbershop Title in Hero
content = content.replace(
  'Nørdik Barbershop\n          </h1>',
  '{tenant?.nome || "Nørdik Barbershop"}\n          </h1>'
);

// Replace fixed links in Home
content = content.replace(
  'to={agendamentoAtivo ? "/agendar" : "#"}',
  'to={agendamentoAtivo ? `/${tenant?.slug}/agendar` : "#"}'
);

content = content.replace(
  'href="https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%21"',
  'href={whatsUrl}'
);

content = content.replace(
  'href="https://maps.google.com/?q=R.+Astorga,+244+-+Módulo+05,+Juína+-+MT"',
  'href={mapsUrl}'
);

// 4.1 Fix WhatsApp Link in Planos
content = content.replace(
  'const linkWhats = `https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20assinar%20o%20${encodeURIComponent(p.nome)}%20(R%24%20${p.preco})%21`;',
  'const whatsBase = tenant?.configuracoes?.whatsapp_url ? tenant.configuracoes.whatsapp_url.split("?")[0] : "https://wa.me/5566999888986";\n            const linkWhats = `${whatsBase}?text=Ol%C3%A1%2C%20gostaria%20de%20assinar%20o%20${encodeURIComponent(p.nome)}%20(R%24%20${p.preco})%21`;'
);

// 4.2 Fix Location section bottom
content = content.replace(
  'href="https://maps.google.com/?q=R.+Astorga,+244+-+Módulo+05,+Juína+-+MT"',
  'href={mapsUrl}'
);

content = content.replace(
  /R\. Astorga, 244 - Módulo 05\n\s*<\s*br\s*\/>\n\s*Juína - MT/,
  '{enderecoTexto.split("\\n").map((line, i) => <span key={i}>{line}<br /></span>)}'
);

// 4.3 Fix CTA Final links
content = content.replace(
  'to="/agendar"',
  'to={`/${tenant?.slug}/agendar`}'
);

content = content.replace(
  'href="https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%21"',
  'href={whatsUrl}'
);

// 5. Update AgendamentoBloqueado
content = content.replace(
  'function AgendamentoBloqueado() {',
  'function AgendamentoBloqueado() {\n  const { tenant } = useTenant();\n  const whatsUrl = tenant?.configuracoes?.whatsapp_url || "https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%21";'
);
content = content.replace(
  'href="https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%21"',
  'href={whatsUrl}'
);
content = content.replace(
  'to="/"',
  'to={`/${tenant?.slug || ""}`}'
);

// 6. Fix App and Add TenantApp
const oldApp = `function App() {
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(true);
  const [agendamentoLoading, setAgendamentoLoading] = useState(true);

  useEffect(() => {
    async function checkAgendamento() {
      const { data } = await supabase
        .from("configuracoes")
        .select("valor")
        .eq("chave", "agendamento_ativo")
        .limit(1);
      if (data && data.length > 0) {
        setAgendamentoAtivo(data[0].valor === "true");
      }
      setAgendamentoLoading(false);
    }
    checkAgendamento();
  }, []);

  return (
    <AgendamentoContext.Provider
      value={{ ativo: agendamentoAtivo, loading: agendamentoLoading }}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/agendar"
              element={
                agendamentoAtivo ? <Agendamento /> : <AgendamentoBloqueado />
              }
            />
            <Route path="/vip" element={<Vip />} />
          </Routes>
        </Layout>
      </Router>
    </AgendamentoContext.Provider>
  );
}`;

const newApp = `function TenantApp() {
  const { tenant, loading, error } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-[var(--color-nordik-gold)]">
        Carregando barbearia...
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-center p-8 flex-col">
        <h1 className="font-cinzel text-3xl text-[var(--color-nordik-gold)] mb-4">404</h1>
        <p className="uppercase tracking-widest">{error || "Barbearia não encontrada"}</p>
        <p className="mt-8 text-xs text-[var(--color-nordik-gold-dim)]">Powered by NØRDIK SYSTEMS</p>
      </div>
    );
  }

  const agendamentoAtivo = tenant.configuracoes?.agendamento_ativo !== "false";

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/agendar"
          element={
            agendamentoAtivo ? <Agendamento /> : <AgendamentoBloqueado />
          }
        />
        <Route path="/vip" element={<Vip />} />
      </Routes>
    </Layout>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white text-center p-8 flex-col">
      <h1 className="font-cinzel text-3xl text-[var(--color-nordik-gold)] mb-4">NØRDIK SYSTEMS</h1>
      <p className="uppercase tracking-widest">Acesse o link da sua barbearia para agendar.</p>
      <p className="mt-8 text-[10px] text-[var(--color-nordik-gold-dim)] max-w-sm leading-loose">Se você é dono de barbearia, conheça o sistema feito para quem tem estilo e exige o melhor.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:slug/*" element={
          <TenantProvider>
            <TenantApp />
          </TenantProvider>
        } />
      </Routes>
    </Router>
  );
}`;

content = content.replace(oldApp, newApp);

fs.writeFileSync(appTsxPath, content);
console.log('App.tsx updated!');
