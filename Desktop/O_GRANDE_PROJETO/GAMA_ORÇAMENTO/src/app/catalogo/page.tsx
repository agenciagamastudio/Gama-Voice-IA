"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCatalogo, removeCatalogItem, saveCatalogItem } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { CatalogItem } from "@/types/orcamento";

const CATEGORIAS_PADRAO = ["Social Media", "Design Gráfico", "Fotografia / Vídeo", "Consultoria / Estratégia"];

export default function CatalogoPage() {
  const router = useRouter();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    setItems(getCatalogo());
  }, []);

  // Agrupar por data
  const groupedByDate = new Map<string, CatalogItem[]>();
  items.forEach((item) => {
    // Se não tem data, usa hoje
    const dateStr = (item as any).criado_em ? (item as any).criado_em : new Date().toISOString();
    const date = dateStr.split("T")[0];
    const dateObj = new Date(date + "T00:00:00Z");
    const dateFormatted = dateObj.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    if (!groupedByDate.has(dateFormatted)) {
      groupedByDate.set(dateFormatted, []);
    }
    groupedByDate.get(dateFormatted)!.push(item);
  });

  // Ordenar datas decrescente
  const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/");
    const [dayB, monthB, yearB] = b.split("/");
    const dateA = new Date(`${yearA}-${monthA}-${dayA}T00:00:00Z`);
    const dateB = new Date(`${yearB}-${monthB}-${dayB}T00:00:00Z`);
    return dateB.getTime() - dateA.getTime();
  });

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const filtrados = filtro ? items.filter((i) => i.categoria === filtro) : items;
  const categorias = Array.from(new Set(items.map((i) => i.categoria)));

  const handleDelete = (id: string) => {
    removeCatalogItem(id);
    setItems(items.filter((i) => i.id !== id));
    setConfirmDelete(null);
  };

  const handleDuplicate = (item: CatalogItem) => {
    const copy: CatalogItem = { ...item, id: Math.random().toString(36).slice(2, 10) };
    saveCatalogItem(copy);
    setItems([...items, copy]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-gama-primary-glow to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-gama-primary-dim to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gama-border backdrop-blur-md bg-gama-surface/40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <a href="/" className="text-gama-text-secondary hover:text-gama-text transition-colors text-xl font-bold">←</a>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gama-primary to-gama-primary bg-clip-text text-transparent">
                    Catálogo de Serviços
                  </h1>
                  <p className="text-gama-text-secondary text-sm mt-1">{filtrados.length} item{filtrados.length !== 1 ? "ns" : ""}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a href="/catalogo/lixeira" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text font-medium hover:border-gama-primary/50 transition-colors text-sm">
                  🗑️ Lixeira
                </a>
                <a href="/configuracoes/precificacao" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text font-medium hover:border-gama-primary/50 transition-colors text-sm">
                  ⚙️ Configurar
                </a>
                <a href="/catalogo/novo" className="px-4 py-2 bg-gama-primary text-gama-bg font-bold rounded-lg hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm">
                  + Novo Serviço
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Filtros */}
          {categorias.length > 0 && (
            <div className="flex gap-2 mb-12 flex-wrap">
              <button
                onClick={() => setFiltro(null)}
                className={`px-4 py-2 rounded-full font-medium transition-all backdrop-blur-sm border capitalize text-sm ${
                  !filtro
                    ? "bg-gama-primary/20 border-gama-primary text-gama-primary shadow-[0_0_20px_rgba(136,206,17,0.3)]"
                    : "bg-gama-surface/50 border-gama-border text-gama-text hover:border-gama-primary/50 hover:text-gama-primary"
                }`}
              >
                Todos ({items.length})
              </button>
              {categorias.map((cat) => {
                const count = items.filter((i) => i.categoria === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFiltro(cat)}
                    className={`px-4 py-2 rounded-full font-medium transition-all backdrop-blur-sm border capitalize text-sm ${
                      filtro === cat
                        ? "bg-gama-primary/20 border-gama-primary text-gama-primary shadow-[0_0_20px_rgba(136,206,17,0.3)]"
                        : "bg-gama-surface/50 border-gama-border text-gama-text hover:border-gama-primary/50 hover:text-gama-primary"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}

        {/* Lista de itens */}
        {filtrados.length === 0 ? (
          <div className="glass glass-card h-64 flex flex-col items-center justify-center">
            <p className="text-3xl mb-4">📦</p>
            <h3 className="text-white text-lg font-bold mb-2">Catálogo vazio</h3>
            <p className="text-gama-text-secondary mb-6">Crie seu primeiro serviço/produto para começar</p>
            <a href="/catalogo/novo" className="px-6 py-2 bg-gama-primary/20 border border-gama-primary text-gama-primary rounded-lg hover:bg-gama-primary/30 transition-all font-medium">
              + Criar Serviço
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const isExpanded = expandedDates.has(date);
              const itemsInDate = groupedByDate.get(date) || [];
              const itemsInDateFiltered = filtro ? itemsInDate.filter(i => i.categoria === filtro) : itemsInDate;

              if (itemsInDateFiltered.length === 0) return null;

              return (
                <div key={date}>
                  {/* Date folder button */}
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full px-4 py-3 bg-gama-surface/50 border border-gama-border rounded-lg flex items-center justify-between hover:border-gama-primary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{isExpanded ? "📂" : "📁"}</span>
                      <span className="font-bold text-white">{date}</span>
                      <span className="text-xs text-gama-text-secondary font-medium">
                        {itemsInDateFiltered.length} {itemsInDateFiltered.length === 1 ? "serviço" : "serviços"}
                      </span>
                    </div>
                    <span className="text-gama-text-secondary group-hover:text-gama-primary transition-colors">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Items in date */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pl-4">
                      {itemsInDateFiltered.map((item) => (
              <div key={item.id} className="glass glass-card p-4 group">
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-white group-hover:text-gama-primary transition-colors">{item.nome}</h4>
                  <p className="text-xs text-gama-text-secondary mt-1">{item.categoria}</p>
                  <p className="text-xs text-gama-text mt-2 leading-relaxed">{item.descricao}</p>
                </div>

                {/* Breakdown */}
                <div className="bg-gama-primary/5 border border-gama-primary/20 rounded-lg p-3 mb-3">
                  <div className="text-xs uppercase text-gama-text-secondary font-semibold mb-2">Breakdown</div>
                  <div className="text-xs text-gama-text space-y-1">
                    {item.tipo_precificacao === "hora" ? (
                      <div className="flex gap-1">
                        <span>{item.horas_estimadas}h</span>
                        <span>×</span>
                        <span>R$ {item.custo_execucao ? (item.custo_execucao / (item.horas_estimadas || 1)).toFixed(0) : "?"}/h</span>
                      </div>
                    ) : (
                      <div>Preço fixo: {fmt(item.custo_execucao || 0)}</div>
                    )}
                    {item.custos_variaveis && item.custos_variaveis > 0 && <div>+ Variáveis: {fmt(item.custos_variaveis)}</div>}
                    {item.margem_pct && <div>+ Margem: {item.margem_pct}%</div>}
                  </div>
                </div>

                {/* Preço */}
                <div className="border-t border-gama-border pt-3 mb-3">
                  <div className="text-xs uppercase text-gama-text-secondary font-semibold mb-1">Preço Final</div>
                  <div className="text-xl font-black text-gama-primary">{fmt(item.preco)}</div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => router.push(`/catalogo/${item.id}/editar`)}
                    className="flex-1 px-3 py-2 bg-gama-surface/50 border border-gama-border rounded text-gama-text text-xs font-medium hover:border-gama-primary/50 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="flex-1 px-3 py-2 bg-gama-surface/50 border border-gama-border rounded text-gama-text text-xs font-medium hover:border-gama-primary/50 transition-colors"
                  >
                    📋 Duplicar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    className="px-3 py-2 bg-[error]/10 border border-[error]/30 rounded text-[error] text-xs font-medium hover:bg-[error]/20 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0" }}>Excluir serviço?</p>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 24px 0" }}>Essa ação não pode ser desfeita.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: "10px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{ flex: 1, padding: "10px 16px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--error)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
