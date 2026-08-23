import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Tenant {
  id: string;
  nome: string;
  slug: string;
  configuracoes?: Record<string, string>;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({ tenant: null, loading: true, error: null });

export const useTenant = () => useContext(TenantContext);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenant() {
      if (!slug) {
        setError('Barbearia não informada na URL.');
        setLoading(false);
        return;
      }

      try {
        // Busca a barbearia pelo slug
        const { data: barbearia, error: err } = await supabase
          .from('barbearias')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'ativa')
          .single();

        if (err || !barbearia) {
          console.error('Erro ao buscar barbearia:', err);
          setError('Barbearia não encontrada ou inativa.');
          setLoading(false);
          return;
        }

        // Busca as configurações dessa barbearia
        const { data: configs } = await supabase
          .from('configuracoes')
          .select('chave, valor')
          .eq('barbearia_id', barbearia.id);

        const configuracoes: Record<string, string> = {};
        if (configs) {
          configs.forEach(c => {
            configuracoes[c.chave] = c.valor;
          });
        }

        setTenant({
          id: barbearia.id,
          nome: barbearia.nome,
          slug: barbearia.slug,
          configuracoes
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [slug]);

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}
