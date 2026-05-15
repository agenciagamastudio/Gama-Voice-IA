"use client";

import type { Orcamento, Empresa, CatalogItem, PricingConfig, OrcamentoVersion, OrcamentoHistorico, CatalogSnapshot, CatalogHistory } from "@/types/orcamento";

const KEY        = "gama_orcamentos";
const TRASH_KEY  = "gama_orcamentos_trash";
const EMPRESA_KEY = "gama_empresa";
const CATALOG_KEY = "gama_catalogo";
const PRICING_KEY = "gama_pricing_config";

// ── Orçamentos ───────────────────────────────────────────────────────────────

export function getAll(): Orcamento[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function getById(id: string): Orcamento | null {
  return getAll().find((o) => o.id === id) ?? null;
}

export function save(orc: Orcamento): void {
  const list = getAll();
  const idx  = list.findIndex((o) => o.id === orc.id);
  const now  = new Date().toISOString();
  if (idx >= 0) list[idx] = { ...orc, atualizado_em: now };
  else          list.unshift({ ...orc, criado_em: now, atualizado_em: now });
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function remove(id: string): void {
  const orc = getById(id);
  if (orc) {
    // Mover para lixeira em vez de deletar permanentemente
    const trash = getTrash();
    trash.push(orc);
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
  }
  localStorage.setItem(KEY, JSON.stringify(getAll().filter((o) => o.id !== id)));
}

// ── Lixeira (Soft Delete) ────────────────────────────────────────────────────────

export function getTrash(): Orcamento[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(TRASH_KEY) ?? "[]"); } catch { return []; }
}

export function restoreFromTrash(id: string): void {
  const trash = getTrash();
  const orc = trash.find((o) => o.id === id);
  if (orc) {
    save(orc);
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash.filter((o) => o.id !== id)));
  }
}

export function deletePermanently(id: string): void {
  localStorage.setItem(TRASH_KEY, JSON.stringify(getTrash().filter((o) => o.id !== id)));
}

export function emptyTrash(): void {
  localStorage.setItem(TRASH_KEY, JSON.stringify([]));
}

// ── Duplicar Orçamento ───────────────────────────────────────────────────────────

export function duplicate(id: string): Orcamento | null {
  const orc = getById(id);
  if (!orc) return null;

  const newOrc: Orcamento = {
    ...orc,
    id: Math.random().toString(36).slice(2, 11),
    numero: `${orc.numero}-cópia`,
    status: "Rascunho",
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  };

  save(newOrc);
  return newOrc;
}

// ── Empresa ──────────────────────────────────────────────────────────────────

export const EMPRESA_DEFAULT: Empresa = {
  nome: "GAMA Studio", logo_text: "G",
  cnpj: "", endereco: "", telefone: "", email: "",
};

export function getEmpresa(): Empresa {
  if (typeof window === "undefined") return EMPRESA_DEFAULT;
  try { return JSON.parse(localStorage.getItem(EMPRESA_KEY) ?? "null") ?? EMPRESA_DEFAULT; }
  catch { return EMPRESA_DEFAULT; }
}

export function saveEmpresa(emp: Empresa): void {
  localStorage.setItem(EMPRESA_KEY, JSON.stringify(emp));
}

// ── Catálogo de Produtos/Serviços ─────────────────────────────────────────────

const CATALOG_TRASH_KEY = "gama_catalogo_trash";

export function getCatalogo(): CatalogItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CATALOG_KEY) ?? "[]"); } catch { return []; }
}

export function saveCatalogItem(item: CatalogItem): void {
  const list = getCatalogo();
  const idx  = list.findIndex((i) => i.id === item.id);
  const now = new Date().toISOString();

  if (idx >= 0) {
    // Atualizar item existente (manter criado_em)
    list[idx] = { ...item, criado_em: (list[idx] as any).criado_em || now };
  } else {
    // Novo item
    list.push({ ...item, criado_em: now } as any);
  }

  localStorage.setItem(CATALOG_KEY, JSON.stringify(list));

  // Salvar snapshot do catálogo quando há mudanças
  saveCatalogSnapshot();
}

