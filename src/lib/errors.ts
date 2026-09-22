/**
 * Extrai uma mensagem legível de um erro desconhecido (ex: retorno de
 * `supabase.rpc`, que pode ser um Error, um PostgrestError ou outra coisa).
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const maybe = err as { message?: unknown; details?: unknown };
    if (typeof maybe.message === "string" && maybe.message) return maybe.message;
    if (typeof maybe.details === "string" && maybe.details) return maybe.details;
  }
  if (typeof err === "string") return err;
  return "Erro desconhecido";
}
