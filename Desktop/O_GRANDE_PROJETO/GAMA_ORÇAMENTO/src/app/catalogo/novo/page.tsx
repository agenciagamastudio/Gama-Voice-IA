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
      <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="relative z-10 text-center">
          <p className="text-slate-400">Carregando configurações de precificação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* Topbar */}
      <div className="relative z-10 border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/catalogo" className="text-slate-400 hover:text-slate-300 transition-colors text-xl font-bold">←</a>
          <span className="font-bold text-white">Novo Serviço/Produto</span>
          <span className="text-xs text-slate-400">Etapa {step} de 5</span>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Etapa 1: Identidade */}
        {step === 1 && (
          <div className="glass glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">📝 Identidade do Serviço</h2>

            <div className="mb-6">
              <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Nome do Serviço
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="ex: Post para Instagram"
                className={`w-full px-3 py-2 rounded-lg border transition-colors text-white placeholder-slate-500 focus:outline-none ${
                  errors.nome
                    ? 'border-[error]/50 bg-[error]/10 focus:border-[error]'
                    : 'border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] focus:border-[primary]/50'
                }`}
              />
              {errors.nome && <div className="text-[error] text-xs mt-1">{errors.nome}</div>}
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white focus:border-[primary]/50 transition-colors focus:outline-none"
              >
                {CATEGORIAS_PADRAO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="ex: Post estático com copywriting e design"
                className="w-full px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white placeholder-slate-500 focus:border-[primary]/50 transition-colors focus:outline-none min-h-[100px] resize-vertical"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/catalogo")}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-medium hover:border-[primary]/50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 2: Esforço */}
        {step === 2 && (
          <div className="glass glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">⏱️ Esforço & Custo</h2>

            <div className="mb-6">
              <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-3">
                Tipo de Cobrança
              </label>
              <div className="flex gap-3">
                {(["hora", "fixo", "pacote"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoPrecificacao(tipo)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      tipoPrecificacao === tipo
                        ? 'bg-[primary] text-black border-none'
                        : 'bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] text-slate-300 hover:border-[primary]/50'
                    }`}
                  >
                    {tipo === "hora" ? "Por Hora" : tipo === "fixo" ? "Preço Fixo" : "Pacote"}
                  </button>
                ))}
              </div>
            </div>

            {tipoPrecificacao === "hora" && (
              <div className="mb-6 p-4 bg-[rgba(148,163,184,0.05)] rounded-lg border border-[rgba(148,163,184,0.1)]">
                <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-3">
                  Tempo Estimado
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Horas</label>
                    <input
                      type="number"
                      value={horas || ""}
                      onChange={(e) => setHoras(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      className={`w-full px-3 py-2 rounded-lg border text-white focus:outline-none transition-colors ${
                        errors.horas
                          ? 'border-[error]/50 bg-[error]/10'
                          : 'border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] focus:border-[primary]/50'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Minutos</label>
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
                      className={`w-full px-3 py-2 rounded-lg border text-white focus:outline-none transition-colors ${
                        errors.horas
                          ? 'border-[error]/50 bg-[error]/10'
                          : 'border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] focus:border-[primary]/50'
                      }`}
                    />
                  </div>
                </div>
                {errors.horas && <div className="text-[error] text-xs mb-2">{errors.horas}</div>}
                <div className="text-xs text-slate-400">
                  Taxa horária: {fmt(pricingConfig?.taxa_horaria || 100)}/h | Total: {totalHoras.toFixed(2)}h
                </div>
              </div>
            )}

            {(tipoPrecificacao === "fixo" || tipoPrecificacao === "pacote") && (
              <div className="mb-6 p-4 bg-[rgba(148,163,184,0.05)] rounded-lg border border-[rgba(148,163,184,0.1)]">
                <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                  Custo de Execução
                </label>
                <input
                  type="number"
                  value={custoFixo || ""}
                  onChange={(e) => setCustoFixo(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 600"
                  className={`w-full px-3 py-2 rounded-lg border text-white focus:outline-none transition-colors ${
                    errors.custoFixo
                      ? 'border-[error]/50 bg-[error]/10'
                      : 'border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] focus:border-[primary]/50'
                  }`}
                />
                {errors.custoFixo && <div className="text-[error] text-xs mt-1">{errors.custoFixo}</div>}
              </div>
            )}

            <div className="p-4 bg-[rgba(136,206,17,0.1)] border border-[primary]/20 rounded-lg mb-8">
              <div className="text-xs text-slate-400 mb-1">Custo de Execução:</div>
              <div className="text-2xl font-black text-[primary]">{fmt(custoExecucao)}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-medium hover:border-[primary]/50 transition-colors text-sm"
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 3: Custos Variáveis */}
        {step === 3 && (
          <div className="glass glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">💰 Custos Variáveis</h2>

            <div className="mb-8">
              <p className="text-xs text-slate-400 mb-4">
                Materiais, freelancers, assets, ou qualquer custo adicional específico
              </p>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={novoCustom}
                  onChange={(e) => setNovoCustom(e.target.value)}
                  placeholder="ex: Stock photos"
                  className="col-span-2 px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white placeholder-slate-500 focus:border-[primary]/50 transition-colors focus:outline-none"
                />
                <input
                  type="number"
                  value={novoValor || ""}
                  onChange={(e) => setNovoValor(parseFloat(e.target.value) || 0)}
                  placeholder="100"
                  className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white placeholder-slate-500 focus:border-[primary]/50 transition-colors focus:outline-none"
                />
              </div>

              <button
                onClick={adicionarCustoVariavel}
                disabled={!novoCustom || novoValor <= 0}
                className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  !novoCustom || novoValor <= 0
                    ? 'bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-[rgba(136,206,17,0.2)] border border-[primary]/30 text-[primary] hover:bg-[rgba(136,206,17,0.3)]'
                }`}
              >
                + Adicionar
              </button>
            </div>

            {custosVariaveis.length > 0 && (
              <div className="mb-8 p-4 bg-[rgba(148,163,184,0.05)] rounded-lg border border-[rgba(148,163,184,0.1)]">
                {custosVariaveis.map((custo) => (
                  <div
                    key={custo.id}
                    className="flex justify-between items-center pb-3 mb-3 border-b border-[rgba(148,163,184,0.1)] last:border-b-0 last:mb-0 last:pb-0"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm">{custo.nome}</div>
                      <div className="text-xs text-slate-400">{fmt(custo.valor)}</div>
                    </div>
                    <button
                      onClick={() => removerCustoVariavel(custo.id)}
                      className="bg-none border-none text-[error] text-lg cursor-pointer hover:text-[error] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div className="flex justify-between pt-3 mt-3 border-t border-[rgba(148,163,184,0.1)]">
                  <span className="font-semibold text-slate-300 text-sm">Total Variáveis:</span>
                  <span className="font-bold text-[primary] text-sm">{fmt(totalVariaveis)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-medium hover:border-[primary]/50 transition-colors text-sm"
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 4: Overhead e Margem */}
        {step === 4 && (
          <div className="glass glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">⚙️ Overhead & Margem</h2>

            {pricingConfig.custos_fixos.length === 0 ? (
              <div className="mb-8 p-4 bg-[rgba(245,158,11,0.1)] rounded-lg border border-[warning]/50">
                <div className="font-semibold text-[warning] mb-2 text-sm">⚠️ Nenhum custo fixo cadastrado</div>
                <p className="text-xs text-slate-400 mb-4">
                  Configure seus custos fixos mensais (software, internet, pessoal) para calcular o overhead automaticamente.
                </p>
                <a
                  href="/configuracoes/precificacao"
                  className="inline-block px-4 py-2 bg-[warning] text-black rounded-lg text-xs font-bold hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
                >
                  ⚙️ Configurar Agora
                </a>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-[rgba(136,206,17,0.1)] rounded-lg border border-[primary]/20">
                <div className="text-xs text-slate-400 mb-1">Overhead Automático:</div>
                <div className="text-2xl font-black text-[primary] mb-1">{fmt(overheadValor)}</div>
                <div className="text-xs text-slate-400">{overheadPct.toFixed(1)}% dos custos fixos mensais</div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <label className="text-xs uppercase text-slate-400 font-bold tracking-wider">Margem de Lucro</label>
                <div className="font-bold text-[primary]">{margem}%</div>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={margem}
                onChange={(e) => setMargem(parseInt(e.target.value))}
                className="w-full accent-[primary]"
              />
              <div className="text-xs text-slate-400 mt-2">
                A margem padrão da configuração é {pricingConfig.margem_padrao}%. Você pode ajustar aqui por serviço.
              </div>
            </div>

            <div className="p-4 bg-[rgba(136,206,17,0.1)] rounded-lg border border-[primary]/20 mb-8">
              <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Breakdown:</div>
              <div className="flex justify-between text-xs mb-2">
                <span>Custo de Execução:</span>
                <span className="text-slate-300">{fmt(custoExecucao)}</span>
              </div>
              {totalVariaveis > 0 && (
                <div className="flex justify-between text-xs mb-2">
                  <span>Custos Variáveis:</span>
                  <span className="text-slate-300">{fmt(totalVariaveis)}</span>
                </div>
              )}
              {overheadValor > 0 && (
                <div className="flex justify-between text-xs mb-2">
                  <span>Overhead:</span>
                  <span className="text-slate-300">{fmt(overheadValor)}</span>
                </div>
              )}
              <div className="border-t border-[primary]/20 pt-2 flex justify-between text-xs mb-2">
                <span className="font-semibold">Custo Total:</span>
                <span className="font-bold text-white">{fmt(custoPuro)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Margem ({margem}%):</span>
                <span className="font-semibold text-[primary]">{fmt(margemValor)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-medium hover:border-[primary]/50 transition-colors text-sm"
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 5: Revisão */}
        {step === 5 && (
          <div className="glass glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">✅ Revisão Final</h2>

            {/* Dados Básicos */}
            <div className="mb-8">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-3">Dados Básicos</div>
              <div className="space-y-2 p-4 bg-[rgba(148,163,184,0.05)] rounded-lg border border-[rgba(148,163,184,0.1)]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nome:</span>
                  <span className="font-semibold text-white">{nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Categoria:</span>
                  <span className="font-semibold text-white">{categoria}</span>
                </div>
                {descricao && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Descrição:</span>
                    <span className="font-semibold text-white">{descricao}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown Completo */}
            <div className="mb-8">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-3">Breakdown de Precificação</div>
              <div className="p-4 bg-[rgba(148,163,184,0.05)] rounded-lg border border-[rgba(148,163,184,0.1)] space-y-2">
                <div className="flex justify-between text-xs pb-2 border-b border-[rgba(148,163,184,0.1)]">
                  <span>
                    {tipoPrecificacao === "hora"
                      ? `${horas > 0 ? horas + "h" : ""}${minutos > 0 ? (horas > 0 ? " " : "") + minutos + "min" : ""} × R$ ${(pricingConfig?.taxa_horaria || 100).toFixed(0)}/h`
                      : "Custo de Execução"}
                  </span>
                  <span className="font-semibold">{fmt(custoExecucao)}</span>
                </div>

                {totalVariaveis > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Custos Variáveis:</span>
                    <span className="font-semibold">{fmt(totalVariaveis)}</span>
                  </div>
                )}

                {overheadValor > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Overhead ({overheadPct.toFixed(1)}%):</span>
                    <span className="font-semibold">{fmt(overheadValor)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[rgba(148,163,184,0.1)]">
                  <span>Custo Total:</span>
                  <span className="text-white">{fmt(custoPuro)}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span>Margem ({margem}%):</span>
                  <span className="font-semibold text-[primary]">{fmt(margemValor)}</span>
                </div>
              </div>
            </div>

            {/* Preço Final */}
            <div className="mb-8">
              <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-3">Preço Final</div>
              <div className="p-4 bg-[rgba(136,206,17,0.1)] rounded-lg border border-[primary]/20 mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Preço Calculado:</span>
                  <div className="text-3xl font-black text-[primary]">{fmt(precoCalculado)}</div>
                </div>
                <p className="text-xs text-slate-400 mt-3">Você pode ajustar este valor abaixo (ex: para arredondamento)</p>
              </div>

              <label className="block text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
                Preço Final Desejado (opcional)
              </label>
              <input
                type="number"
                value={precoFinal || ""}
                onChange={(e) => setPrecoFinal(parseFloat(e.target.value) || 0)}
                placeholder={precoCalculado.toFixed(2)}
                className="w-full px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white placeholder-slate-500 focus:border-[primary]/50 transition-colors focus:outline-none mb-2"
              />
              <div className="text-xs text-slate-400 mb-8">
                Se deixar vazio, usaremos o preço calculado
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-medium hover:border-[primary]/50 transition-colors text-sm"
              >
                ← Voltar
              </button>
              <button
                onClick={handleSalvar}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm"
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
