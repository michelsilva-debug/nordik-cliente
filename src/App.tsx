import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Crown,
  Shield,
  Sword,
  ChevronDown,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Agendamento } from "./pages/Agendamento";
import { TenantProvider, useTenant } from "./contexts/TenantContext";
import { Vip } from "./pages/Vip";

// Ícone do Instagram (SVG inline, pois lucide-react não exporta Instagram nesta versão)
function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Layout Base
function Layout({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const logoUrl = tenant?.configuracoes?.logo_url || "/logo.png";
  const instaUrl =
    tenant?.configuracoes?.instagram_url ||
    "https://www.instagram.com/invites/contact/?igsh=1k0vumpjjbvi3&utm_content=5rhyht7";
  return (
    <div className="min-h-screen flex flex-col w-full max-w-[448px] md:max-w-[900px] lg:max-w-[1200px] mx-auto bg-black md:shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border-x border-[var(--color-nordik-border)] transition-all duration-500 overflow-hidden">
      {/* Marca d'água nórdica — padrão repetido sutil */}
      <div
        className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: "url('/nordic-watermark.png')",
          backgroundSize: "400px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Header Mobile & Desktop */}
      <header className="h-32 flex justify-center items-center border-b border-[var(--color-nordik-gold-dark)] relative px-6 md:px-12 z-10">
        <a
          href={instaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-6 md:left-12 flex flex-col items-center text-[var(--color-nordik-gold)] hover:text-white transition-colors"
          title="Siga no Instagram"
        >
          <InstagramIcon size={24} />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">
            Insta
          </span>
        </a>
        <Link to={`/${tenant?.slug || ""}`}>
          <img
            src={logoUrl}
            alt="Nordik Barbershop"
            className="h-20 md:h-24 object-contain transition-all duration-500"
          />
        </Link>
        <Link
          to={`/${tenant?.slug || ""}/vip`}
          className="absolute right-6 md:right-12 flex flex-col items-center text-[var(--color-nordik-gold)] hover:text-white transition-colors"
          title="Acesso VIP"
        >
          <Crown size={24} />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">
            Área VIP
          </span>
        </Link>
      </header>

      {/* Conteúdo Dinâmico */}
      <main className="flex-1 p-6 flex flex-col z-10 relative">{children}</main>

      {/* Footer Minimalista */}
      <footer className="py-6 text-center border-t border-[var(--color-nordik-border)] bg-[#050505] z-10 relative">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dimmer)]">
          &copy; {new Date().getFullYear()}{" "}
          {tenant?.nome || "NØRDIK BARBERSHOP"}
          <br />
          <span className="text-[8px] text-[var(--color-nordik-gold-dim)]">
            Powered by NØRDIK SYSTEMS
          </span>
        </p>
      </footer>
    </div>
  );
}