export function removeCatalogItem(id: string): void {
  const item = getCatalogo().find((i) => i.id === id);
  if (item) {
    const trash = getCatalogTrash();
    trash.push(item);
    localStorage.setItem(CATALOG_TRASH_KEY, JSON.stringify(trash));
  }
  localStorage.setItem(CATALOG_KEY, JSON.stringify(getCatalogo().filter((i) => i.id !== id)));
}

// ── Lixeira do Catálogo ──────────────────────────────────────────────────────

export function getCatalogTrash(): CatalogItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CATALOG_TRASH_KEY) ?? "[]"); } catch { return []; }
}

export function restoreCatalogFromTrash(id: string): void {
  const trash = getCatalogTrash();
  const item = trash.find((i) => i.id === id);
  if (item) {
    saveCatalogItem(item);
    localStorage.setItem(CATALOG_TRASH_KEY, JSON.stringify(trash.filter((i) => i.id !== id)));
  }
}

export function deleteCatalogPermanently(id: string): void {
  localStorage.setItem(CATALOG_TRASH_KEY, JSON.stringify(getCatalogTrash().filter((i) => i.id !== id)));
}

export function emptyCatalogTrash(): void {
  localStorage.setItem(CATALOG_TRASH_KEY, JSON.stringify([]));
}

// ── Configuração de Precificação ──────────────────────────────────────────────

export const PRICING_DEFAULT: PricingConfig = {
  taxa_horaria: 100,
  horas_medias_projeto: 20,
  projetos_por_mes: 4,
  margem_padrao: 30,
  custos_fixos: [],
  unidades_faturamento: {
    projetos_fechados: 4,
    servicos_soltos: 0,
    pacotes_combos: 0,
    consultoria_hora: 0,
  },
};

export function getPricingConfig(): PricingConfig {
  if (typeof window === "undefined") return PRICING_DEFAULT;
  try { return JSON.parse(localStorage.getItem(PRICING_KEY) ?? "null") ?? PRICING_DEFAULT; }
  catch { return PRICING_DEFAULT; }
}

export function savePricingConfig(cfg: PricingConfig): void {
  localStorage.setItem(PRICING_KEY, JSON.stringify(cfg));
}

// ── Versionamento de Orçamentos ──────────────────────────────────────────────

const VERSIONS_KEY = "gama_orcamentos_versions";

export function getVersionHistory(orcamento_id: string): OrcamentoHistorico | null {
  if (typeof window === "undefined") return null;
  try {
    const allVersions: OrcamentoHistorico[] = JSON.parse(localStorage.getItem(VERSIONS_KEY) ?? "[]");
    return allVersions.find((h) => h.orcamento_id === orcamento_id) ?? null;
  } catch {
    return null;
  }
}

export function getAllVersionHistories(): OrcamentoHistorico[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) ?? "[]"); } catch { return []; }
}

export function createVersion(orcamento_id: string, orcamento: Orcamento, motivo: string): OrcamentoVersion {
  const allVersions = getAllVersionHistories();
  let history = allVersions.find((h) => h.orcamento_id === orcamento_id);

  if (!history) {
    history = { orcamento_id, versoes: [] };
    allVersions.push(history);
  }

  const versao_numero = history.versoes.length + 1;
  const newVersion: OrcamentoVersion = {
    id: Math.random().toString(36).slice(2, 11),
    orcamento_id,
    orcamento: { ...orcamento },
    versao_numero,
    motivo,
    criado_em: new Date().toISOString(),
  };

  history.versoes.push(newVersion);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(allVersions));

  return newVersion;
}

export function getVersion(orcamento_id: string, versao_numero: number): OrcamentoVersion | null {
  const history = getVersionHistory(orcamento_id);
  if (!history) return null;
  return history.versoes.find((v) => v.versao_numero === versao_numero) ?? null;
}

export function createNewVersionFromCatalogUpdate(id: string): OrcamentoVersion | null {
  const orc = getById(id);
  if (!orc) return null;

  return createVersion(id, orc, "Atualização de preços do catálogo");
}

