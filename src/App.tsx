import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CalendarDays, MapPin, Crown, Shield, Sword, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Agendamento } from './pages/Agendamento';
import { Vip } from './pages/Vip';

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
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[var(--color-nordik-bg)] shadow-2xl relative border-x border-[var(--color-nordik-border)]">
      {/* Header Mobile */}
      <header className="h-32 flex justify-center items-center border-b border-[var(--color-nordik-gold-dark)] relative px-6">
        <a 
          href="https://www.instagram.com/invites/contact/?igsh=1k0vumpjjbvi3&utm_content=5rhyht7"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-6 flex flex-col items-center text-[var(--color-nordik-gold)] hover:text-white transition-colors"
          title="Siga no Instagram"
        >
          <InstagramIcon size={24} />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Insta</span>
        </a>
        <Link to="/">
          <img src="/logo.png" alt="Nordik Barbershop" className="h-20 object-contain" />
        </Link>
        <Link to="/vip" className="absolute right-6 flex flex-col items-center text-[var(--color-nordik-gold)] hover:text-white transition-colors" title="Acesso VIP">
          <Crown size={24} />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Área VIP</span>
        </Link>
      </header>

      {/* Conteúdo Dinâmico */}
      <main className="flex-1 p-6 flex flex-col">
        {children}
      </main>

      {/* Footer Minimalista */}
      <footer className="py-6 text-center border-t border-[var(--color-nordik-border)] bg-[#050505]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dimmer)]">
          &copy; {new Date().getFullYear()} NØRDIK BARBERSHOP
        </p>
      </footer>
    </div>
  );
}

