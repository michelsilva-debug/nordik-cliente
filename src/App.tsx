import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Agendamento } from './pages/Agendamento';

// Layout Base
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[var(--color-nordik-bg)] shadow-2xl relative border-x border-[var(--color-nordik-border)]">
      {/* Header Mobile */}
      <header className="py-6 px-8 flex flex-col items-center border-b border-[var(--color-nordik-gold-dark)]">
        <Link to="/">
          <img src="/logo.png" alt="Nordik Barbershop" className="h-24 object-contain mt-2" />
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

        <div className="relative z-10 w-full mb-8 animate-in fade-in zoom-in duration-1000 delay-500">
          <Link 
            to="/agendar" 
            className="bg-[var(--color-nordik-gold-dark)] hover:bg-[var(--color-nordik-gold)] text-black font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(202,165,101,0.3)]"
          >
            <CalendarDays size={20} />
            Agendar Horário
          </Link>
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

      {/* 5. CTA FINAL */}
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
