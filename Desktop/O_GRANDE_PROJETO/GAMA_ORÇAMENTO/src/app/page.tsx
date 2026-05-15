"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAll, remove, duplicate } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { Orcamento } from "@/types/orcamento";

export default function HomePage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setOrcamentos(getAll());
  }, []);

  const handleRemove = (id: string) => {
    remove(id);
    setOrcamentos(getAll());
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicate(id);
    if (dup) setOrcamentos(getAll());
  };

  // Agrupar por data de emissão
  const groupedByDate = new Map<string, Orcamento[]>();
  orcamentos.forEach((orc) => {
    try {
      const date = orc.datas.emissao.split("T")[0]; // YYYY-MM-DD
      const dateObj = new Date(date + "T00:00:00Z"); // Adiciona Z para UTC
      const dateFormatted = dateObj.toLocaleDateString("pt-BR", { timeZone: "UTC" });
      if (!groupedByDate.has(dateFormatted)) {
        groupedByDate.set(dateFormatted, []);
      }
      groupedByDate.get(dateFormatted)!.push(orc);
    } catch (e) {
      console.error("Erro ao formatar data:", orc.datas.emissao, e);
    }
  });

  // Ordenar datas decrescente
  const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/");
    const [dayB, monthB, yearB] = b.split("/");
    const dateA = new Date(`${yearA}-${monthA}-${dayA}T00:00:00Z`);
    const dateB = new Date(`${yearB}-${monthB}-${dayB}T00:00:00Z`);
    return dateB.getTime() - dateA.getTime();
  });

  // Filtrar por busca
  const filteredDates = sortedDates.filter((date) => {
    return groupedByDate
      .get(date)!
      .some((orc) =>
        orc.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orc.numero.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const totalValue = orcamentos.reduce((sum, orc) => {
    const subtotal = orc.itens.reduce((s, i) => s + i.total, 0);
    const desconto = orc.desconto_percentual > 0 ? subtotal * (orc.desconto_percentual / 100) : 0;
    return sum + (subtotal - desconto);
  }, 0);

  const countByStatus = {
    Aprovado: orcamentos.filter((o) => o.status === "Aprovado").length,
    Pendente: orcamentos.filter((o) => o.status === "Pendente").length,
    Rejeitado: orcamentos.filter((o) => o.status === "Rejeitado").length,
    Rascunho: orcamentos.filter((o) => o.status === "Rascunho").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#0a0a0a" }}>
            G
          </div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>
            GAMA <span style={{ color: "var(--primary)" }}>Orçamento</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/lixeira" style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            🗑️ Lixeira
          </Link>
          <Link href="/catalogo" style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            📦 Catálogo
          </Link>
          <Link href="/empresa" style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            ⚙ Empresa
          </Link>
          <Link href="/novo" style={{ padding: "8px 20px", borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            + Novo Orçamento
          </Link>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
          <div style={{ padding: "16px 20px", borderRadius: "var(--radius)", border: "1px solid var(--primary)", background: "var(--primary-dim)", cursor: "pointer" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--primary)" }}>{fmt(totalValue)}</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>Total</div>
          </div>
          {["Aprovado", "Pendente", "Rejeitado", "Rascunho"].map((status) => (
            <div key={status} style={{ padding: "16px 20px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text)" }}>
                {countByStatus[status as keyof typeof countByStatus]}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{status}</div>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 14 }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por cliente ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 320,
              padding: "9px 12px 9px 36px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {/* Datas agrupadas */}
        {filteredDates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Nenhum orçamento encontrado</div>
            <div style={{ color: "var(--text-2)", marginBottom: 24 }}>Crie seu primeiro orçamento agora.</div>
            <Link href="/novo" style={{ padding: "10px 24px", borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 14, textDecoration: "none", display: "inline-block" }}>
              + Novo Orçamento
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredDates.map((date) => {
              const isExpanded = expandedDates.has(date);
              const orcsInDate = groupedByDate.get(date)!;
              const dateTotal = orcsInDate.reduce((sum, orc) => {
                const subtotal = orc.itens.reduce((s, i) => s + i.total, 0);
                const desconto = orc.desconto_percentual > 0 ? subtotal * (orc.desconto_percentual / 100) : 0;
                return sum + (subtotal - desconto);
              }, 0);

              return (
                <div key={date}>
                  {/* Pasta da data */}
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
                        {orcsInDate.length} {orcsInDate.length === 1 ? "orçamento" : "orçamentos"}
                      </span>
                    </div>
                    <span style={{ color: "var(--primary)", fontWeight: 900, fontSize: 14 }}>{fmt(dateTotal)}</span>
                  </button>

                  {/* Conteúdo da pasta */}
                  {isExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, paddingLeft: 24 }}>
                      {orcsInDate.map((orc) => {
                        const subtotal = orc.itens.reduce((s, i) => s + i.total, 0);
                        const desconto = orc.desconto_percentual > 0 ? subtotal * (orc.desconto_percentual / 100) : 0;
                        const total = subtotal - desconto;

                        return (
                          <div
                            key={orc.id}
                            style={{
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius-sm)",
                              padding: "12px 16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-1)" }}>
                                {orc.cliente.nome}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>
                                #{orc.numero} · {new Date(orc.datas.emissao).toLocaleDateString("pt-BR")} · {orc.itens.length} items
                              </div>
                            </div>

                            <div style={{ textAlign: "right", marginRight: 16 }}>
                              <div style={{ fontWeight: 900, fontSize: 14, color: "var(--primary)" }}>{fmt(total)}</div>
                              {orc.desconto_percentual > 0 && (
                                <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>
                                  −{orc.desconto_percentual}% desc.
                                </div>
                              )}
                            </div>

                            {/* Status badge */}
                            <div
                              style={{
                                padding: "4px 12px",
                                borderRadius: "var(--radius-sm)",
                                fontSize: 11,
                                fontWeight: 700,
                                background: {
                                  Aprovado: "rgba(16,185,129,0.12)",
                                  Pendente: "rgba(245,158,11,0.12)",
                                  Rejeitado: "rgba(225,29,72,0.12)",
                                  Rascunho: "rgba(113,113,122,0.12)",
                                }[orc.status],
                                color: {
                                  Aprovado: "#10b981",
                                  Pendente: "#f59e0b",
                                  Rejeitado: "#e11d48",
                                  Rascunho: "#71717a",
                                }[orc.status],
                              }}
                            >
                              {orc.status}
                            </div>

                            {/* Ações */}
                            <div style={{ display: "flex", gap: 6 }}>
                              <Link href={`/${orc.id}/preview`} style={{ padding: "4px 8px", fontSize: 14 }} title="Visualizar">
                                👁
                              </Link>
                              <Link href={`/${orc.id}/editar`} style={{ padding: "4px 8px", fontSize: 14 }} title="Editar">
                                ✏️
                              </Link>
                              <Link href={`/${orc.id}/historico`} style={{ padding: "4px 8px", fontSize: 14 }} title="Histórico">
                                📋
                              </Link>
                              <button
                                onClick={() => handleRemove(orc.id)}
                                style={{ padding: "4px 8px", fontSize: 14, background: "none", border: "none", cursor: "pointer" }}
                                title="Deletar"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