// Tela Inicial (Home - Landing Page Premium)
function Home() {
  const [planos, setPlanos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlanos() {
      const { data } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('preco');
      if (data) setPlanos(data);
    }
    fetchPlanos();
  }, []);

  const getPlanoIcon = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('viking')) return <Crown size={24} />;
    if (n.includes('guerreiro')) return <Sword size={24} />;
    return <Shield size={24} />;
  };

  const getPlanoTheme = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('viking')) return { border: 'border-[#c9a535]/50', text: 'text-[#c9a535]', bg: 'bg-[#c9a535]/5' };
    if (n.includes('guerreiro')) return { border: 'border-[#b8956a]/50', text: 'text-[#b8956a]', bg: 'bg-[#b8956a]/5' };
    return { border: 'border-[#8a7a6a]/50', text: 'text-[#8a7a6a]', bg: 'bg-[#8a7a6a]/5' };
  };

  return (
    <div className="flex-1 flex flex-col -m-6 pb-12 bg-[#050505]">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[85vh] flex flex-col justify-between items-center text-center p-8 bg-black">
        {/* Fundo com a imagem gerada */}
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-premium.png')" }}
        />
        {/* Gradiente para fundir com a parte de baixo */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
        
        <div className="relative z-10 pt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="font-cinzel text-xl text-[var(--color-nordik-gold)] tracking-[4px] uppercase mb-2">
            Nørdik Barbershop
          </h1>
          <p className="text-xs text-white/70 uppercase tracking-[3px]">
            Mais que um corte. Um legado.
          </p>
        </div>

        <div className="relative z-10 w-full mb-8 animate-in fade-in zoom-in duration-1000 delay-500 flex flex-col gap-3">
          <Link 
            to="/agendar" 
            className="bg-[var(--color-nordik-gold-dark)] hover:bg-[var(--color-nordik-gold)] text-black font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(202,165,101,0.3)]"
          >
            <CalendarDays size={20} />
            Agendar Horário
          </Link>

          {planos.length > 0 && (
            <button 
              onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-[var(--color-nordik-gold-dim)]/50 text-[var(--color-nordik-gold-light)] hover:text-[var(--color-nordik-gold)] hover:border-[var(--color-nordik-gold)] bg-black/40 backdrop-blur-sm font-bold uppercase tracking-widest py-4 px-6 w-full flex items-center justify-center gap-3 transition-colors"
            >
              <Crown size={18} />
              Ver Planos Mensais
              <ChevronDown size={18} />
            </button>
          )}
        </div>
      </section>

      {/* 2. A MARCA */}
      <section className="py-16 px-8 text-center flex flex-col items-center border-t border-[var(--color-nordik-gold-dim)]/20">
        <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-8">
          A Marca
        </h2>
        <div className="space-y-6 text-[13px] text-[var(--color-nordik-gold-light)] leading-relaxed max-w-sm">
          <p>
            A Nørdik Barbershop nasce para homens que carregam presença, disciplina e ambição.
          </p>
          <p>
            Não é apenas sobre um corte, é sobre legado, respeito e tradição.
          </p>
          <p>
            Inspirada na força, elegância e atitude atemporal, a Nørdik representa o homem que deixa sua marca por onde passa.
          </p>
        </div>
      </section>

      {/* 3. NOSSO OBJETIVO */}
      <section className="py-16 px-8 bg-black/50 border-y border-[var(--color-nordik-gold-dim)]/20">
        <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-10 text-center">
          Nosso Objetivo
        </h2>
        
        <div className="space-y-8 max-w-sm mx-auto">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center shrink-0 mt-1">
              <span className="text-[var(--color-nordik-gold)] text-lg">⚔️</span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-sm mb-1">Elevar a Experiência</h3>
              <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                Transformar o ato de se cuidar em um ritual de poder e autoestima.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center shrink-0 mt-1">
              <span className="text-[var(--color-nordik-gold)] text-lg">🛡️</span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-sm mb-1">Ser Referência</h3>
              <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                Ser referência em excelência, estilo e atendimento masculino.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center shrink-0 mt-1">
              <span className="text-[var(--color-nordik-gold)] text-lg">🤝</span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-sm mb-1">Criar Conexões</h3>
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
          <p>Cada detalhe pensado para proporcionar uma experiência única e memorável.</p>
        </div>

        <div className="grid grid-cols-2 gap-y-10 gap-x-4 w-full max-w-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
              <span className="text-2xl font-cinzel">N</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">Tradição</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
              <span className="text-2xl">✨</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">Sofisticação</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
              <span className="text-2xl">👑</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">Exclusividade</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center text-[var(--color-nordik-gold)] bg-black/50">
              <span className="text-2xl">⏳</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold">Atemporalidade</span>
          </div>
        </div>
      </section>

      {/* 4.5 NOSSO DIFERENCIAL - BARBOTERAPIA */}
      <section className="py-16 px-8 bg-black/30 border-t border-[var(--color-nordik-gold-dim)]/20">
        <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-4 text-center">
          Barboterapia
        </h2>
        <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10">O Nosso Diferencial</p>
        
        <div className="space-y-6 max-w-sm mx-auto">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 bg-black">
              <span className="text-[var(--color-nordik-gold)] text-lg">✨</span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">Finalização Premium</h3>
              <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                Produtos exclusivos para hidratação e perfumação dos fios.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 bg-black">
              <span className="text-[var(--color-nordik-gold)] text-lg">💆‍♂️</span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">Massagem Relaxante</h3>
              <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                Alivia tensões faciais e proporciona uma experiência diferenciada.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 bg-black">
              <span className="text-[var(--color-nordik-gold)] text-lg">💨</span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">Tratamento com Ozônio</h3>
              <p className="text-xs text-[var(--color-nordik-gold-dim)] leading-relaxed">
                Higiene bem-estar, e experiência diferenciada.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center shrink-0 mt-1 bg-black">
              <span className="text-[var(--color-nordik-gold)] text-lg">♨️</span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest text-[11px] mb-1">Toalha Quente</h3>
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
        <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10">Nosso Cantinho de Bebidas</p>
        
        <div className="text-[13px] text-[var(--color-nordik-gold-light)] leading-relaxed max-w-sm mb-10 space-y-4">
          <p>Sua experiência completa. Desfrute de uma bebida gelada enquanto cuidamos do seu visual.</p>
        </div>

        <div className="grid grid-cols-2 gap-y-10 gap-x-4 w-full max-w-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
              <span className="text-2xl">🍺</span>
            </div>
            <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">Cervejas Premium</span>
            <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">Heineken • Eisenbahn • Patagonia</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
              <span className="text-2xl">⚡</span>
            </div>
            <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">Energéticos</span>
            <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">Red Bull Clássico</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
              <span className="text-2xl">🥤</span>
            </div>
            <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">Refrigerantes</span>
            <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">Coca-Cola Lata</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold-dim)] flex items-center justify-center bg-black/50 mb-1">
              <span className="text-2xl">🧃</span>
            </div>
            <span className="text-[11px] font-bold tracking-widest text-[var(--color-nordik-gold-light)] uppercase">Kids</span>
            <span className="text-[9px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider text-center px-2">Toddynho Gelado</span>
          </div>
        </div>
      </section>

      {/* 4.7 PLANOS MENSAIS */}
      {planos.length > 0 && (
        <section id="planos" className="py-16 px-8 text-center flex flex-col items-center bg-black/60 border-t border-[var(--color-nordik-gold-dim)]/20 scroll-mt-6">
          <div className="flex items-center gap-3 mb-4 text-[var(--color-nordik-gold)]">
            <Crown size={28} />
          </div>
          <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-4 text-center">
            Club Nørdik
          </h2>
          <p className="text-xs text-[var(--color-nordik-gold-dim)] text-center uppercase tracking-widest mb-10">
            Pague 3, Leve 4 cortes no mês
          </p>

          <div className="flex flex-col gap-6 w-full max-w-sm">
            {planos.map(p => {
              const theme = getPlanoTheme(p.nome);
              const linkWhats = `https://wa.me/5566996991681?text=Ol%C3%A1%2C%20gostaria%20de%20assinar%20o%20${encodeURIComponent(p.nome)}%20(R%24%20${p.preco})%21`;
              
              return (
                <div key={p.id} className={`relative border ${theme.border} ${theme.bg} p-6 text-left`}>
                  <div className={`flex items-center gap-2 mb-2 ${theme.text}`}>
                    {getPlanoIcon(p.nome)}
                    <h3 className="font-cinzel text-lg tracking-widest uppercase font-bold">{p.nome}</h3>
                  </div>
                  
                  <p className="text-[10px] text-[var(--color-nordik-gold-dim)] uppercase tracking-wider mb-4">
                    {p.descricao}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {p.servicos_incluidos?.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                        <span className={`${theme.text} text-[8px]`}>◆</span>
                        <span className="uppercase tracking-widest">{s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end border-t border-[var(--color-nordik-gold-dim)]/20 pt-4">
                    <div>
                      <span className={`text-2xl font-cinzel font-bold ${theme.text}`}>
                        R$ {Number(p.preco).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-[var(--color-nordik-gold-dim)] ml-1">/mês</span>
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
            })}
          </div>
        </section>
      )}

      {/* 5. LOCALIZAÇÃO */}
      <section className="py-16 px-8 text-center flex flex-col items-center border-t border-[var(--color-nordik-gold-dim)]/20">
        <h2 className="font-cinzel text-2xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase mb-8">
          Localização
        </h2>
        <a 
          href="https://maps.google.com/?q=R.+Astorga,+244+-+Módulo+05,+Juína+-+MT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-4 text-[var(--color-nordik-gold-light)] hover:text-[var(--color-nordik-gold)] transition-colors group"
        >
          <div className="w-14 h-14 rounded-full border border-[var(--color-nordik-gold)] flex items-center justify-center text-[var(--color-nordik-gold)] group-hover:bg-[var(--color-nordik-gold)] group-hover:text-black transition-all">
            <MapPin size={24} />
          </div>
          <span className="text-[13px] leading-relaxed max-w-sm">
            R. Astorga, 244 - Módulo 05<br/>
            Juína - MT
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] font-bold group-hover:text-[var(--color-nordik-gold)]">
            Abrir no Google Maps
          </span>
        </a>
      </section>

      {/* 6. CTA FINAL */}
      <section className="px-8 mt-4 mb-4">
        <Link 
          to="/agendar" 
          className="border border-[var(--color-nordik-gold)] bg-black hover:bg-[var(--color-nordik-gold-dark)] text-[var(--color-nordik-gold)] hover:text-black font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors"
        >
          <CalendarDays size={20} />
          Reservar Meu Horário
        </Link>
      </section>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agendar" element={<Agendamento />} />
          <Route path="/vip" element={<Vip />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
