export type OrcamentoStatus = "Aprovado" | "Pendente" | "Rejeitado" | "Rascunho";

export interface OrcamentoItem {
  id: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
}

export interface Empresa {
  nome: string;
  logo_text: string;
  logo_url?: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  instagram?: string;
}

export interface Cliente {
  nome: string;
  cpf_cnpj: string;
  contato: string;
  email: string;
  endereco: string;
  instagram?: string;
}

export interface Orcamento {
  id: string;
  numero: string;
  status: OrcamentoStatus;
  empresa: Empresa;
  cliente: Cliente;
  itens: OrcamentoItem[];
  datas: { emissao: string; validade: string };
  desconto_percentual: number;
  termos: string;
  garantia: string;
  criado_em: string;
  atualizado_em: string;
}

export interface CustoFixo {
  id: string;
  nome: string;
  valor_mensal: number;
  categoria: "software" | "infra" | "pessoal" | "outro";
}

export interface PricingConfig {
  taxa_horaria: number;
  horas_medias_projeto: number;
  projetos_por_mes: number;
  margem_padrao: number;
  custos_fixos: CustoFixo[];
  // Novo: Unidades de faturamento (mais granular que só "projetos")
  unidades_faturamento?: {
    projetos_fechados: number;
    servicos_soltos: number;
    pacotes_combos: number;
    consultoria_hora: number;
  };
}

export interface CatalogItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  tipo_precificacao?: "hora" | "fixo" | "pacote";
  horas_estimadas?: number;
  custo_execucao?: number;
  custos_variaveis?: number;
  overhead_valor?: number;
  overhead_pct?: number;
  margem_pct?: number;
  preco_custo?: number;
}

// ── Versionamento de Orçamentos ──────────────────────────────────────────────

export interface OrcamentoVersion {
  id: string;
  orcamento_id: string;
  orcamento: Orcamento;
  versao_numero: number;
  motivo: string; // ex: "Atualização de preços", "Aprovado", etc
  criado_em: string;
  criado_por?: string;
}

export interface OrcamentoHistorico {
  orcamento_id: string;
  versoes: OrcamentoVersion[];
}

// ── Versionamento de Catálogo ──────────────────────────────────────────────

export interface CatalogSnapshot {
  id: string;
  data: string; // ISO date quando foi capturado
  itens: CatalogItem[];
}

export interface CatalogHistory {
  snapshots: CatalogSnapshot[];
}
