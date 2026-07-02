import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, User, CheckCircle2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Barbeiro { id: string; nome: string; }
interface Servico { id: string; nome: string; nome_nordik: string | null; valor: number; duracao_min?: number; }
interface HorarioDisponivel { hora: string; disponivel: boolean; }

export function Agendamento() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dados do DB
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  // Seleções do Usuário
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<Barbeiro | null>(null);
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(startOfToday());
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');

  // Geração de dias (próximos 30 dias)
  const diasDisponiveis = Array.from({ length: 30 }).map((_, i) => addDays(startOfToday(), i));

  const calcularDuracaoTotal = () => {
    if (servicosSelecionados.length === 0) return 30;
    const soma = servicosSelecionados.reduce((acc, curr) => acc + (curr.duracao_min || 30), 0);
    return Math.max(soma, 30);
  };

  // Geração de horários (08:00 as 19:30, a cada 30 min)
  const gerarHorariosBase = (): HorarioDisponivel[] => {
    const horarios: HorarioDisponivel[] = [];
    let h = 8;
    let m = 0;
    
    // Gera horários até as 19:30 (último horário)
    while (h < 20) {
      horarios.push({ 
        hora: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, 
        disponivel: true 
      });
      m += 30;
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
      if (h > 19 || (h === 19 && m > 30)) break; // Limite de encerramento
    }
    return horarios;
  };

  useEffect(() => {
    async function fetchIniciais() {
      const { data: bData } = await supabase.from('barbeiros').select('id, nome').order('nome');
      if (bData) setBarbeiros(bData);
      
      const { data: sData, error: sErr } = await supabase.from('servicos').select('id, nome, nome_nordik, valor, duracao_min').eq('ativo', true).order('nome');
      if (sErr) console.error('Erro ao buscar servicos:', sErr);
      if (sData) setServicos(sData);
    }
    fetchIniciais();
  }, []);

  useEffect(() => {
    const buscarHorariosOcupados = async () => {
      setLoading(true);
      const dataStr = format(dataSelecionada, 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('agenda')
        .select('horario')
        .eq('data', dataStr);
      
      if (data) {
        setHorariosOcupados(data.map(d => d.horario.substring(0, 5)));
      } else {
        setHorariosOcupados([]);
      }
      setLoading(false);
    };

    if (step === 3 && barbeiroSelecionado) {
      buscarHorariosOcupados();
    }
  }, [step, dataSelecionada, barbeiroSelecionado]);

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    setClienteTelefone(value);
  };

  const confirmarAgendamento = async () => {
    if (!clienteNome || clienteTelefone.length < 14) {
      setError('Por favor, preencha nome e telefone válidos.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Procurar se cliente já existe pelo telefone
      let clienteId = null;
      const { data: clientesExistentes } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', clienteTelefone)
        .limit(1);

      if (clientesExistentes && clientesExistentes.length > 0) {
        clienteId = clientesExistentes[0].id;
      } else {
        // 2. Inserir novo cliente
        const { data: novoCliente, error: errInsert } = await supabase
          .from('clientes')
          .insert([{ nome: clienteNome, telefone: clienteTelefone }])
          .select('id')
          .single();
        
        if (errInsert) throw errInsert;
        clienteId = novoCliente?.id;
      }

      if (!clienteId) throw new Error('Falha ao obter ID do cliente');

      // 3. Inserir agendamento
      const dataStr = format(dataSelecionada, 'yyyy-MM-dd');
      
      const carrinhoParaBanco = servicosSelecionados.map(s => ({
        id: s.id,
        nome: s.nome,
        valor: s.valor
      }));

      const { error: errAgenda } = await supabase
        .from('agenda')
        .insert([{
          data: dataStr,
          horario: horaSelecionada,
          cliente_id: clienteId,
          barbeiro_id: barbeiroSelecionado?.id,
          servico_id: servicosSelecionados.length > 0 ? servicosSelecionados[0].id : null,
          carrinho_servicos: carrinhoParaBanco
        }]);

      if (errAgenda) throw errAgenda;
      // Dispara o evento de Conversão para o Pixel do Facebook
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Schedule');
      }

      // 4. Ir para sucesso
      setStep(5);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {step < 5 && (
        <div className="flex justify-between items-center mb-8">
          {step > 1 && step < 5 ? (
            <button onClick={() => setStep(step - 1)} className="text-[var(--color-nordik-gold-dim)] hover:text-white p-2">
              <ChevronLeft />
            </button>
          ) : <div className="w-10"></div>}
          <div className="text-[var(--color-nordik-gold)] font-cinzel tracking-widest uppercase text-sm">
            Passo {step} de 4
          </div>
          <div className="w-10"></div>
        </div>
      )}

      {/* PASSO 1: BARBEIRO */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full max-w-md mx-auto">
          <h2 className="text-xl text-white mb-6 font-cinzel tracking-widest text-center">Escolha o Profissional</h2>
          <div className="space-y-3">
            {barbeiros.map(b => (
              <button
                key={b.id}
                onClick={() => { setBarbeiroSelecionado(b); setStep(2); }}
                className="w-full bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-border)] p-4 flex items-center gap-4 hover:border-[var(--color-nordik-gold)] transition-colors text-left"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-[var(--color-nordik-gold-dim)] text-[var(--color-nordik-gold)]">
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[var(--color-nordik-gold-light)] font-bold uppercase tracking-widest text-sm">{b.nome}</h3>
                  <p className="text-[var(--color-nordik-gold-dim)] text-xs uppercase tracking-widest mt-1">Especialista</p>
                </div>
                <ChevronRight className="text-[var(--color-nordik-gold-dim)]" size={16} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASSO 2: SERVIÇO */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col w-full max-w-md mx-auto">
          <h2 className="text-xl text-white mb-6 font-cinzel tracking-widest text-center">Qual Serviço?</h2>
          <div className="space-y-3 flex-1 overflow-y-auto pb-24 w-full">
            {servicos.map(s => {
              const isSelected = servicosSelecionados.some(sel => sel.id === s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (isSelected) {
                      setServicosSelecionados(prev => prev.filter(sel => sel.id !== s.id));
                    } else {
                      setServicosSelecionados(prev => [...prev, s]);
                    }
                  }}
                  className={`w-full bg-[var(--color-nordik-panel)] border p-4 flex items-center justify-between transition-colors text-left ${isSelected ? 'border-[var(--color-nordik-gold)]' : 'border-[var(--color-nordik-border)] hover:border-[var(--color-nordik-gold-dim)]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${isSelected ? 'bg-[var(--color-nordik-gold)] border-[var(--color-nordik-gold)]' : 'border-[var(--color-nordik-gold-dim)]'}`}>
                      {isSelected && <CheckCircle2 size={14} className="text-black" />}
                    </div>
                    <div>
                      <h3 className="text-[var(--color-nordik-gold-light)] font-bold uppercase tracking-widest text-sm">
                        {s.nome}
                        {s.nome_nordik && <span className="text-[10px] text-[var(--color-nordik-gold-dim)] block opacity-80 mt-1">{s.nome_nordik}</span>}
                      </h3>
                    </div>
                  </div>
                  <div className="text-[var(--color-nordik-gold)] font-bold">
                    R$ {s.valor.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-10">
            <div className="max-w-md mx-auto">
              <button
                disabled={servicosSelecionados.length === 0}
                onClick={() => setStep(3)}
                className="w-full bg-[var(--color-nordik-gold-dark)] hover:bg-[var(--color-nordik-gold)] text-black font-bold uppercase tracking-widest py-4 px-6 flex items-center justify-between transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span>Continuar</span>
                <span>R$ {servicosSelecionados.reduce((acc, curr) => acc + curr.valor, 0).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSO 3: DATA E HORA */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full max-w-2xl mx-auto">
          <h2 className="text-xl text-white mb-6 font-cinzel tracking-widest text-center">Data e Horário</h2>
          
          {/* Seletor de Data Horizontal */}
          <div className="flex overflow-x-auto gap-3 pb-4 mb-6 snap-x hide-scrollbar">
            {diasDisponiveis.map(data => {
              const selecionado = data.getTime() === dataSelecionada.getTime();
              return (
                <button
                  key={data.toISOString()}
                  onClick={() => setDataSelecionada(data)}
                  className={`snap-center shrink-0 w-20 p-3 flex flex-col items-center justify-center border transition-colors ${selecionado ? 'bg-[var(--color-nordik-gold-dark)] border-[var(--color-nordik-gold)] text-black' : 'bg-[#111] border-[var(--color-nordik-border)] text-[var(--color-nordik-gold-dim)]'}`}
                >
                  <span className="text-[10px] uppercase tracking-widest mb-1 font-bold">{format(data, 'EEE', { locale: ptBR })}</span>
                  <span className="text-xl font-bold">{format(data, 'dd')}</span>
                  <span className="text-[10px] uppercase">{format(data, 'MMM', { locale: ptBR })}</span>
                </button>
              );
            })}
          </div>

          {/* Seletor de Hora */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {loading ? (
              <p className="col-span-3 text-center text-[var(--color-nordik-gold-dim)] text-sm py-8">Carregando horários...</p>
            ) : (
              gerarHorariosBase().map(h => {
                const ocupado = horariosOcupados.includes(h.hora);
                const selecionado = horaSelecionada === h.hora;
                return (
                  <button
                    key={h.hora}
                    disabled={ocupado}
                    onClick={() => { setHoraSelecionada(h.hora); setStep(4); }}
                    className={`py-3 text-sm font-bold tracking-widest transition-colors border ${ocupado ? 'opacity-20 border-[var(--color-nordik-border)] cursor-not-allowed bg-transparent text-white' : selecionado ? 'bg-[var(--color-nordik-gold)] text-black border-[var(--color-nordik-gold)]' : 'bg-black text-[var(--color-nordik-gold-light)] border-[var(--color-nordik-border)] hover:border-[var(--color-nordik-gold-dim)]'}`}
                  >
                    {h.hora}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* PASSO 4: CONFIRMAÇÃO */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col w-full max-w-md mx-auto">
          <h2 className="text-xl text-white mb-6 font-cinzel tracking-widest text-center">Seus Dados</h2>
          
          <div className="bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-border)] p-6 mb-6 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)]">Resumo da Reserva</p>
            <div className="space-y-2 mb-3 pb-3 border-b border-[var(--color-nordik-border)]/50">
              {servicosSelecionados.map(s => (
                <div key={s.id} className="flex justify-between items-center text-white text-sm">
                  <span className="font-bold">{s.nome}</span>
                  <span className="text-[var(--color-nordik-gold)]">R$ {s.valor.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-white pt-2 font-bold text-lg">
                <span>Total</span>
                <span className="text-[var(--color-nordik-gold)]">R$ {servicosSelecionados.reduce((acc, curr) => acc + curr.valor, 0).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-sm text-[var(--color-nordik-gold-light)] flex items-center gap-2"><User size={14}/> {barbeiroSelecionado?.nome}</p>
            <p className="text-sm text-[var(--color-nordik-gold-light)] flex items-center gap-2"><CalendarIcon size={14}/> {format(dataSelecionada, 'dd/MM/yyyy')} às {horaSelecionada}</p>
          </div>

          <div className="space-y-4 flex-1">
            {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] mb-2">Seu Nome</label>
              <input
                type="text"
                value={clienteNome}
                onChange={e => setClienteNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-black border border-[var(--color-nordik-border)] px-4 py-4 text-white focus:border-[var(--color-nordik-gold)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)] mb-2">Seu WhatsApp</label>
              <input
                type="tel"
                value={clienteTelefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                className="w-full bg-black border border-[var(--color-nordik-border)] px-4 py-4 text-white focus:border-[var(--color-nordik-gold)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={confirmarAgendamento}
            disabled={loading}
            className="mt-8 bg-[var(--color-nordik-gold-dark)] hover:bg-[var(--color-nordik-gold)] text-black font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
          >
            {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      )}

      {/* PASSO 5: SUCESSO */}
      {step === 5 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-8">
          {/* Fundo com a imagem gerada */}
          <div 
            className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
            style={{ backgroundImage: "url('/bg-premium.png')" }}
          />
          {/* Gradiente para focar o texto */}
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
          
          <div className="relative z-10 animate-in zoom-in-95 duration-1000 flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
            <div className="w-20 h-20 bg-[var(--color-nordik-gold-dark)] rounded-full flex items-center justify-center text-black mb-4 shadow-[0_0_40px_rgba(202,165,101,0.5)]">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="font-cinzel text-3xl text-[var(--color-nordik-gold)] tracking-[3px] uppercase leading-relaxed drop-shadow-lg">
              Horário Confirmado
            </h2>
            <p className="text-[15px] text-white/90 max-w-[280px] mx-auto leading-relaxed">
              O seu lugar na cadeira já está garantido para dia <strong className="text-[var(--color-nordik-gold-light)]">{format(dataSelecionada, 'dd/MM')} às {horaSelecionada}</strong>.
            </p>
            <div className="w-full pt-12 space-y-4">
              <a 
                href={`https://wa.me/5566996991681?text=Olá Nørdik! Acabei de agendar meu horário para o(s) serviço(s) de ${servicosSelecionados.map(s => s.nome).join(', ')} no dia ${format(dataSelecionada, 'dd/MM')} às ${horaSelecionada}!`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white font-bold uppercase tracking-widest py-5 px-6 w-full flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#25D366]/20"
              >
                Confirmar pelo WhatsApp
              </a>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-transparent border border-[var(--color-nordik-gold-dark)] text-[var(--color-nordik-gold-light)] hover:bg-[var(--color-nordik-gold)] hover:text-black hover:border-[var(--color-nordik-gold)] font-bold uppercase tracking-widest py-5 px-6 w-full transition-all backdrop-blur-sm"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
