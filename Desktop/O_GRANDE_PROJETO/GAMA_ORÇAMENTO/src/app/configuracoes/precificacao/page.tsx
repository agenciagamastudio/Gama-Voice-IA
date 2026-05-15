"use client";

import { useState, useEffect } from "react";
import { getPricingConfig, savePricingConfig, PRICING_DEFAULT } from "@/lib/storage";
import type { PricingConfig, CustoFixo } from "@/types/orcamento";
import { genId, fmt } from "@/lib/utils";

const SUGESTOES_CUSTOS = [
  { nome: "Adobe Creative Suite", categoria: "software" as const, valor_sugerido: 300 },
  { nome: "Figma Pro", categoria: "software" as const, valor_sugerido: 90 },
  { nome: "Canva Pro", categoria: "software" as const, valor_sugerido: 55 },
  { nome: "Google Workspace", categoria: "software" as const, valor_sugerido: 35 },
  { nome: "Internet", categoria: "infra" as const, valor_sugerido: 150 },
  { nome: "Celular (plano)", categoria: "infra" as const, valor_sugerido: 80 },
  { nome: "Energia elétrica", categoria: "infra" as const, valor_sugerido: 200 },
];

export default function ConfiguraPrecificacaoPage() {
  const [cfg, setCfg] = useState<PricingConfig>(PRICING_DEFAULT);
  const [saved, setSaved] = useState(false);
  const [newCustoNome, setNewCustoNome] = useState("");
  const [newCustoValor, setNewCustoValor] = useState("");
  const [newCustoCategoria, setNewCustoCategoria] = useState<"software" | "infra" | "pessoal" | "outro">("software");
  const [editingCustoId, setEditingCustoId] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState<string>("");
  const [editingCategoria, setEditingCategoria] = useState<"software" | "infra" | "pessoal" | "outro">("software");
  const [editingValor, setEditingValor] = useState<string>("");

  useEffect(() => {
    setCfg(getPricingConfig());
  }, []);

  const handleSave = () => {
    savePricingConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddCusto = () => {
    if (!newCustoNome || !newCustoValor) return;
    const newCusto: CustoFixo = {
      id: genId(),
      nome: newCustoNome,
      valor_mensal: parseFloat(newCustoValor),
      categoria: newCustoCategoria,
    };
    setCfg({ ...cfg, custos_fixos: [...cfg.custos_fixos, newCusto] });
    setNewCustoNome("");
    setNewCustoValor("");
  };

  const handleRemoveCusto = (id: string) => {
    setCfg({ ...cfg, custos_fixos: cfg.custos_fixos.filter((c) => c.id !== id) });
  };

  const handleStartEdit = (id: string, nome: string, categoria: "software" | "infra" | "pessoal" | "outro", valor: number) => {
    setEditingCustoId(id);
    setEditingNome(nome);
    setEditingCategoria(categoria);
    setEditingValor(valor.toString());
  };

  const handleSaveEdit = (id: string) => {
    const novoValor = parseFloat(editingValor) || 0;
    if (editingNome.trim() && novoValor > 0) {
      setCfg({
        ...cfg,
        custos_fixos: cfg.custos_fixos.map((c) =>
          c.id === id ? { ...c, nome: editingNome, categoria: editingCategoria, valor_mensal: novoValor } : c
        ),
      });
    }
    setEditingCustoId(null);
    setEditingNome("");
    setEditingCategoria("software");
    setEditingValor("");
  };

  const handleCancelEdit = () => {
    setEditingCustoId(null);
    setEditingNome("");
    setEditingCategoria("software");
    setEditingValor("");
  };

  const handleAddSugestao = (nome: string, valor: number) => {
    if (cfg.custos_fixos.some((c) => c.nome === nome)) return;
    const newCusto: CustoFixo = { id: genId(), nome, valor_mensal: valor, categoria: "software" };
    setCfg({ ...cfg, custos_fixos: [...cfg.custos_fixos, newCusto] });
  };

  const totalCustoFixo = cfg.custos_fixos.reduce((s, c) => s + c.valor_mensal, 0);
  const totalUnidades = (cfg.unidades_faturamento?.projetos_fechados || 0) +
                        (cfg.unidades_faturamento?.servicos_soltos || 0) +
                        (cfg.unidades_faturamento?.pacotes_combos || 0) +
                        (cfg.unidades_faturamento?.consultoria_hora || 0);
  const overheadPorUnidade = totalUnidades > 0 ? totalCustoFixo / totalUnidades : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/catalogo" style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Configuração de Precificação</span>
          {saved && <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✓ Salvo!</span>}
        </div>
        <button onClick={handleSave} style={{ padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          Salvar Configuração
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px" }}>
        {/* Explicação */}
        <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 12, padding: 16, marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "#854d0e", fontWeight: 600, margin: "0 0 8px 0" }}>💡 Como funciona</p>
          <p style={{ fontSize: 12, color: "#854d0e", lineHeight: 1.6, margin: 0 }}>
            Aqui você configura seus custos fixos <strong>uma vez</strong>. Depois, quando criar serviços no catálogo, o sistema calcula automaticamente quanto cada projeto precisa cobrir de overhead. Nunca mais você esquece um custo fixo!
          </p>
        </div>

        {/* Section 1: Taxa Horária */}
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px 0", color: "var(--text)" }}>💰 Taxa Horária</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Quanto você cobra por hora?</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  value={cfg.taxa_horaria}
                  onChange={(e) => setCfg({ ...cfg, taxa_horaria: parseFloat(e.target.value) || 0 })}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
                />
                <span style={{ display: "flex", alignItems: "center", color: "var(--text-2)", fontWeight: 600 }}>R$/h</span>
              </div>
            </label>
            <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>Base para calcular custo de execução de serviços por hora</p>
          </div>
        </div>

        {/* Section 2: Unidades de Faturamento */}
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px 0", color: "var(--text)" }}>📊 Unidades de Faturamento</h2>
          <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 16px 0", lineHeight: 1.6 }}>
            Quantas unidades de faturamento você tem por mês? Os custos fixos serão distribuídos entre TODAS as unidades (projetos fechados, serviços soltos, pacotes/combos e consultoria).
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Projetos Fechados</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.projetos_fechados || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    projetos_fechados: parseInt(e.target.value) || 0
                  }
                })}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
              />
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>Contratos/projetos completos</span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Serviços Soltos</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.servicos_soltos || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    servicos_soltos: parseInt(e.target.value) || 0
                  }
                })}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
              />
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>Posts, stories, pequenos trabalhos</span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Pacotes/Combos</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.pacotes_combos || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    pacotes_combos: parseInt(e.target.value) || 0
                  }
                })}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
              />
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>Pacotes de serviços pré-definidos</span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Consultoria/Hora</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.consultoria_hora || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    consultoria_hora: parseInt(e.target.value) || 0
                  }
                })}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13 }}
              />
              <span style={{ fontSize: 10, color: "var(--text-3)" }}>Horas de consultoria/atendimento</span>
            </label>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "12px 0 0 0" }}>💡 O overhead será distribuído entre TODAS as unidades, não apenas "projetos"</p>
        </div>

        {/* Section 3: Custos Fixos */}
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px 0", color: "var(--text)" }}>📌 Custos Fixos Mensais</h2>

          {/* Sugestões prontas */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", margin: "0 0 8px 0" }}>Sugestões (clique para adicionar)</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUGESTOES_CUSTOS.map((s) => (
                <button
                  key={s.nome}
                  onClick={() => handleAddSugestao(s.nome, s.valor_sugerido)}
                  disabled={cfg.custos_fixos.some((c) => c.nome === s.nome)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    background: cfg.custos_fixos.some((c) => c.nome === s.nome) ? "var(--border)" : "var(--surface-2)",
                    color: cfg.custos_fixos.some((c) => c.nome === s.nome) ? "var(--text-3)" : "var(--text)",
                    fontSize: 11,
                    cursor: cfg.custos_fixos.some((c) => c.nome === s.nome) ? "default" : "pointer",
                    opacity: cfg.custos_fixos.some((c) => c.nome === s.nome) ? 0.5 : 1,
                  }}
                >
                  {s.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de custos */}
          {cfg.custos_fixos.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", margin: "0 0 8px 0" }}>Seus custos</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cfg.custos_fixos.map((custo) => (
                  <div
                    key={custo.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: editingCustoId === custo.id ? "flex-start" : "center",
                      padding: "12px",
                      background: editingCustoId === custo.id ? "var(--primary)/10" : "var(--surface-2)",
                      borderRadius: "var(--radius-sm)",
                      border: editingCustoId === custo.id ? "1px solid var(--primary)" : "none",
                    }}
                  >
                    {editingCustoId === custo.id ? (
                      // Modo edição
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginRight: 12 }}>
                        <input
                          type="text"
                          placeholder="Nome do custo"
                          value={editingNome}
                          onChange={(e) => setEditingNome(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(custo.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          autoFocus
                          style={{
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--primary)",
                            background: "var(--surface)",
                            color: "var(--text)",
                            fontSize: 12,
                          }}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <select
                            value={editingCategoria}
                            onChange={(e) => setEditingCategoria(e.target.value as any)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--primary)",
                              background: "var(--surface)",
                              color: "var(--text)",
                              fontSize: 12,
                            }}
                          >
                            <option value="software">Software</option>
                            <option value="infra">Infraestrutura</option>
                            <option value="pessoal">Pessoal</option>
                            <option value="outro">Outro</option>
                          </select>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 12, color: "var(--text-2)" }}>R$</span>
                            <input
                              type="number"
                              value={editingValor}
                              onChange={(e) => setEditingValor(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(custo.id);
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                              style={{
                                flex: 1,
                                padding: "6px 8px",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--primary)",
                                background: "var(--surface)",
                                color: "var(--text)",
                                fontSize: 12,
                              }}
                            />
                            <span style={{ fontSize: 12, color: "var(--text-2)" }}>/mês</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleSaveEdit(custo.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--success)",
                              cursor: "pointer",
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            ✓ Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-3)",
                              cursor: "pointer",
                              fontSize: 14,
                            }}
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo visualização
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{custo.nome}</div>
                          <div style={{ fontSize: 11, color: "var(--text-3)" }}>{custo.categoria}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <button
                            onClick={() => handleStartEdit(custo.id, custo.nome, custo.categoria, custo.valor_mensal)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--primary)",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            {fmt(custo.valor_mensal)}/mês
                          </button>
                          <button
                            onClick={() => handleRemoveCusto(custo.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-3)",
                              cursor: "pointer",
                              fontSize: 16,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar novo custo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: 8 }}>
            <input
              type="text"
              placeholder="Nome do custo"
              value={newCustoNome}
              onChange={(e) => setNewCustoNome(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 12 }}
            />
            <select
              value={newCustoCategoria}
              onChange={(e) => setNewCustoCategoria(e.target.value as any)}
              style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 12 }}
            >
              <option value="software">Software</option>
              <option value="infra">Infraestrutura</option>
              <option value="pessoal">Pessoal</option>
              <option value="outro">Outro</option>
            </select>
            <input
              type="number"
              placeholder="Valor mensal"
              value={newCustoValor}
              onChange={(e) => setNewCustoValor(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 12 }}
            />
            <button
              onClick={handleAddCusto}
              disabled={!newCustoNome || !newCustoValor}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: newCustoNome && newCustoValor ? "var(--primary)" : "var(--border)",
                color: "#0a0a0a",
                fontSize: 12,
                fontWeight: 700,
                cursor: newCustoNome && newCustoValor ? "pointer" : "default",
              }}
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* Section 4: Margem Padrão */}
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px 0", color: "var(--text)" }}>📈 Margem Padrão</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="range"
              min="0"
              max="60"
              value={cfg.margem_padrao}
              onChange={(e) => setCfg({ ...cfg, margem_padrao: parseInt(e.target.value) })}
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text)" }}>Seu lucro padrão: <strong style={{ color: "var(--primary)" }}>{cfg.margem_padrao}%</strong></span>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>Se custo = R$ 1000, você ganha R$ {Math.round((cfg.margem_padrao / 100) * 1000)}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Resumo */}
        <div style={{ background: "linear-gradient(135deg, var(--primary)20, transparent)", borderRadius: 12, padding: 24, border: "1px solid var(--primary)50" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px 0", color: "var(--text)" }}>📊 Resumo do Overhead</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px 0" }}>Total de custos fixos/mês</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", margin: 0 }}>{fmt(totalCustoFixo)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px 0" }}>Total de unidades</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", margin: 0 }}>{totalUnidades}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px 0" }}>Overhead por unidade</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", margin: 0 }}>{fmt(overheadPorUnidade)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px 0" }}>Margem padrão</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", margin: 0 }}>{cfg.margem_padrao}%</p>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--primary)30" }}>
            <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0 }}>
              💡 <strong>Como funciona:</strong> Custos fixos totais (R$ {fmt(totalCustoFixo)}) divididos entre suas {totalUnidades} unidade{totalUnidades !== 1 ? 's' : ''} = R$ {fmt(overheadPorUnidade)} por unidade.
              Esse overhead será adicionado automaticamente a cada serviço quando você criar orçamentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