// Tela Inicial (Home - Landing Page Premium)
function Home() {
  const { tenant } = useTenant();
  const agendamentoAtivo = tenant?.configuracoes?.agendamento_ativo !== "false";
  const whatsUrl =
    tenant?.configuracoes?.whatsapp_url ||
    (tenant?.slug === "nordik" ? "https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%21" : "");
  const mapsUrl =
    tenant?.configuracoes?.endereco_maps ||
    (tenant?.slug === "nordik" ? "https://maps.google.com/?q=R.+Astorga,+244+-+Módulo+05,+Juína+-+MT" : "");
  const enderecoTexto =
    tenant?.configuracoes?.endereco_texto ||
    (tenant?.slug === "nordik" ? "R. Astorga, 244 - Módulo 05\nJuína - MT" : "");

  const [planos, setPlanos] = useState<
    {
      id: string;
      nome: string;
      preco: number;
      descricao: string;
      servicos_incluidos: string[];
      visitas_mes: number;
    }[]
  >([]);

  useEffect(() => {
    async function fetchPlanos() {
      const { data } = await supabase
        .from("planos")
        .select("*")
        .eq("ativo", true)
        .eq("barbearia_id", tenant?.id)
        .order("preco");
      if (data) setPlanos(data);
    }
    if (tenant?.id) fetchPlanos();
  }, [tenant?.id]);

  const getPlanoIcon = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes("viking")) return <Crown size={24} />;
    if (n.includes("guerreiro")) return <Sword size={24} />;
    return <Shield size={24} />;
  };

  const getPlanoTheme = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes("viking"))
      return {
        border: "border-[#c9a535]/50",
        text: "text-[#c9a535]",
        bg: "bg-[#c9a535]/5",
      };
    if (n.includes("guerreiro"))
      return {
        border: "border-[#b8956a]/50",
        text: "text-[#b8956a]",
        bg: "bg-[#b8956a]/5",
      };
    return {
      border: "border-[#8a7a6a]/50",
      text: "text-[#8a7a6a]",
      bg: "bg-[#8a7a6a]/5",
    };
  };

  // WHITE LABEL CONFIGS
  const landingAtiva = tenant?.configuracoes?.landing_page_ativa === "true";
  const slogan = tenant?.configuracoes?.landing_page_slogan || "Bem-vindo à nossa Barbearia.";
  const sobre = tenant?.configuracoes?.landing_page_sobre || "";

  return (
    <div className="flex-1 flex flex-col -m-6 pb-12 bg-[#050505]">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[85vh] flex flex-col justify-between items-center text-center p-8 bg-black">
        <div
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-premium.png')" }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />

        <div className="relative z-10 pt-16 md:pt-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="font-cinzel text-xl md:text-4xl text-[var(--color-nordik-gold)] tracking-[4px] md:tracking-[8px] uppercase mb-2 md:mb-4 drop-shadow-xl">
            {tenant?.nome || "Barbearia"}
          </h1>
          <p className="text-xs md:text-sm text-white/70 uppercase tracking-[3px] md:tracking-[5px]">
            {slogan}
          </p>
        </div>

        <div className="relative z-10 w-full max-w-sm mx-auto md:max-w-md mb-8 animate-in fade-in zoom-in duration-1000 delay-500 flex flex-col gap-3">
          <Link
            to={agendamentoAtivo ? `/${tenant?.slug}/agendar` : "#"}
            onClick={(e) => {
              if (!agendamentoAtivo) e.preventDefault();
            }}
            className={`font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors ${agendamentoAtivo ? "bg-[var(--color-nordik-gold-dark)] hover:bg-[var(--color-nordik-gold)] text-black shadow-[0_0_20px_rgba(202,165,101,0.3)]" : "bg-[#333] text-[#888] cursor-not-allowed"}`}
          >
            {agendamentoAtivo ? (
              <>
                <CalendarDays size={20} /> Agendar Horário
              </>
            ) : (
              <>
                <AlertTriangle size={20} /> Voltamos em Breve
              </>
            )}
          </Link>

          {(whatsUrl || mapsUrl) && (
            <div className={`grid gap-3 ${whatsUrl && mapsUrl ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {whatsUrl && (
                <a
                  href={whatsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366] bg-black/40 backdrop-blur-sm font-bold uppercase tracking-widest py-3 px-2 w-full flex items-center justify-center gap-2 transition-colors text-[10px] md:text-xs text-center"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[var(--color-nordik-gold-dim)]/50 text-[var(--color-nordik-gold-light)] hover:bg-[var(--color-nordik-gold-dim)]/10 hover:border-[var(--color-nordik-gold)] hover:text-[var(--color-nordik-gold)] bg-black/40 backdrop-blur-sm font-bold uppercase tracking-widest py-3 px-2 w-full flex items-center justify-center gap-2 transition-colors text-[10px] md:text-xs text-center"
                >
                  <MapPin size={16} />
                  Localização
                </a>
              )}
            </div>
          )}

          {planos.length > 0 && (
            <button
              onClick={() =>
                document
                  .getElementById("planos")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="border border-[var(--color-nordik-gold-dim)]/50 text-[var(--color-nordik-gold-light)] hover:text-[var(--color-nordik-gold)] hover:border-[var(--color-nordik-gold)] bg-black/40 backdrop-blur-sm font-bold uppercase tracking-widest py-4 px-6 w-full flex items-center justify-center gap-3 transition-colors mt-1"
            >
              <Crown size={18} />
              Ver Planos Mensais
              <ChevronDown size={18} />
            </button>
          )}
        </div>
      </section>

      {/* SEÇÕES DE HISTÓRIA / MARCA (SÓ EXIBE SE O CLIENTE PRO ATIVAR A LANDING PAGE) */}
      {landingAtiva && sobre && tenant?.slug !== "nordik" && (
        <section className="py-16 px-8 text-center flex flex-col items-center border-t border-[var(--color-nordik-gold-dim)]/20">
          <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-8">
            A Marca
          </h2>
          <div className="space-y-6 text-[13px] text-[var(--color-nordik-gold-light)] leading-relaxed max-w-sm whitespace-pre-wrap">
            {sobre}
          </div>
        </section>
      )}

      {/* SEÇÕES EXCLUSIVAS NØRDIK BARBERSHOP */}
      {tenant?.slug === "nordik" && (
        <>
          {/* 2. A MARCA */}
          <section className="py-16 px-8 text-center flex flex-col items-center border-t border-[var(--color-nordik-gold-dim)]/20">
            <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-8">
              A Marca
            </h2>
            <div className="space-y-6 text-[13px] text-[var(--color-nordik-gold-light)] leading-relaxed max-w-sm">
              <p>
                A Nørdik Barbershop nasce para homens que carregam presença,
                disciplina e ambição.
              </p>
              <p>
                Não é apenas sobre um corte, é sobre legado, respeito e tradição.
              </p>
              <p>
                Inspirada na força, elegância e atitude atemporal, a Nørdik
                representa o homem que deixa sua marca por onde passa.
              </p>
            </div>
          </section>

          {/* 3. NOSSO OBJETIVO */}
          <section className="py-16 px-8 bg-black/50 border-y border-[var(--color-nordik-gold-dim)]/20">
            <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-10 text-center">
              Nosso Objetivo
            </h2>

            <div className="space-y-8 max-w-sm mx-auto md:max-w-5xl md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
              <div className="flex flex-col md:items-center md:text-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center shrink-0 mt-1 md:mt-0">
                  <span className="text-[var(--color-nordik-gold)] text-lg">⚔️</span>
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-sm mb-1">
                    Elevar a Experiência
                  </h3>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                    Transformar o ato de se cuidar em um ritual de poder e autoestima.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-center md:text-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center shrink-0 mt-1 md:mt-0">
                  <span className="text-[var(--color-nordik-gold)] text-lg">🛡️</span>
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-sm mb-1">
                    Ser Referência
                  </h3>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                    Ser referência em excelência, estilo e atendimento masculino.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-center md:text-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center shrink-0 mt-1 md:mt-0">
                  <span className="text-[var(--color-nordik-gold)] text-lg">🤝</span>
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-sm mb-1">
                    Criar Conexões
                  </h3>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                    Construir uma comunidade de homens que valorizam tradição e respeito.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. NOSSO ESTILO */}
          <section className="py-16 px-8 text-center flex flex-col items-center">
            <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-8">
              Nosso Estilo
            </h2>

            <div className="text-[13px] text-[var(--color-nordik-gold-light)] leading-relaxed max-w-sm mb-12 space-y-4">
              <p>Um ambiente masculino, sóbrio e sofisticado.</p>
              <p>
                Cada detalhe pensado para proporcionar uma experiência única e memorável.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-x-12 w-full max-w-sm md:max-w-4xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
                  <span className="text-2xl font-cinzel">N</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">
                  Tradição
                </span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
                  <span className="text-2xl">✨</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">
                  Sofisticação
                </span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
                  <span className="text-2xl">👑</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">
                  Exclusividade
                </span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
                  <span className="text-2xl">⏳</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">
                  Atemporalidade
                </span>
              </div>
            </div>
          </section>

          {/* 4.5 NOSSO DIFERENCIAL - BARBOTERAPIA */}
          <section className="py-16 px-8 bg-black/30 border-t border-[var(--color-nordik-gold-dim)]/20">
            <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-4 text-center">
              Barboterapia
            </h2>
            <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10">
              O Nosso Diferencial
            </p>

            <div className="space-y-6 max-w-sm mx-auto md:max-w-4xl md:grid md:grid-cols-2 md:gap-x-16 md:gap-y-10 md:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center gap-4 items-start">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 md:mt-0 bg-black">
                  <span className="text-[var(--color-nordik-gold)] text-lg">✨</span>
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">
                    Finalização Premium
                  </h3>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                    Produtos exclusivos para hidratação e perfumação dos fios.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 items-start">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 md:mt-0 bg-black">
                  <span className="text-[var(--color-nordik-gold)] text-lg">💆‍♂️</span>
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">
                    Massagem Relaxante
                  </h3>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                    Alivia tensões faciais e proporciona uma experiência diferenciada.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 items-start">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 md:mt-0 bg-black">
                  <span className="text-[var(--color-nordik-gold)] text-lg">💨</span>
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">
                    Tratamento com Ozônio
                  </h3>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                    Higiene bem-estar, e experiência diferenciada.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 items-start">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 md:mt-0 bg-black">
                  <span className="text-[var(--color-nordik-gold)] text-lg">♨️</span>
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">
                    Toalha Quente
                  </h3>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                    Abertura dos poros promovendo maior conforto durante o serviço.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4.6 CANTINHO PREMIUM DE BEBIDAS */}
          <section className="py-16 px-8 text-center flex flex-col items-center border-t border-[var(--color-nordik-gold-dim)]/20">
            <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-4 text-center">
              Nordik Lounge
            </h2>
            <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10">
              Nosso Cantinho de Bebidas
            </p>

            <div className="text-[13px] text-[var(--color-nordik-gold-light)] leading-relaxed max-w-sm mb-10 space-y-4">
              <p>
                Sua experiência completa. Desfrute de uma bebida gelada enquanto
                cuidamos do seu visual.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-x-8 w-full max-w-sm md:max-w-4xl">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
                  <span className="text-2xl">🍺</span>
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">
                  Cervejas Premium
                </span>
                <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">
                  Heineken • Corona • Império Gold
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
                  <span className="text-2xl">⚡</span>
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">
                  Energéticos
                </span>
                <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">
                  Red Bull Clássico
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
                  <span className="text-2xl">🥤</span>
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">
                  Refrigerantes
                </span>
                <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">
                  Coca-Cola Lata
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
                  <span className="text-2xl">🧃</span>
                </div>
                <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">
                  Kids
                </span>
                <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">
                  Toddynho Gelado
                </span>
              </div>
            </div>
          </section>
        </>
      )}
      {/* 4.7 PLANOS MENSAIS */}
      {planos.length > 0 &&
        (() => {
          const planoComboCabelo = planos.filter((p) =>
            p.nome.toUpperCase().includes("BLACK"),
          );
          const planosPague3Leve4 = planos.filter(
            (p) =>
              p.visitas_mes === 4 && !p.nome.toUpperCase().includes("BLACK"),
          );
          const planosPague2Metade = planos.filter(
            (p) =>
              p.visitas_mes !== 4 && !p.nome.toUpperCase().includes("BLACK"),
          );

          const renderPlanoCard = (p: (typeof planos)[0]) => {
            const theme = getPlanoTheme(p.nome);
            const whatsBase = tenant?.configuracoes?.whatsapp_url
              ? tenant.configuracoes.whatsapp_url.split("?")[0]
              : "https://wa.me/5566999888986";
            const linkWhats = `${whatsBase}?text=Ol%C3%A1%2C%20gostaria%20de%20assinar%20o%20${encodeURIComponent(p.nome)}%20(R%24%20${p.preco})%21`;

            const isComboCabelo = p.nome.toUpperCase().includes("BLACK");
            let valorReal = 0;
            let showDiscount = false;

            if (isComboCabelo) {
              valorReal = 180;
              showDiscount = true;
            } else if (p.visitas_mes === 4) {
              // Pague 3, Leve 4: o preço do plano equivale a 3 visitas
              valorReal = (p.preco / 3) * 4;
              showDiscount = true;
            } else if (p.visitas_mes === 3) {
              // Pague 2 e 3º pela metade: o preço do plano equivale a 2.5 visitas
              valorReal = (p.preco / 2.5) * 3;
              showDiscount = true;
            }

            return (
              <div
                key={p.id}
                className={`relative border ${theme.border} ${theme.bg} p-6 text-left`}
              >
                <div className={`flex items-center gap-2 mb-2 ${theme.text}`}>
                  {getPlanoIcon(p.nome)}
                  <h3 className="font-cinzel text-lg tracking-widest uppercase font-bold">
                    {p.nome}
                  </h3>
                </div>

                <p className="text-[10px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider mb-4">
                  {p.descricao}
                </p>

                <div className="space-y-2 mb-6">
                  {p.servicos_incluidos?.map((s: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-white/80"
                    >
                      <span className={`${theme.text} text-[8px]`}>◆</span>
                      <span className="uppercase tracking-widest">{s}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-end border-t border-[var(--color-nordik-gold-dim)]/20 pt-4">
                  <div>
                    {showDiscount && (
                      <div className="text-[10px] text-[var(--color-nordik-gold)] mb-1 uppercase tracking-widest font-bold">
                        De R${" "}
                        {valorReal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        por
                      </div>
                    )}
                    <span
                      className={`text-2xl font-cinzel font-bold ${theme.text}`}
                    >
                      R${" "}
                      {Number(p.preco).toLocaleString("pt-BR", {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                    <span className="text-[10px] text-[var(--color-nordik-gold-dim)] ml-1">
                      /mês
                    </span>
                  </div>

                  <a
                    href={linkWhats}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 border ${theme.border} ${theme.text} hover:bg-black transition-colors`}
                  >
                    Assinar
                  </a>
                </div>
              </div>
            );
          };

          return (
            <section
              id="planos"
              className="py-16 px-8 text-center flex flex-col items-center bg-black/60 border-t border-[var(--color-nordik-gold-dim)]/20 scroll-mt-6"
            >
              {/* COMBO CABELO (NØRDIK BLACK) - Especial */}
              {planoComboCabelo.length > 0 && (
                <div className="w-full max-w-sm md:max-w-5xl mx-auto mb-16">
                  <div className="flex items-center gap-3 mb-4 text-[var(--color-nordik-gold)] justify-center">
                    <Shield size={28} />
                  </div>
                  <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-4 text-center">
                    Combo Cabelo
                  </h2>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10 flex items-center justify-center flex-wrap gap-1">
                    Pacote com 4 cortes no mês com super desconto{" "}
                    <span className="text-[var(--color-nordik-gold)] font-bold">
                      5.6% OFF
                    </span>
                  </p>

                  <div className="flex flex-col md:grid md:grid-cols-3 gap-6 w-full justify-center">
                    <div className="md:col-start-2">
                      {planoComboCabelo.map((p) => renderPlanoCard(p))}
                    </div>
                  </div>
                </div>
              )}

              {/* COMBO 1: Pague 3, Leve 4 */}
              {planosPague3Leve4.length > 0 && (
                <div className="w-full max-w-sm md:max-w-5xl mx-auto mb-16">
                  {planoComboCabelo.length > 0 && (
                    <div className="border-t border-[var(--color-nordik-gold-dim)]/20 mb-12" />
                  )}
                  <div className="flex items-center gap-3 mb-4 text-[var(--color-nordik-gold)] justify-center">
                    <Crown size={28} />
                  </div>
                  <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-4 text-center">
                    Club Nørdik
                  </h2>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10 flex items-center justify-center flex-wrap gap-1">
                    Pague 3, Leve 4 cortes no mês{" "}
                    <span className="text-[var(--color-nordik-gold)] font-bold">
                      25% OFF
                    </span>
                  </p>

                  <div className="flex flex-col md:grid md:grid-cols-3 gap-6 w-full">
                    {planosPague3Leve4.map((p) => renderPlanoCard(p))}
                  </div>
                </div>
              )}

              {/* COMBO 2: Pague 2, 3º pela Metade */}
              {planosPague2Metade.length > 0 && (
                <div className="w-full max-w-sm md:max-w-5xl mx-auto">
                  {(planosPague3Leve4.length > 0 ||
                    planoComboCabelo.length > 0) && (
                    <div className="border-t border-[var(--color-nordik-gold-dim)]/20 mb-12" />
                  )}
                  <div className="flex items-center gap-3 mb-4 text-[var(--color-nordik-gold)] justify-center">
                    <Crown size={28} />
                  </div>
                  <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-4 text-center">
                    Club Nørdik
                  </h2>
                  <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10">
                    Combo Valhalla — 2 Cortes + 3º com 50% OFF
                  </p>

                  <div className="flex flex-col md:grid md:grid-cols-3 gap-6 w-full">
                    {planosPague2Metade.map((p) => renderPlanoCard(p))}
                  </div>
                </div>
              )}
            </section>
          );
        })()}

      {/* 5. LOCALIZAÇÃO */}
      {mapsUrl && enderecoTexto && (
        <section className="py-16 px-8 text-center flex flex-col items-center border-t border-[var(--color-nordik-gold-dim)]/20">
          <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-8">
            Localização
          </h2>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 text-[var(--color-nordik-gold-light)] hover:text-[var(--color-nordik-gold)] transition-colors group"
          >
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center text-[var(--color-nordik-gold)] group-hover:bg-[var(--color-nordik-gold)] group-hover:text-black transition-all">
              <MapPin size={24} />
            </div>
            <span className="text-[13px] leading-relaxed max-w-sm">
              {enderecoTexto.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold group-hover:text-[var(--color-nordik-gold)]">
              Abrir no Google Maps
            </span>
          </a>
        </section>
      )}

      {/* 6. CTA FINAL */}
      <section className="px-8 mt-4 mb-4">
        {agendamentoAtivo ? (
          <Link
            to={`/${tenant?.slug}/agendar`}
            className="border border-[var(--color-nordik-gold)] bg-black hover:bg-[var(--color-nordik-gold-dark)] text-[var(--color-nordik-gold)] hover:text-black font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors"
          >
            <CalendarDays size={20} />
            Reservar Meu Horário
          </Link>
        ) : (
          <a
            href={whatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#25D366] bg-black hover:bg-[#25D366]/10 text-[#25D366] font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors"
          >
            <MessageCircle size={20} />
            Agendar pelo WhatsApp
          </a>
        )}
      </section>
    </div>
  );
}

