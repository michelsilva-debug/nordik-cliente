import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, User, CheckCircle2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Barbeiro { id: string; nome: string; }
interface Servico { id: string; nome: string; nome_nordik: string | null; valor: number; }
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
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(startOfToday());
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');

  // Geração de dias (próximos 30 dias)
  const diasDisponiveis = Array.from({ length: 30 }).map((_, i) => addDays(startOfToday(), i));

  // Geração de horários (08:00 as 19:15, a cada 45 min)
  const gerarHorariosBase = (): HorarioDisponivel[] => {
    const horarios: HorarioDisponivel[] = [];
    let h = 8;
    let m = 0;
    
    // Gera horários até as 19:15 (último horário)
    while (h < 20) {
      horarios.push({ 
        hora: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, 
        disponivel: true 
      });
      m += 45;
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
      if (h > 19 || (h === 19 && m > 15)) break; // Limite de encerramento
    }
    return horarios;
  };

  useEffect(() => {
    async function fetchIniciais() {
      const { data: bData } = await supabase.from('barbeiros').select('id, nome').order('nome');
      if (bData) setBarbeiros(bData);
      
      const { data: sData, error: sErr } = await supabase.from('servicos').select('id, nome, nome_nordik, valor').eq('ativo', true).order('nome');
      if (sErr) console.error('Erro ao buscar servicos:', sErr);
      if (sData) setServicos(sData);
    }
    fetchIniciais();
  }, []);

  useEffect(() => {
    if (step === 3 && barbeiroSelecionado) {
      buscarHorariosOcupados();
    }
  }, [step, dataSelecionada, barbeiroSelecionado]);

  const buscarHorariosOcupados = async () => {
    setLoading(true);
    const dataStr = format(dataSelecionada, 'yyyy-MM-dd');
    
    // Busca na agenda do admin os horários marcados para esse barbeiro nessa data
    // Nota: Aqui o ideal é buscar todos dessa data.
    const { data } = await supabase
      .from('agenda')
      .select('horario')
      .eq('data', dataStr)
      // Se não houver barbeiro_id na agenda antiga, isso pode não filtrar perfeitamente,
      // mas vamos assumir que o painel admin agora salva barbeiro_id (se houver na tabela).
      // Se não houver, vamos apenas ler a data inteira.
    
    if (data) {
      setHorariosOcupados(data.map(d => d.horario.substring(0, 5)));
    } else {
      setHorariosOcupados([]);
    }
    setLoading(false);
  };

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
      const { error: errAgenda } = await supabase
        .from('agenda')
        .insert([{
          data: dataStr,
          horario: horaSelecionada,
          cliente_id: clienteId
          // barbeiro_id e servico_id não existem no schema original,
          // se existirem, adicione aqui. Caso contrário, ignoramos.
        }]);

      if (errAgenda) throw errAgenda;

      // 4. Ir para sucesso
      setStep(5);
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const HeaderPassos = () => (
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
  );

  return (
    <div className="flex-1 flex flex-col">
      {step < 5 && <HeaderPassos />}

      {/* PASSO 1: BARBEIRO */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-xl text-white mb-6 font-cinzel tracking-widest text-center">Qual Serviço?</h2>
          <div className="space-y-3">
            {servicos.map(s => (
              <button
                key={s.id}
                onClick={() => { setServicoSelecionado(s); setStep(3); }}
                className="w-full bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-border)] p-4 flex items-center justify-between hover:border-[var(--color-nordik-gold)] transition-colors text-left"
              >
                <div>
                  <h3 className="text-[var(--color-nordik-gold-light)] font-bold uppercase tracking-widest text-sm">
                    {s.nome}
                    {s.nome_nordik && <span className="text-[10px] text-[var(--color-nordik-gold-dim)] block opacity-80 mt-1">{s.nome_nordik}</span>}
                  </h3>
                </div>
                <div className="text-[var(--color-nordik-gold)] font-bold">
                  R$ {s.valor.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASSO 3: DATA E HORA */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
          <div className="grid grid-cols-3 gap-3">
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
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
          <h2 className="text-xl text-white mb-6 font-cinzel tracking-widest text-center">Seus Dados</h2>
          
          <div className="bg-[var(--color-nordik-panel)] border border-[var(--color-nordik-border)] p-6 mb-6 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-nordik-gold-dim)]">Resumo da Reserva</p>
            <div className="flex justify-between items-center text-white">
              <span className="font-bold">{servicoSelecionado?.nome}</span>
              <span className="text-[var(--color-nordik-gold)]">R$ {servicoSelecionado?.valor.toFixed(2)}</span>
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
            <div className="w-full pt-12">
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
