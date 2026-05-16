/**
 * Metricas — Funções puras de cálculo para auditoria
 * Sem efeitos colaterais, sem acesso a banco de dados
 */

export interface OrcamentoMetricas {
  id: string;
  precoFloor: number;
  precoPraticado: number;
  status: "rascunho" | "enviado" | "aprovado" | "rejeitado";
  tagContexto?: string;
  template?: string;
  datas?: {
    emissao: string;
  };
}

export interface TemplateMetricas {
  nome: string;
  usos: number;
  margemMedia: number;
  multiplicadorMedio: number;
  tendencia: "crescente" | "estavel" | "decrescente";
}

/**
 * Calcula margem real em percentual (0-100)
 * Formula: (precoPraticado - precoFloor) / precoFloor * 100
 */
export function calcularMargemReal(
  precoFloor: number,
  precoPraticado: number
): number {
  if (precoFloor <= 0) return 0;
  return ((precoPraticado - precoFloor) / precoFloor) * 100;
}

/**
 * Calcula multiplicador (quantas vezes o floor)
 * Formula: precoPraticado / precoFloor
 */
export function calcularMultiplicador(
  precoFloor: number,
  precoPraticado: number
): number {
  if (precoFloor <= 0) return 0;
  return precoPraticado / precoFloor;
}

/**
 * Detecta tendência de margem baseado em histórico
 * Compara margem média com margem histórica geral
 */
export function detectarTendenciaMargem(
  margemAtual: number,
  margemHistorica: number = 42.5 // média histórica esperada
): "crescente" | "estavel" | "decrescente" {
  const diferenca = margemAtual - margemHistorica;

  if (diferenca > 5) return "crescente";
  if (diferenca < -5) return "decrescente";
  return "estavel";
}

/**
 * Detecta templates que precisam revisão
 * Critérios: margem decrescente OU usos < 5 com multiplicador baixo
 */
export function detectarTemplatesParaRevisao(
  templates: TemplateMetricas[]
): TemplateMetricas[] {
  return templates.filter((t) => {
    // Critério 1: Tendência decrescente
    if (t.tendencia === "decrescente") return true;

    // Critério 2: Poucos usos + multiplicador baixo (abaixo de 1.5x)
    if (t.usos < 5 && t.multiplicadorMedio < 1.5) return true;

    // Critério 3: Margem abaixo de meta (35%)
    if (t.margemMedia < 35) return true;

    return false;
  });
}

/**
 * Calcula métrica agregada: margem média de um conjunto de orçamentos
 */
export function calcularMargemMedia(orcamentos: OrcamentoMetricas[]): number {
  if (orcamentos.length === 0) return 0;

  const totalMargem = orcamentos.reduce((sum, orc) => {
    return sum + calcularMargemReal(orc.precoFloor, orc.precoPraticado);
  }, 0);

  return totalMargem / orcamentos.length;
}

/**
 * Calcula multiplicador médio de um conjunto de orçamentos
 */
export function calcularMultiplicadorMedio(orcamentos: OrcamentoMetricas[]): number {
  if (orcamentos.length === 0) return 0;

  const totalMultiplicador = orcamentos.reduce((sum, orc) => {
    return sum + calcularMultiplicador(orc.precoFloor, orc.precoPraticado);
  }, 0);

  return totalMultiplicador / orcamentos.length;
}

/**
 * Calcula valor total fechado (sum de precoPraticado para status aprovado)
 */
export function calcularTotalFechado(orcamentos: OrcamentoMetricas[]): number {
  return orcamentos
    .filter((o) => o.status === "aprovado")
    .reduce((sum, orc) => sum + orc.precoPraticado, 0);
}

/**
 * Conta orçamentos por status
 */
export function contarPorStatus(
  orcamentos: OrcamentoMetricas[]
): Record<string, number> {
  return {
    rascunho: orcamentos.filter((o) => o.status === "rascunho").length,
    enviado: orcamentos.filter((o) => o.status === "enviado").length,
    aprovado: orcamentos.filter((o) => o.status === "aprovado").length,
    rejeitado: orcamentos.filter((o) => o.status === "rejeitado").length,
  };
}

