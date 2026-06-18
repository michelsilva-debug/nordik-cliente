import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Crown, Star, Calendar, LogOut, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  pontos_fidelidade: number;
}

interface Agendamento {
  id: string;
  data: string;
  horario: string;
  status: string;
  servicos?: { nome: string };
  barbeiros?: { nome: string };
}

export function Vip() {
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [historico, setHistorico] = useState<Agendamento[]>([]);
  const [assinatura, setAssinatura] = useState<{ data_renovacao: string, visitas_usadas: number, planos: { nome: string, visitas_mes: number } } | null>(null);
  
  // Login State
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState('');

  const checkSession = async () => {
    const savedId = localStorage.getItem('@nordik:clienteId');
    if (savedId) {
      await fetchClienteData(savedId);
    } else {
      setLoading(false);
    }
  };

  const fetchClienteData = async (id: string) => {
    setLoading(true);
    try {
      // 1. Busca dados do cliente
      const { data: cData, error: cErr } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (cErr || !cData) {
        localStorage.removeItem('@nordik:clienteId');
        setCliente(null);
        setLoading(false);
        return;
      }
      
      setCliente(cData);
      
      // 1.5 Busca assinatura ativa do cliente
      const { data: assData } = await supabase
        .from('assinaturas')
        .select('*, planos(*)')
        .eq('cliente_id', id)
        .eq('status', 'ativo')
        .maybeSingle();
      
      if (assData) setAssinatura(assData);
      
      // 2. Busca histórico de agendamentos
      const { data: hData } = await supabase
        .from('agenda')
        .select('*, servicos(*), barbeiros(*)')
        .eq('cliente_id', id)
        .order('data', { ascending: false })
        .order('horario', { ascending: false })
        .limit(5); // Últimos 5 cortes
        
      if (hData) setHistorico(hData);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await checkSession();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    setTelefone(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || telefone.length < 14) {
      setError('Por favor, preencha nome e telefone válidos.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Verifica se existe
      const { data: existentes } = await supabase
        .from('clientes')
        .select('id, nome, pontos_fidelidade')
        .eq('telefone', telefone)
        .limit(1);

      let clienteId = null;

      if (existentes && existentes.length > 0) {
        clienteId = existentes[0].id;
        // Opcional: Atualizar nome caso tenha digitado diferente, 
        // mas vamos apenas logar para manter simples.
      } else {
        // Criar novo
        const { data: novo, error: errInsert } = await supabase
          .from('clientes')
          .insert([{ nome, telefone, pontos_fidelidade: 0 }])
          .select('id')
          .single();
          
        if (errInsert) throw errInsert;
        clienteId = novo?.id;
      }

      if (clienteId) {
        localStorage.setItem('@nordik:clienteId', clienteId);
        await fetchClienteData(clienteId);
      }
    } catch {
      setError('Ocorreu um erro ao acessar. Tente novamente.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@nordik:clienteId');
    setCliente(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050505]">
        <div className="text-[var(--color-nordik-gold)] animate-pulse">Carregando O Legado...</div>
      </div>
    );
  }

  // TELA DE LOGIN VIP
  if (!cliente) {
    return (
      <div className="flex-1 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-nordik-gold-dark)] rounded-full flex items-center justify-center text-black mx-auto mb-4 shadow-[0_0_30px_rgba(202,165,101,0.3)]">
            <Crown size={32} />
          </div>
          <h2 className="text-2xl text-[var(--color-nordik-gold)] font-cinzel tracking-[3px] uppercase mb-2">
            Acesso VIP
          </h2>
          <p className="text-[var(--color-nordik-gold-dim)] text-xs tracking-widest uppercase">
            Acesse seu Cartão Fidelidade
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-border)] p-6">
          {error && <div className="text-red-500 text-xs text-center">{error}</div>}
          
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] mb-2">Seu Telefone (WhatsApp)</label>
            <input
              type="tel"
              value={telefone}
              onChange={handleTelefoneChange}
              placeholder="(00) 00000-0000"
              className="w-full bg-black border border-[var(--color-nordik-border)] px-4 py-4 text-white focus:border-[var(--color-nordik-gold)] focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] mb-2">Como prefere ser chamado?</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Michel"
              className="w-full bg-black border border-[var(--color-nordik-border)] px-4 py-4 text-white focus:border-[var(--color-nordik-gold)] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="mt-6 bg-[var(--color-nordik-gold-dark)] hover:bg-[var(--color-nordik-gold)] text-black font-bold uppercase tracking-widest py-4 px-6 w-full transition-colors shadow-[0_0_20px_rgba(202,165,101,0.2)] flex justify-center"
          >
            Acessar Meu Legado
          </button>
        </form>
      </div>
    );
  }

  // TELA DO PAINEL VIP
  const pontos = cliente.pontos_fidelidade || 0;
  const selosPreenchidos = pontos % 10;
  const ciclosCompletos = Math.floor(pontos / 10);
  
  // Se bateu exatos múltiplo de 10 e não for 0
  const isPremiado = pontos > 0 && selosPreenchidos === 0;
  const selosExibidos = isPremiado ? 10 : selosPreenchidos;

  return (
    <div className="flex-1 flex flex-col -mx-6 px-6 pb-6 pt-4 animate-in fade-in duration-500">
      
      {/* Header VIP */}
      <div className="flex justify-between items-center mb-8 border-b border-[var(--color-nordik-border)] pb-4">
        <div>
          <h2 className="text-xl text-[var(--color-nordik-gold)] font-cinzel tracking-widest uppercase">
            Olá, {cliente.nome.split(' ')[0]}
          </h2>
          <p className="text-[10px] text-[var(--color-nordik-gold-dim)] uppercase tracking-widest mt-1">
            Status: {ciclosCompletos > 0 ? 'Membro Elite' : 'Membro VIP'}
          </p>
        </div>
        <button onClick={handleLogout} className="text-[var(--color-nordik-gold-dim)] hover:text-white p-2" title="Sair">
          <LogOut size={18} />
        </button>
      </div>

      {/* Assinatura Ativa */}
      {assinatura && (
        <div className="bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-border)] p-6 relative overflow-hidden mb-8 shadow-[0_0_20px_rgba(202,165,101,0.05)]">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={16} className="text-[var(--color-nordik-gold)]" />
                <h3 className="font-cinzel text-sm text-[var(--color-nordik-gold-light)] tracking-widest uppercase font-bold">
                  Sua Assinatura
                </h3>
              </div>
              <h4 className="font-cinzel text-lg text-white tracking-[2px] uppercase">
                {assinatura.planos?.nome}
              </h4>
            </div>
            <div className="bg-[var(--color-nordik-gold)]/10 border border-[var(--color-nordik-gold)]/30 text-[var(--color-nordik-gold)] px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded-sm">
              Ativo
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between text-xs uppercase tracking-widest mb-2">
              <span className="text-[var(--color-nordik-gold-dim)]">Visitas no mês</span>
              <span className="text-[var(--color-nordik-gold)] font-bold">
                {assinatura.visitas_usadas} / {assinatura.planos?.visitas_mes || 4}
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-[var(--color-nordik-gold)] transition-all duration-1000"
                style={{ width: `${Math.min((assinatura.visitas_usadas / (assinatura.planos?.visitas_mes || 4)) * 100, 100)}%` }}
              />
            </div>

            <div className="text-[10px] text-[var(--color-nordik-gold-dim)] uppercase tracking-widest flex justify-between">
              <span>Renova em:</span>
              <span className="text-[var(--color-nordik-gold-light)]">
                {format(parseISO(assinatura.data_renovacao), "dd/MM/yyyy")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cartão Fidelidade */}
      <div className="bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-gold-dark)] p-6 relative overflow-hidden mb-8 shadow-[0_0_30px_rgba(202,165,101,0.1)]">
        {/* Marca d'água de fundo */}
        <div className="absolute right-[-20%] top-[-20%] opacity-5 pointer-events-none">
          <Crown size={200} />
        </div>
        
        <div className="text-center mb-6 relative z-10">
          <h3 className="font-cinzel text-lg text-white tracking-[2px] uppercase mb-1">O Legado Nørdik</h3>
          <p className="text-[10px] text-[var(--color-nordik-gold-dim)] uppercase tracking-widest">
            {isPremiado ? 'VOCÊ ATINGIU A MARCA!' : `Faltam ${10 - selosExibidos} cortes para o seu prêmio`}
          </p>
        </div>

        {isPremiado && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center text-black mb-4 shadow-[0_0_40px_#FFD700]">
              <Star size={32} fill="black" />
            </div>
            <h4 className="font-cinzel text-[var(--color-nordik-gold)] text-xl uppercase tracking-[2px] mb-2">Recompensa Elite!</h4>
            <p className="text-white text-xs mb-6 max-w-[200px] leading-relaxed">
              Você completou 10 cortes. Apresente esta tela na barbearia para resgatar seu prêmio!
            </p>
            <button onClick={() => window.location.reload()} className="border border-[var(--color-nordik-gold)] text-[var(--color-nordik-gold)] px-4 py-2 text-[10px] uppercase tracking-widest">
              Iniciar novo ciclo
            </button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-3 relative z-10">
          {Array.from({ length: 10 }).map((_, i) => {
            const preenchido = i < selosExibidos;
            return (
              <div 
                key={i} 
                className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-500 ${preenchido ? 'bg-[var(--color-nordik-gold-dark)] border-[var(--color-nordik-gold)] shadow-[0_0_15px_rgba(202,165,101,0.5)] scale-110' : 'bg-black/50 border-[var(--color-nordik-border)]'}`}
              >
                {preenchido ? (
                  <Crown size={16} className="text-black" />
                ) : (
                  <span className="text-[10px] font-bold text-[var(--color-nordik-border)]">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-sm font-bold text-[var(--color-nordik-gold-light)] uppercase tracking-widest flex items-center gap-2">
            <Calendar size={16} className="text-[var(--color-nordik-gold)]" /> Últimos Cortes
          </h3>
          <button onClick={() => window.location.href = '/agendar'} className="text-[10px] text-[var(--color-nordik-gold)] uppercase tracking-widest hover:underline">
            Agendar Novo
          </button>
        </div>

        <div className="space-y-3">
          {historico.length === 0 ? (
            <div className="text-center p-6 border border-[var(--color-nordik-border)] bg-[var(--color-nordik-panel)] text-[var(--color-nordik-gold-dim)] text-xs">
              Nenhum corte registrado ainda.
            </div>
          ) : (
            historico.map(h => (
              <div key={h.id} className="bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-border)] p-4 flex justify-between items-center group">
                <div>
                  <div className="text-white font-bold text-sm mb-1">{h.servicos?.nome || 'Serviço Padrão'}</div>
                  <div className="text-[var(--color-nordik-gold-dim)] text-[10px] uppercase tracking-widest">
                    {format(parseISO(h.data), "dd 'de' MMM", { locale: ptBR })} • {h.barbeiros?.nome}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {h.status === 'Concluído' ? (
                    <span className="text-[10px] text-[#25D366] uppercase tracking-widest font-bold bg-[#25D366]/10 px-2 py-1">Concluído</span>
                  ) : h.status === 'Pendente' ? (
                    <span className="text-[10px] text-[var(--color-nordik-gold)] uppercase tracking-widest font-bold bg-[var(--color-nordik-gold)]/10 px-2 py-1">Pendente</span>
                  ) : null}
                  
                  <button onClick={() => window.location.href = '/agendar'} className="text-[var(--color-nordik-gold-dim)] group-hover:text-[var(--color-nordik-gold)] transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
