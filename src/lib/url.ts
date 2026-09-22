/**
 * Garante que uma URL vinda de configuração (preenchida por um usuário
 * autenticado no painel de gestão) só seja usada em `href`/`src` se for
 * de fato http(s). Isso evita que um valor como `javascript:...` salvo
 * em `configuracoes` (ex: link do Instagram, do mapa ou logo) vire um
 * XSS quando o cliente clica no link.
 */
export function safeUrl(val: string | undefined | null): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // URLs relativas (ex: "/logo.png") são seguras.
  if (trimmed.startsWith("/")) return trimmed;
  return "";
}