/**
 * Filtra orçamentos por critérios múltiplos
 */
export function filtrarOrcamentos(
  orcamentos: OrcamentoMetricas[],
  criterios: {
    status?: string;
    tagContexto?: string;
    margemMin?: number;
    margemMax?: number;
    diaRangeStart?: string; // YYYY-MM-DD
    diaRangeEnd?: string;
  }
): OrcamentoMetricas[] {
  return orcamentos.filter((orc) => {
    // Filtro por status
    if (criterios.status && orc.status !== criterios.status) return false;

    // Filtro por tag
    if (criterios.tagContexto && orc.tagContexto !== criterios.tagContexto) {
      return false;
    }

    // Filtro por margem mínima
    if (criterios.margemMin !== undefined) {
      const margem = calcularMargemReal(orc.precoFloor, orc.precoPraticado);
      if (margem < criterios.margemMin) return false;
    }

    // Filtro por margem máxima
    if (criterios.margemMax !== undefined) {
      const margem = calcularMargemReal(orc.precoFloor, orc.precoPraticado);
      if (margem > criterios.margemMax) return false;
    }

    // Filtro por data range
    if (criterios.diaRangeStart && orc.datas?.emissao) {
      const orcData = orc.datas.emissao.split("T")[0];
      if (orcData < criterios.diaRangeStart) return false;
    }

    if (criterios.diaRangeEnd && orc.datas?.emissao) {
      const orcData = orc.datas.emissao.split("T")[0];
      if (orcData > criterios.diaRangeEnd) return false;
    }

    return true;
  });
}

/**
 * Agrupa orçamentos por campo
 */
export function agruparOrcamentos(
  orcamentos: OrcamentoMetricas[],
  chave: "status" | "tagContexto" | "template"
): Record<string, OrcamentoMetricas[]> {
  const grupos: Record<string, OrcamentoMetricas[]> = {};

  orcamentos.forEach((orc) => {
    const valor = orc[chave] || "sem-valor";
    if (!grupos[valor]) {
      grupos[valor] = [];
    }
    grupos[valor].push(orc);
  });

  return grupos;
}

/**
 * Calcula evolução de margem ao longo do tempo (por mês)
 * Retorna array com mes e margem média
 */
export function calcularEvolucaoMargem(
  orcamentos: OrcamentoMetricas[]
): Array<{ mes: string; margem: number }> {
  const grupos: Record<string, number[]> = {};

  // Agrupar margens por mês (YYYY-MM)
  orcamentos.forEach((orc) => {
    if (!orc.datas?.emissao) return;

    const mesAno = orc.datas.emissao.substring(0, 7); // YYYY-MM
    const margem = calcularMargemReal(orc.precoFloor, orc.precoPraticado);

    if (!grupos[mesAno]) {
      grupos[mesAno] = [];
    }
    grupos[mesAno].push(margem);
  });

  // Calcular média por mês
  return Object.entries(grupos)
    .sort(([mesA], [mesB]) => mesA.localeCompare(mesB))
    .map(([mes, margens]) => ({
      mes: mes.replace("-", "/"), // YYYY/MM format
      margem: margens.reduce((a, b) => a + b, 0) / margens.length,
    }));
}

/**
 * Detecta anomalias: orçamentos com preço praticado < floor
 * Estes representam prejuízo
 */
export function detectarAnomaliasPreco(
  orcamentos: OrcamentoMetricas[]
): OrcamentoMetricas[] {
  return orcamentos.filter((orc) => orc.precoPraticado < orc.precoFloor);
}

/**
 * Valida consistência de dados de orçamento
 * Retorna array de mensagens de erro (vazio = válido)
 */
export function validarDadosOrcamento(orc: OrcamentoMetricas): string[] {
  const erros: string[] = [];

  if (orc.precoFloor < 0) erros.push("precoFloor não pode ser negativo");
  if (orc.precoPraticado < 0) erros.push("precoPraticado não pode ser negativo");

  const margemValida = [
    "rascunho",
    "enviado",
    "aprovado",
    "rejeitado",
  ].includes(orc.status);
  if (!margemValida) erros.push(`status inválido: ${orc.status}`);

  return erros;
}
