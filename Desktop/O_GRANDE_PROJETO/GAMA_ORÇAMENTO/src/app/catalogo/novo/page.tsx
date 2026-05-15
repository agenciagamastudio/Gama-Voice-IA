"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCatalogo, saveCatalogItem, getPricingConfig } from "@/lib/storage";
import { fmt, genId } from "@/lib/utils";
import type { CatalogItem, PricingConfig } from "@/types/orcamento";

const CATEGORIAS_PADRAO = ["Social Media", "Design Gráfico", "Fotografia / Vídeo", "Consultoria / Estratégia"];

interface CustoVariavel {
  id: string;
  nome: string;
  valor: number;
}

export default function CatalogoNovoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Etapa 1: Identidade
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Social Media");
  const [descricao, setDescricao] = useState("");

  // Etapa 2: Esforço
  const [tipoPrecificacao, setTipoPrecificacao] = useState<"hora" | "fixo" | "pacote">("hora");
  const [horas, setHoras] = useState<number>(0);
  const [minutos, setMinutos] = useState<number>(0);
  const [custoFixo, setCustoFixo] = useState<number>(0);

  // Etapa 3: Custos Variáveis
  const [custosVariaveis, setCustosVariaveis] = useState<CustoVariavel[]>([]);
  const [novoCustom, setNovoCustom] = useState("");
  const [novoValor, setNovoValor] = useState<number>(0);

  // Etapa 4: Overhead e Margem
  const [margem, setMargem] = useState(30);

  // Etapa 5: Revisão
  const [precoFinal, setPrecoFinal] = useState<number>(0);

  useEffect(() => {
    setPricingConfig(getPricingConfig());
  }, []);

  // Cálculos
  const totalHoras = horas + minutos / 60;
  const custoExecucao =
    tipoPrecificacao === "hora"
      ? totalHoras * (pricingConfig?.taxa_horaria || 100)
      : tipoPrecificacao === "fixo"
        ? custoFixo
        : custoFixo;

  const totalVariaveis = custosVariaveis.reduce((sum, c) => sum + c.valor, 0);

  // Overhead automático (baseado em unidades de faturamento)
  let overheadValor = 0;
  let overheadPct = 0;
  if (pricingConfig && pricingConfig.custos_fixos.length > 0) {
    const totalFixo = pricingConfig.custos_fixos.reduce((sum, c) => sum + c.valor_mensal, 0);
    const totalUnidades = (pricingConfig.unidades_faturamento?.projetos_fechados || 0) +
                          (pricingConfig.unidades_faturamento?.servicos_soltos || 0) +
                          (pricingConfig.unidades_faturamento?.pacotes_combos || 0) +
                          (pricingConfig.unidades_faturamento?.consultoria_hora || 0);

    if (totalUnidades > 0) {
      overheadValor = totalFixo / totalUnidades;
      const faturamentoMedio = custoExecucao > 0 ? custoExecucao : (pricingConfig.taxa_horaria || 100) * 1;
      overheadPct = faturamentoMedio > 0 ? (overheadValor / faturamentoMedio) * 100 : 0;
    }
  }

  // Preço final cálculo
  const custoPuro = custoExecucao + totalVariaveis + overheadValor;
  const margemValor = custoPuro * (margem / 100);
  const precoCalculado = custoPuro + margemValor;

  const adicionarCustoVariavel = () => {
    if (!novoCustom || novoValor <= 0) return;
    setCustosVariaveis([
      ...custosVariaveis,
      { id: genId(), nome: novoCustom, valor: novoValor },
    ]);
    setNovoCustom("");
    setNovoValor(0);
  };

  const removerCustoVariavel = (id: string) => {
    setCustosVariaveis(custosVariaveis.filter((c) => c.id !== id));
  };

  const validarEtapa1 = (): boolean => {
    const novaErro: Record<string, string> = {};
    if (!nome.trim()) novaErro.nome = "Nome é obrigatório";
    setErrors(novaErro);
    return Object.keys(novaErro).length === 0;
  };

  const validarEtapa2 = (): boolean => {
    const novaErro: Record<string, string> = {};
    if (tipoPrecificacao === "hora" && horas === 0 && minutos === 0) {
      novaErro.horas = "Informe pelo menos 1 minuto";
    } else if ((tipoPrecificacao === "fixo" || tipoPrecificacao === "pacote") && custoFixo <= 0) {
      novaErro.custoFixo = "Custo deve ser maior que 0";
    }
    setErrors(novaErro);
    return Object.keys(novaErro).length === 0;
  };

  const handleProximo = () => {
    if (step === 1 && !validarEtapa1()) return;
    if (step === 2 && !validarEtapa2()) return;
    setErrors({});
    setStep(step + 1);
  };

  const handleVoltar = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSalvar = () => {
    const novoItem: CatalogItem = {
      id: genId(),
      nome,
      descricao,
      categoria,
      preco: precoFinal > 0 ? precoFinal : precoCalculado,
      tipo_precificacao: tipoPrecificacao,
      horas_estimadas: tipoPrecificacao === "hora" ? totalHoras : undefined,
      custo_execucao: custoExecucao,
      custos_variaveis: totalVariaveis > 0 ? totalVariaveis : undefined,
      overhead_valor: overheadValor > 0 ? overheadValor : undefined,
      overhead_pct: overheadPct > 0 ? overheadPct : undefined,
      margem_pct: margem,
      preco_custo: custoPuro,
    };

    saveCatalogItem(novoItem);
    router.push("/catalogo");
  };

  if (!pricingConfig) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: 16, color: "var(--text-2)" }}>Carregando configurações de precificação...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/catalogo" style={{ color: "var(--text-3)", fontSize: 18, cursor: "pointer" }}>←</a>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Novo Serviço/Produto</span>
          <span style={{ fontSize: 12, color: "var(--text-2)" }}>Etapa {step} de 5</span>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 24px" }}>
        {/* Etapa 1: Identidade */}
        {step === 1 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 32, border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>📝 Identidade do Serviço</h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 8 }}>
                Nome do Serviço
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="ex: Post para Instagram"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: errors.nome ? "1px solid #e11d48" : "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              />
              {errors.nome && <div style={{ color: "#e11d48", fontSize: 12, marginTop: 4 }}>{errors.nome}</div>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 8 }}>
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              >
                {CATEGORIAS_PADRAO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 8 }}>
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="ex: Post estático com copywriting e design"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontSize: 14,
                  minHeight: 80,
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => router.push("/catalogo")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleProximo}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--primary)",
                  color: "#0a0a0a",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 2: Esforço */}
        {step === 2 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 32, border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>⏱️ Esforço & Custo</h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 12 }}>
                Tipo de Cobrança
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {(["hora", "fixo", "pacote"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoPrecificacao(tipo)}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "var(--radius-sm)",
                      border: tipoPrecificacao === tipo ? "none" : "1px solid var(--border)",
                      background: tipoPrecificacao === tipo ? "var(--primary)" : "var(--surface-2)",
                      color: tipoPrecificacao === tipo ? "#0a0a0a" : "var(--text-2)",
                      fontWeight: tipoPrecificacao === tipo ? 700 : 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {tipo === "hora" ? "Por Hora" : tipo === "fixo" ? "Preço Fixo" : "Pacote"}
                  </button>
                ))}
              </div>
            </div>

            {tipoPrecificacao === "hora" && (
              <div style={{ marginBottom: 20, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 12 }}>
                  Tempo Estimado
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6 }}>
                      Horas
                    </label>
                    <input
                      type="number"
                      value={horas || ""}
                      onChange={(e) => setHoras(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: errors.horas ? "1px solid #e11d48" : "1px solid var(--border)",
                        borderRadius: 8,
                        background: "var(--surface)",
                        color: "var(--text)",
                        fontSize: 14,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-3)", display: "block", marginBottom: 6 }}>
                      Minutos
                    </label>
                    <input
                      type="number"
                      value={minutos || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setMinutos(Math.max(0, Math.min(59, val)));
                      }}
                      placeholder="0"
                      min="0"
                      max="59"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: errors.horas ? "1px solid #e11d48" : "1px solid var(--border)",
                        borderRadius: 8,
                        background: "var(--surface)",
                        color: "var(--text)",
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>
                {errors.horas && <div style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.horas}</div>}
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  Taxa horária: {fmt(pricingConfig?.taxa_horaria || 100)}/h | Total: {totalHoras.toFixed(2)}h
                </div>
              </div>
            )}

            {(tipoPrecificacao === "fixo" || tipoPrecificacao === "pacote") && (
              <div style={{ marginBottom: 20, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 8 }}>
                  Custo de Execução
                </label>
                <input
                  type="number"
                  value={custoFixo || ""}
                  onChange={(e) => setCustoFixo(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 600"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: errors.custoFixo ? "1px solid #e11d48" : "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontSize: 14,
                  }}
                />
                {errors.custoFixo && <div style={{ color: "#e11d48", fontSize: 12, marginTop: 4 }}>{errors.custoFixo}</div>}
              </div>
            )}

            <div style={{ padding: 16, background: "rgba(136, 206, 17, 0.1)", borderRadius: 8, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Custo de Execução:</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>{fmt(custoExecucao)}</div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleVoltar}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--primary)",
                  color: "#0a0a0a",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 3: Custos Variáveis */}
        {step === 3 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 32, border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>💰 Custos Variáveis</h2>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>
                Materiais, freelancers, assets, ou qualquer custo adicional específico
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 12 }}>
                <input
                  type="text"
                  value={novoCustom}
                  onChange={(e) => setNovoCustom(e.target.value)}
                  placeholder="ex: Stock photos"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: 14,
                  }}
                />
                <input
                  type="number"
                  value={novoValor || ""}
                  onChange={(e) => setNovoValor(parseFloat(e.target.value) || 0)}
                  placeholder="100"
                  style={{
                    width: 100,
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    fontSize: 14,
                  }}
                />
              </div>

              <button
                onClick={adicionarCustoVariavel}
                disabled={!novoCustom || novoValor <= 0}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: !novoCustom || novoValor <= 0 ? "not-allowed" : "pointer",
                  opacity: !novoCustom || novoValor <= 0 ? 0.5 : 1,
                }}
              >
                + Adicionar
              </button>
            </div>

            {custosVariaveis.length > 0 && (
              <div style={{ marginBottom: 24, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
                {custosVariaveis.map((custo) => (
                  <div
                    key={custo.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: 12,
                      marginBottom: 12,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{custo.nome}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{fmt(custo.valor)}</div>
                    </div>
                    <button
                      onClick={() => removerCustoVariavel(custo.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e11d48",
                        fontSize: 16,
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Total Variáveis:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{fmt(totalVariaveis)}</span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleVoltar}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--primary)",
                  color: "#0a0a0a",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 4: Overhead e Margem */}
        {step === 4 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 32, border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>⚙️ Overhead & Margem</h2>

            {pricingConfig.custos_fixos.length === 0 ? (
              <div style={{ marginBottom: 24, padding: 16, background: "rgba(245, 158, 11, 0.1)", borderRadius: 8, border: "1px solid #f59e0b" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", marginBottom: 8 }}>⚠️ Nenhum custo fixo cadastrado</div>
                <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>
                  Configure seus custos fixos mensais (software, internet, pessoal) para calcular o overhead automaticamente.
                </p>
                <a
                  href="/configuracoes/precificacao"
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "#f59e0b",
                    color: "#0a0a0a",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  ⚙️ Configurar Agora
                </a>
              </div>
            ) : (
              <div style={{ marginBottom: 24, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Overhead Automático:</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>{fmt(overheadValor)}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{overheadPct.toFixed(1)}% dos custos fixos mensais</div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Margem de Lucro</label>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{margem}%</div>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={margem}
                onChange={(e) => setMargem(parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
                A margem padrão da configuração é {pricingConfig.margem_padrao}%. Você pode ajustar aqui por serviço.
              </div>
            </div>

            <div style={{ padding: 16, background: "rgba(136, 206, 17, 0.1)", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 12 }}>Breakdown:</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span>Custo de Execução:</span>
                <span style={{ color: "var(--text-2)" }}>{fmt(custoExecucao)}</span>
              </div>
              {totalVariaveis > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                  <span>Custos Variáveis:</span>
                  <span style={{ color: "var(--text-2)" }}>{fmt(totalVariaveis)}</span>
                </div>
              )}
              {overheadValor > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                  <span>Overhead:</span>
                  <span style={{ color: "var(--text-2)" }}>{fmt(overheadValor)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Custo Total:</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{fmt(custoPuro)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>Margem ({margem}%):</span>
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>{fmt(margemValor)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={handleVoltar}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--primary)",
                  color: "#0a0a0a",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 5: Revisão */}
        {step === 5 && (
          <div style={{ background: "var(--surface)", borderRadius: 12, padding: 32, border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--text)" }}>✅ Revisão Final</h2>

            {/* Dados Básicos */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Dados Básicos</div>
              <div style={{ display: "grid", gap: 8, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-2)" }}>Nome:</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{nome}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-2)" }}>Categoria:</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{categoria}</span>
                </div>
                {descricao && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-2)" }}>Descrição:</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{descricao}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown Completo */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Breakdown de Precificação</div>
              <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
                  <span>
                    {tipoPrecificacao === "hora"
                      ? `${horas > 0 ? horas + "h" : ""}${minutos > 0 ? (horas > 0 ? " " : "") + minutos + "min" : ""} × R$ ${(pricingConfig?.taxa_horaria || 100).toFixed(0)}/h`
                      : "Custo de Execução"}
                  </span>
                  <span style={{ fontWeight: 600 }}>{fmt(custoExecucao)}</span>
                </div>

                {totalVariaveis > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                    <span>Custos Variáveis:</span>
                    <span style={{ fontWeight: 600 }}>{fmt(totalVariaveis)}</span>
                  </div>
                )}

                {overheadValor > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                    <span>Overhead ({overheadPct.toFixed(1)}%):</span>
                    <span style={{ fontWeight: 600 }}>{fmt(overheadValor)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <span>Custo Total:</span>
                  <span style={{ color: "var(--text)" }}>{fmt(custoPuro)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                  <span>Margem ({margem}%):</span>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>{fmt(margemValor)}</span>
                </div>
              </div>
            </div>

            {/* Preço Final */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Preço Final</div>
              <div style={{ padding: 16, background: "rgba(136, 206, 17, 0.1)", borderRadius: 8, border: "1px solid var(--primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Preço Calculado:</span>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--primary)" }}>{fmt(precoCalculado)}</div>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 12 }}>Você pode ajustar este valor abaixo (ex: para arredondamento)</p>
              </div>

              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginTop: 12, marginBottom: 6 }}>
                Preço Final Desejado (opcional)
              </label>
              <input
                type="number"
                value={precoFinal || ""}
                onChange={(e) => setPrecoFinal(parseFloat(e.target.value) || 0)}
                placeholder={precoCalculado.toFixed(2)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              />
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                Se deixar vazio, usaremos o preço calculado
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleVoltar}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-2)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Voltar
              </button>
              <button
                onClick={handleSalvar}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "var(--primary)",
                  color: "#0a0a0a",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                💾 Salvar Serviço
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
