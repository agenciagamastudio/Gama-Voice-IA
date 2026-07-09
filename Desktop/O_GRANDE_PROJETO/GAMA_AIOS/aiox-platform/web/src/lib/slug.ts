/** Normaliza um slug de rota: minúsculas, sem acentos, sem hífen/espaço. */
export function normalizeSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos (/Tripulação → tripulacao)
    .replace(/[\s_-]+/g, '');                         // ignora hífen/espaço (/Motor-ADE → motorade)
}