export function duplicateWithNewPrices(id: string, catalogDate?: string): Orcamento | null {
  const orc = getById(id);
  if (!orc) return null;

  // Buscar snapshot do catálogo na data especificada
  const catalogSnapshot = catalogDate ? getCatalogSnapshotByDate(catalogDate) : null;
  const catalogItems = catalogSnapshot ? catalogSnapshot.itens : getCatalogo();

  // Criar versão do original
  createVersion(id, orc, "Duplicado para nova versão com preços atualizados");

  // Atualizar preços dos itens com base no catálogo
  const updatedItems = orc.itens.map((item) => {
    const catalogItem = catalogItems.find((c) => c.id === item.id);
    if (catalogItem) {
      return {
        ...item,
        preco_unitario: catalogItem.preco,
        total: catalogItem.preco * item.quantidade,
      };
    }
    return item;
  });

  // Criar novo orçamento com preços atualizados
  const newOrc: Orcamento = {
    ...orc,
    id: Math.random().toString(36).slice(2, 11),
    numero: `${orc.numero}-v2`,
    status: "Rascunho",
    itens: updatedItems,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
  };

  save(newOrc);

  // Registrar como versão do novo
  const motivo = catalogDate ? `Criado com preços de ${catalogDate}` : "Criado a partir de atualização de preços";
  createVersion(newOrc.id, newOrc, motivo);

  return newOrc;
}

// ── Versionamento de Catálogo ──────────────────────────────────────────────

const CATALOG_HISTORY_KEY = "gama_catalogo_history";

export function getCatalogHistory(): CatalogHistory {
  if (typeof window === "undefined") return { snapshots: [] };
  try {
    const history = JSON.parse(localStorage.getItem(CATALOG_HISTORY_KEY) ?? "null") ?? { snapshots: [] };

    // Se não tem snapshots, criar um do catálogo atual
    if (history.snapshots.length === 0) {
      const catalog = getCatalogo();
      if (catalog.length > 0) {
        const initialSnapshot: CatalogSnapshot = {
          id: Math.random().toString(36).slice(2, 11),
          data: new Date().toISOString(),
          itens: [...catalog],
        };
        history.snapshots.push(initialSnapshot);
        localStorage.setItem(CATALOG_HISTORY_KEY, JSON.stringify(history));
      }
    }

    return history;
  }
  catch { return { snapshots: [] }; }
}

export function saveCatalogSnapshot(): CatalogSnapshot {
  const catalog = getCatalogo();
  const history = getCatalogHistory();

  const snapshot: CatalogSnapshot = {
    id: Math.random().toString(36).slice(2, 11),
    data: new Date().toISOString(),
    itens: [...catalog],
  };

  history.snapshots.push(snapshot);
  localStorage.setItem(CATALOG_HISTORY_KEY, JSON.stringify(history));

  return snapshot;
}

export function getCatalogSnapshotByDate(date: string): CatalogSnapshot | null {
  const history = getCatalogHistory();

  // Parse date string in pt-BR format (DD/MM/YYYY) or ISO format
  let targetDate: Date;
  if (date.includes("/")) {
    const [day, month, year] = date.split("/");
    targetDate = new Date(`${year}-${month}-${day}T23:59:59Z`);
  } else {
    targetDate = new Date(date + "T23:59:59Z");
  }

  // Encontra o snapshot mais recente até a data especificada
  return history.snapshots
    .filter(s => new Date(s.data).getTime() <= targetDate.getTime())
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    [0] ?? null;
}

export function getAllCatalogDates(): string[] {
  const history = getCatalogHistory();
  const dates = new Set<string>();

  history.snapshots.forEach(snapshot => {
    const dateStr = new Date(snapshot.data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    dates.add(dateStr);
  });

  return Array.from(dates).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/");
    const [dayB, monthB, yearB] = b.split("/");
    const dateA = new Date(`${yearA}-${monthA}-${dayA}T00:00:00Z`);
    const dateB = new Date(`${yearB}-${monthB}-${dayB}T00:00:00Z`);
    return dateB.getTime() - dateA.getTime();
  });
}
