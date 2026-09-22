import { createContext } from "react";

export interface Tenant {
  id: string;
  nome: string;
  slug: string;
  configuracoes?: Record<string, string>;
}

export interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

export const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
});
