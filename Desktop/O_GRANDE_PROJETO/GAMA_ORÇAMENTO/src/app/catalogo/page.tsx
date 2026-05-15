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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Catálogo de Serviços</span>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>({filtrados.length} item{filtrados.length !== 1 ? "ns" : ""})</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/catalogo/lixeira" style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-2)", fontWeight: 600, fontSize: 12, textDecoration: "none", cursor: "pointer" }}>
            🗑️ Lixeira
          </a>
          <a href="/configuracoes/precificacao" style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-2)", fontWeight: 600, fontSize: 12, textDecoration: "none", cursor: "pointer" }}>
            ⚙️ Configurar Precificação
          </a>
          <a href="/catalogo/novo" style={{ padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
            + Novo Serviço
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
        {/* Filtros */}
        {categorias.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
            <button
              onClick={() => setFiltro(null)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "none",
                background: !filtro ? "var(--primary)" : "var(--surface-2)",
                color: !filtro ? "#0a0a0a" : "var(--text)",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Todos ({items.length})
            </button>
            {categorias.map((cat) => {
              const count = items.filter((i) => i.categoria === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFiltro(cat)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "none",
                    background: filtro === cat ? "var(--primary)" : "var(--surface-2)",
                    color: filtro === cat ? "#0a0a0a" : "var(--text)",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Lista de itens */}
        {filtrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0" }}>📦 Catálogo vazio</p>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 20px 0" }}>Crie seu primeiro serviço/produto para começar</p>
            <a href="/catalogo/novo" style={{ padding: "10px 24px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-block" }}>
              + Criar Serviço
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sortedDates.map((date) => {
              const isExpanded = expandedDates.has(date);
              const itemsInDate = groupedByDate.get(date) || [];
              const itemsInDateFiltered = filtro ? itemsInDate.filter(i => i.categoria === filtro) : itemsInDate;

              if (itemsInDateFiltered.length === 0) return null;

              return (
                <div key={date}>
                  {/* Data folder button */}
                  <button
                    onClick={() => toggleDate(date)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--text-1)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span>{isExpanded ? "📂" : "📁"}</span>
                      <span>{date}</span>
                      <span style={{ color: "var(--text-2)", fontWeight: 600, fontSize: 12 }}>
                        {itemsInDateFiltered.length} {itemsInDateFiltered.length === 1 ? "serviço" : "serviços"}
                      </span>
                    </div>
                  </button>

                  {/* Items in date */}
                  {isExpanded && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 8, paddingLeft: 16 }}>
                      {itemsInDateFiltered.map((item) => (
              <div key={item.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{item.nome}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{item.categoria}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4, marginBottom: 8 }}>{item.descricao}</div>
                </div>

                {/* Breakdown */}
                <div style={{ background: "var(--surface-2)", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Breakdown</div>
                  {item.tipo_precificacao === "hora" ? (
                    <div style={{ fontSize: 11, color: "var(--text-2)", display: "flex", gap: 8 }}>
                      <span>{item.horas_estimadas}h</span>
                      <span>×</span>
                      <span>R$ {item.custo_execucao ? (item.custo_execucao / (item.horas_estimadas || 1)).toFixed(0) : "?"}/h</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "var(--text-2)" }}>Preço fixo: {fmt(item.custo_execucao || 0)}</div>
                  )}
                  {item.custos_variaveis && item.custos_variaveis > 0 && <div style={{ fontSize: 11, color: "var(--text-2)" }}>+ Variáveis: {fmt(item.custos_variaveis)}</div>}
                  {item.margem_pct && <div style={{ fontSize: 11, color: "var(--text-2)" }}>+ Margem: {item.margem_pct}%</div>}
                </div>

                {/* Preço */}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Preço Final</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>{fmt(item.preco)}</div>
                </div>

                {/* Ações */}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => router.push(`/catalogo/${item.id}/editar`)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--text-2)",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDuplicate(item)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--text-2)",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    📋 Duplicar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid #fca5a5",
                      background: "#fee2e2",
                      color: "#991b1b",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
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
                style={{ flex: 1, padding: "10px 16px", borderRadius: "var(--radius-sm)", border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
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
