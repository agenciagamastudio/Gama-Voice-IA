import { prisma } from "@/lib/db";

// ============================================================================
// TIPOS
// ============================================================================

export interface SugestaoLente {
  valor: number;
  fonte: "historico" | "fallback_tag";
  amostras: number;
  tagUsada?: string; // Preenchido se fonte = "fallback_tag"
}

export interface SugestaoPrecoFinal {
  mediaHistorica: SugestaoLente;
  multiplicador: SugestaoLente;
  faixaSegmentada: SugestaoLente;
  convergencia: "total" | "parcial" | "divergente" | "sem_dados";
  variacao?: number; // % de variação entre as 3 sugestões
}

// ============================================================================
// CONSTANTES
// ============================================================================

const THRESHOLD_HISTORICO = 5; // Mínimo de orçamentos para usar histórico real

const MULTIPLICADORES_FALLBACK: Record<string, number> = {
  Premium: 1.8,
  Padrão: 1.5,
  Estratégico: 1.3,
  Indicação: 1.4,
};

const TAG_DEFAULT = "Padrão";
const MULTIPLICADOR_DEFAULT = 1.5;

// Thresholds de convergência
const THRESHOLD_TOTAL = 0.03; // 3%
const THRESHOLD_PARCIAL = 0.07; // 7%

// ============================================================================
// LENTE 1: MÉDIA HISTÓRICA
// ============================================================================

async function calcularMediaHistorica(
  templateId: string,
  clienteId: string
): Promise<SugestaoLente> {
  try {
    // Buscar orçamentos aprovados desse template E cliente
    const oramentos = await prisma.orcamento.findMany({
      where: {
        templateId,
        clienteId,
        status: "Aprovado",
      },
      select: {
        totalFinal: true,
      },
    });

    // Se temos histórico suficiente
    if (oramentos.length >= THRESHOLD_HISTORICO) {
      const media = oramentos.reduce((sum, o) => sum + o.totalFinal, 0) / oramentos.length;
      return {
        valor: media,
        fonte: "historico",
        amostras: oramentos.length,
      };
    }

    // Sem histórico, usa fallback (Tag do cliente)
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { tagContextoAtual: true },
    });

    const tag = cliente?.tagContextoAtual || TAG_DEFAULT;
    const multiplicador = MULTIPLICADORES_FALLBACK[tag] || MULTIPLICADOR_DEFAULT;

    return {
      valor: 0, // Placeholder, será calculado com floor
      fonte: "fallback_tag",
      amostras: 0,
      tagUsada: tag,
    };
  } catch (error) {
    console.error("Erro ao calcular média histórica:", error);
    return {
      valor: 0,
      fonte: "fallback_tag",
      amostras: 0,
      tagUsada: TAG_DEFAULT,
    };
  }
}

// ============================================================================
// LENTE 2: MULTIPLICADOR OBSERVADO (Sistema inteiro, últimos 12 meses)
// ============================================================================

async function calcularMultiplicadorObservado(
  floor: number
): Promise<SugestaoLente> {
  try {
    // Todos os orçamentos aprovados dos últimos 12 meses
    const umAnosaAtras = new Date();
    umAnosaAtras.setFullYear(umAnosaAtras.getFullYear() - 1);

    const orcamentos = await prisma.orcamento.findMany({
      where: {
        status: "Aprovado",
        criadoEm: {
          gte: umAnosaAtras,
        },
      },
      select: {
        totalFinal: true,
      },
    });

    // Se temos histórico suficiente
    if (orcamentos.length >= THRESHOLD_HISTORICO) {
      const mediaTotal = orcamentos.reduce((sum, o) => sum + o.totalFinal, 0) / orcamentos.length;
      const multiplicador = mediaTotal / floor;

      return {
        valor: multiplicador * floor, // Volta ao valor nominal
        fonte: "historico",
        amostras: orcamentos.length,
      };
    }

    // Sem histórico, usa fallback
    return {
      valor: floor * MULTIPLICADOR_DEFAULT,
      fonte: "fallback_tag",
      amostras: 0,
      tagUsada: TAG_DEFAULT,
    };
  } catch (error) {
    console.error("Erro ao calcular multiplicador observado:", error);
    return {
      valor: floor * MULTIPLICADOR_DEFAULT,
      fonte: "fallback_tag",
      amostras: 0,
      tagUsada: TAG_DEFAULT,
    };
  }
}