// Tela de Agendamento Bloqueado
function AgendamentoBloqueado() {
  const { tenant } = useTenant();
  const whatsUrl =
    tenant?.configuracoes?.whatsapp_url ||
    (tenant?.slug === "nordik" ? "https://wa.me/5566999888986?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%21" : "");
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6 -m-6">
      <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
        <div className="w-20 h-20 bg-[var(--color-nordik-gold)]/10 rounded-full flex items-center justify-center text-[var(--color-nordik-gold)] mb-2 shadow-[0_0_40px_rgba(202,165,101,0.15)]">
          <CalendarDays size={40} />
        </div>
        <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase leading-relaxed">
          Voltamos em Breve
        </h2>
        <p className="text-[15px] text-white/70 max-w-[320px] mx-auto leading-relaxed">
          Estamos reorganizando nossa agenda. Chame a gente no WhatsApp que
          garantimos seu horário!
        </p>
        <div className="w-full pt-6 space-y-4">
          <a
            href={whatsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle size={20} />
            Agendar pelo WhatsApp
          </a>
          <Link
            to={`/${tenant?.slug || ""}`}
            className="bg-transparent border border-[var(--color-nordik-gold-dark)] text-[var(--color-nordik-gold-light)] hover:bg-[var(--color-nordik-gold)] hover:text-black hover:border-[var(--color-nordik-gold)] font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center transition-all"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function TenantApp() {
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
        <h1 className="font-cinzel text-3xl text-[var(--color-nordik-gold)] mb-4">
          404
        </h1>
        <p className="uppercase tracking-widest">
          {error || "Barbearia não encontrada"}
        </p>
        <p className="mt-8 text-xs text-[var(--color-nordik-gold-dim)]">
          Powered by NØRDIK SYSTEMS
        </p>
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
      <h1 className="font-cinzel text-3xl text-[var(--color-nordik-gold)] mb-4">
        NØRDIK SYSTEMS
      </h1>
      <p className="uppercase tracking-widest">
        Acesse o link da sua barbearia para agendar.
      </p>
      <p className="mt-8 text-[10px] text-[var(--color-nordik-gold-dim)] max-w-sm leading-loose">
        Se você é dono de barbearia, conheça o sistema feito para quem tem
        estilo e exige o melhor.
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/:slug/*"
          element={
            <TenantProvider>
              <TenantApp />
            </TenantProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
