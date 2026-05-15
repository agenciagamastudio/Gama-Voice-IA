// Funções puras de cálculo de Rate Card
// Sem efeitos colaterais, sem acesso a banco

export interface Profissional {
  id: string;
  nome: string;
  funcao: string;
  tipo: string;
  horaCusto: number;
  capacidadeMes: number;
  ativo: boolean;
}

export interface OverheadItem {
  id: string;
  descricao: string;
  valor: number;
  proporcional: number;
  ativo: boolean;
}

export interface RateCardLinha {
  profissionalId: string;
  nome: string;
  funcao: string;
  horaCusto: number;
  horaEmpresa: number;
  margemValor: number;
  margemPct: number;
  horaVendida: number;
}

/**
 * Calcula a hora-empresa baseado no overhead total e horas produtivas
 * horaEmpresa = overheadTotal / horasProdutivasTotal
 */
export function calcularHoraEmpresa(
  overheadItems: OverheadItem[],
  profissionais: Profissional[]
): number {
  // Apenas items ativos
  const overheadTotal = overheadItems
    .filter((item) => item.ativo)
    .reduce((sum, item) => sum + item.valor * item.proporcional, 0);

  // Apenas profissionais ativos
  const horasProdutivasTotal = profissionais
    .filter((p) => p.ativo)
    .reduce((sum, p) => sum + p.capacidadeMes, 0);

  if (horasProdutivasTotal === 0) return 0;

  return overheadTotal / horasProdutivasTotal;
}

/**
 * Calcula a Rate Card completa
 * Para cada profissional: horaVendida = (horaCusto + horaEmpresa) × (1 + margemAlvo)
 */
export function calcularRateCard(
  profissionais: Profissional[],
  horaEmpresa: number,
  margemAlvoPct: number
): RateCardLinha[] {
  const margemAlvoDecimal = margemAlvoPct / 100;

  return profissionais
    .filter((p) => p.ativo)
    .map((p) => {
      const margemValor = p.horaCusto + horaEmpresa;
      const horaVendida = margemValor * (1 + margemAlvoDecimal);

      return {
        profissionalId: p.id,
        nome: p.nome,
        funcao: p.funcao,
        horaCusto: p.horaCusto,
        horaEmpresa,
        margemValor,
        margemPct: margemAlvoPct,
        horaVendida,
      };
    });
}

/**
 * Formata valor monetário para BRL
 */
export function formatarBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/**
 * Formata percentual
 */
export function formatarPct(valor: number, decimais = 1): string {
  return `${valor.toFixed(decimais)}%`;
}