// ============================================================================
// LENTE 3: FAIXA SEGMENTADA (por tag do cliente)
// ============================================================================

async function calcularFaixaSegmentada(
  clienteId: string,
  floor: number
): Promise<SugestaoLente> {
  try {
    // Pega a tag do cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { tagContextoAtual: true },
    });

    const tag = cliente?.tagContextoAtual || TAG_DEFAULT;

    // Busca orçamentos aprovados COM ESSA TAG, últimos 12 meses
    const umAnosaAtras = new Date();
    umAnosaAtras.setFullYear(umAnosaAtras.getFullYear() - 1);

    const orcamentos = await prisma.orcamento.findMany({
      where: {
        status: "Aprovado",
        criadoEm: {
          gte: umAnosaAtras,
        },
        cliente: {
          tagContextoAtual: tag,
        },
      },
      select: {
        totalFinal: true,
      },
    });

    // Se temos histórico suficiente nessa tag
    if (orcamentos.length >= THRESHOLD_HISTORICO) {
      const media = orcamentos.reduce((sum, o) => sum + o.totalFinal, 0) / orcamentos.length;
      return {
        valor: media,
        fonte: "historico",
        amostras: orcamentos.length,
      };
    }

    // Sem histórico, usa multiplicador da tag
    const multiplicador = MULTIPLICADORES_FALLBACK[tag] || MULTIPLICADOR_DEFAULT;

    return {
      valor: floor * multiplicador,
      fonte: "fallback_tag",
      amostras: 0,
      tagUsada: tag,
    };
  } catch (error) {
    console.error("Erro ao calcular faixa segmentada:", error);
    const multiplicador = MULTIPLICADORES_FALLBACK[TAG_DEFAULT] || MULTIPLICADOR_DEFAULT;
    return {
      valor: floor * multiplicador,
      fonte: "fallback_tag",
      amostras: 0,
      tagUsada: TAG_DEFAULT,
    };
  }
}

// ============================================================================
// CONVERGÊNCIA
// ============================================================================

function calcularConvergencia(
  lente1: SugestaoLente,
  lente2: SugestaoLente,
  lente3: SugestaoLente
): { convergencia: "total" | "parcial" | "divergente" | "sem_dados"; variacao?: number } {
  // Se qualquer lente está em fallback (sem histórico real), retorna "sem_dados"
  if (
    lente1.fonte === "fallback_tag" ||
    lente2.fonte === "fallback_tag" ||
    lente3.fonte === "fallback_tag"
  ) {
    return { convergencia: "sem_dados" };
  }

  // Todas as 3 têm histórico real, calcula variação
  const valores = [lente1.valor, lente2.valor, lente3.valor];
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const media = valores.reduce((a, b) => a + b, 0) / 3;

  const variacao = (max - min) / media;

  if (variacao < THRESHOLD_TOTAL) {
    return { convergencia: "total", variacao };
  } else if (variacao < THRESHOLD_PARCIAL) {
    return { convergencia: "parcial", variacao };
  } else {
    return { convergencia: "divergente", variacao };
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

export async function gerarSugestoesPreco(
  templateId: string,
  clienteId: string,
  floor: number
): Promise<SugestaoPrecoFinal> {
  // Calcula as 3 lentes
  const [mediaHistorica, multiplicador, faixaSegmentada] = await Promise.all([
    calcularMediaHistorica(templateId, clienteId),
    calcularMultiplicadorObservado(floor),
    calcularFaixaSegmentada(clienteId, floor),
  ]);

  // Se mediaHistorica está em fallback, aplica o multiplicador da tag
  if (mediaHistorica.fonte === "fallback_tag" && mediaHistorica.tagUsada) {
    const mult = MULTIPLICADORES_FALLBACK[mediaHistorica.tagUsada] || MULTIPLICADOR_DEFAULT;
    mediaHistorica.valor = floor * mult;
  }

  // Calcula convergência
  const { convergencia, variacao } = calcularConvergencia(
    mediaHistorica,
    multiplicador,
    faixaSegmentada
  );

  return {
    mediaHistorica,
    multiplicador,
    faixaSegmentada,
    convergencia,
    variacao,
  };
}
