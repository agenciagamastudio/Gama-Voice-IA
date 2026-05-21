"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCatalogo, saveCatalogItem, getPricingConfig } from "@/lib/storage";
import { fmt, genId } from "@/lib/utils";
import type { CatalogItem, PricingConfig } from "@/types/orcamento";

const CATEGORIAS_PADRAO = ["Social Media", "Design Gráfico", "Fotografia / Vídeo", "Consultoria / Estratégia"];

interface CustoVariavel {
  id: string;
  nome: string;
  valor: number;
}

export default function CatalogoEditarPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [step, setStep] = useState(1);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemOriginal, setItemOriginal] = useState<CatalogItem | null>(null);

  // Etapa 1: Identidade
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("Social Media");
  const [descricao, setDescricao] = useState("");

  // Etapa 2: Esforço
  const [tipoPrecificacao, setTipoPrecificacao] = useState<"hora" | "fixo" | "pacote">("hora");
  const [horasEstimadas, setHorasEstimadas] = useState<number>(0);
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
    const config = getPricingConfig();
    setPricingConfig(config);

    const catalogo = getCatalogo();
    const item = catalogo.find((i) => i.id === itemId);

    if (item) {
      setItemOriginal(item);
      setNome(item.nome);
      setCategoria(item.categoria);
      setDescricao(item.descricao || "");
      setTipoPrecificacao(item.tipo_precificacao || "hora");
      setHorasEstimadas(item.horas_estimadas || 0);
      setCustoFixo(item.custo_execucao || 0);
      setMargem(item.margem_pct || config.margem_padrao);
      setPrecoFinal(item.preco || 0);

      // Reconstruir custos variáveis a partir do breakdown
      if (item.custos_variaveis && item.custos_variaveis > 0) {
        setCustosVariaveis([
          {
            id: genId(),
            nome: "Custos Variáveis",
            valor: item.custos_variaveis,
          },
        ]);
      }
    }
  }, [itemId]);

  if (!pricingConfig || !itemOriginal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] flex items-center justify-center">
        <div className="text-center p-10">
          <p className="text-base text-slate-400">Carregando serviço...</p>
        </div>
      </div>
    );
  }

  // Cálculos (idênticos ao novo/page.tsx)
  const custoExecucao =
    tipoPrecificacao === "hora"
      ? (horasEstimadas || 0) * (pricingConfig?.taxa_horaria || 100)
      : tipoPrecificacao === "fixo"
        ? custoFixo
        : custoFixo;

  const totalVariaveis = custosVariaveis.reduce((sum, c) => sum + c.valor, 0);

  let overheadValor = 0;
  let overheadPct = 0;
  if (pricingConfig && pricingConfig.custos_fixos.length > 0) {
    const totalFixo = pricingConfig.custos_fixos.reduce((sum, c) => sum + c.valor_mensal, 0);
    const custoPorProjeto = totalFixo / (pricingConfig.projetos_por_mes || 1);
    const faturamentoMedio = (pricingConfig.taxa_horaria || 100) * (pricingConfig.horas_medias_projeto || 20);
    overheadPct = (custoPorProjeto / faturamentoMedio) * 100;
    overheadValor = custoPorProjeto;
  }

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
    if (tipoPrecificacao === "hora" && horasEstimadas <= 0) {
      novaErro.horas = "Horas estimadas devem ser maior que 0";
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
    const itemAtualizado: CatalogItem = {
      ...itemOriginal,
      nome,
      descricao,
      categoria,
      preco: precoFinal > 0 ? precoFinal : precoCalculado,
      tipo_precificacao: tipoPrecificacao,
      horas_estimadas: tipoPrecificacao === "hora" ? horasEstimadas : undefined,
      custo_execucao: custoExecucao,
      custos_variaveis: totalVariaveis > 0 ? totalVariaveis : undefined,
      overhead_valor: overheadValor > 0 ? overheadValor : undefined,
      overhead_pct: overheadPct > 0 ? overheadPct : undefined,
      margem_pct: margem,
      preco_custo: custoPuro,
    };

    saveCatalogItem(itemAtualizado);
    router.push("/catalogo");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2]">
      {/* Topbar */}
      <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <a href="/catalogo" className="text-slate-500 hover:text-slate-300 transition-colors text-lg cursor-pointer">←</a>
          <span className="font-bold text-sm">Editar Serviço</span>
          <span className="text-xs text-slate-400">Etapa {step} de 5</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-8 pb-12 px-6">
        {/* Etapa 1: Identidade */}
        {step === 1 && (
          <div className="glass glass-card p-8 mb-6">
            <h2 className="text-lg font-bold mb-6 text-white">📝 Identidade do Serviço</h2>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Nome do Serviço
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="ex: Post para Instagram"
                className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors ${
                  errors.nome
                    ? "border border-red-500 bg-red-500/10 text-white focus:border-red-500"
                    : "border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white focus:border-[primary]"
                }`}
              />
              {errors.nome && <div className="text-red-500 text-xs mt-1">{errors.nome}</div>}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary] transition-colors"
              >
                {CATEGORIAS_PADRAO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="ex: Post estático com copywriting e design"
                className="w-full px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary] transition-colors resize-vertical min-h-20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/catalogo")}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-semibold text-xs hover:border-[rgba(148,163,184,0.2)] hover:bg-[rgba(148,163,184,0.1)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 2: Esforço (idêntica ao novo/page.tsx) */}
        {step === 2 && (
          <div className="glass glass-card p-8 mb-6">
            <h2 className="text-lg font-bold mb-6 text-white">⏱️ Esforço & Custo</h2>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 mb-3">
                Tipo de Cobrança
              </label>
              <div className="flex gap-3">
                {(["hora", "fixo", "pacote"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoPrecificacao(tipo)}
                    className={`flex-1 px-4 py-3 rounded-lg text-xs font-semibold transition-colors ${
                      tipoPrecificacao === tipo
                        ? "border-none bg-[primary] text-black"
                        : "border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-400 hover:border-[rgba(148,163,184,0.2)]"
                    }`}
                  >
                    {tipo === "hora" ? "Por Hora" : tipo === "fixo" ? "Preço Fixo" : "Pacote"}
                  </button>
                ))}
              </div>
            </div>

            {tipoPrecificacao === "hora" && (
              <div className="mb-5 p-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Horas Estimadas
                </label>
                <input
                  type="number"
                  value={horasEstimadas || ""}
                  onChange={(e) => setHorasEstimadas(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 6"
                  className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors ${
                    errors.horas
                      ? "border border-red-500 bg-red-500/10 text-white focus:border-red-500"
                      : "border border-[rgba(148,163,184,0.1)] bg-[rgba(15,23,42,0.8)] text-white focus:border-[primary]"
                  }`}
                />
                {errors.horas && <div className="text-red-500 text-xs mt-1">{errors.horas}</div>}
                <div className="text-xs text-slate-500 mt-2">
                  Taxa horária: {fmt(pricingConfig?.taxa_horaria || 100)}/h
                </div>
              </div>
            )}

            {(tipoPrecificacao === "fixo" || tipoPrecificacao === "pacote") && (
              <div className="mb-5 p-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Custo de Execução
                </label>
                <input
                  type="number"
                  value={custoFixo || ""}
                  onChange={(e) => setCustoFixo(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 600"
                  className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors ${
                    errors.custoFixo
                      ? "border border-red-500 bg-red-500/10 text-white focus:border-red-500"
                      : "border border-[rgba(148,163,184,0.1)] bg-[rgba(15,23,42,0.8)] text-white focus:border-[primary]"
                  }`}
                />
                {errors.custoFixo && <div className="text-red-500 text-xs mt-1">{errors.custoFixo}</div>}
              </div>
            )}

            <div className="p-4 bg-[primary]/10 border border-[primary]/30 rounded-lg mb-6">
              <div className="text-xs text-slate-400 mb-1">Custo de Execução:</div>
              <div className="text-xl font-black text-[primary]">{fmt(custoExecucao)}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-semibold text-xs hover:border-[rgba(148,163,184,0.2)] hover:bg-[rgba(148,163,184,0.1)] transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 3: Custos Variáveis */}
        {step === 3 && (
          <div className="glass glass-card p-8 mb-6">
            <h2 className="text-lg font-bold mb-6 text-white">💰 Custos Variáveis</h2>

            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-3">
                Materiais, freelancers, assets, ou qualquer custo adicional específico
              </p>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={novoCustom}
                  onChange={(e) => setNovoCustom(e.target.value)}
                  placeholder="ex: Stock photos"
                  className="col-span-2 px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary] transition-colors"
                />
                <input
                  type="number"
                  value={novoValor || ""}
                  onChange={(e) => setNovoValor(parseFloat(e.target.value) || 0)}
                  placeholder="100"
                  className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary] transition-colors"
                />
              </div>

              <button
                onClick={adicionarCustoVariavel}
                disabled={!novoCustom || novoValor <= 0}
                className={`w-full px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  !novoCustom || novoValor <= 0
                    ? "border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-500 cursor-not-allowed opacity-50"
                    : "border-none bg-[primary] text-black hover:shadow-[0_0_20px_rgba(136,206,17,0.4)]"
                }`}
              >
                + Adicionar
              </button>
            </div>

            {custosVariaveis.length > 0 && (
              <div className="mb-6 p-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg">
                {custosVariaveis.map((custo) => (
                  <div
                    key={custo.id}
                    className="flex justify-between items-center pb-3 mb-3 border-b border-[rgba(148,163,184,0.1)]"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{custo.nome}</div>
                      <div className="text-xs text-slate-500">{fmt(custo.valor)}</div>
                    </div>
                    <button
                      onClick={() => removerCustoVariavel(custo.id)}
                      className="bg-none border-none text-red-500 text-lg hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div className="flex justify-between pt-3">
                  <span className="text-xs font-semibold text-slate-400">Total Variáveis:</span>
                  <span className="text-xs font-black text-[primary]">{fmt(totalVariaveis)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-semibold text-xs hover:border-[rgba(148,163,184,0.2)] hover:bg-[rgba(148,163,184,0.1)] transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Etapa 4: Overhead e Margem */}
        {step === 4 && (
          <div className="glass glass-card p-8 mb-6">
            <h2 className="text-lg font-bold mb-6 text-white">⚙️ Overhead e Margem</h2>

            <div className="mb-6 p-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg">
              <label className="block text-xs font-semibold text-slate-400 mb-3">
                Margem de Lucro (%): {margem}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={margem}
                onChange={(e) => setMargem(parseInt(e.target.value))}
                className="w-full accent-[primary]"
              />
              <div className="text-xs text-slate-500 mt-2">
                Ajuste a margem desejada. O padrão é {pricingConfig?.margem_padrao}%
              </div>
            </div>

            <div className="mb-6 p-4 bg-[primary]/10 border border-[primary]/30 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Custo Total:</div>
                  <div className="text-base font-bold text-white">{fmt(custoPuro)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Margem:</div>
                  <div className="text-base font-bold text-[primary]">{fmt(margemValor)}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-semibold text-slate-400 uppercase mb-3">Resumo do Overhead</div>
              <div className="p-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Overhead por Projeto:</div>
                    <div className="text-lg font-black text-white">{fmt(overheadValor)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Percentual:</div>
                    <div className="text-lg font-black text-slate-300">{overheadPct.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-semibold text-xs hover:border-[rgba(148,163,184,0.2)] hover:bg-[rgba(148,163,184,0.1)] transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handleProximo}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="glass glass-card p-8 mb-6">
            <h2 className="text-lg font-bold mb-6 text-white">✅ Revisão Final</h2>

            <div className="mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-3">Dados Básicos</div>
              <div className="space-y-2 p-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg">
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

            <div className="mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-3">Breakdown de Precificação</div>
              <div className="p-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)] rounded-lg">
                <div className="flex justify-between text-xs mb-2 pb-2 border-b border-[rgba(148,163,184,0.1)]">
                  <span>
                    {tipoPrecificacao === "hora" ? `${horasEstimadas}h × R$ ${(pricingConfig?.taxa_horaria || 100).toFixed(0)}/h` : "Custo de Execução"}
                  </span>
                  <span className="font-semibold">{fmt(custoExecucao)}</span>
                </div>

                {totalVariaveis > 0 && (
                  <div className="flex justify-between text-xs mb-2">
                    <span>Custos Variáveis:</span>
                    <span className="font-semibold">{fmt(totalVariaveis)}</span>
                  </div>
                )}

                {overheadValor > 0 && (
                  <div className="flex justify-between text-xs mb-2">
                    <span>Overhead ({overheadPct.toFixed(1)}%):</span>
                    <span className="font-semibold">{fmt(overheadValor)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold mb-3 pb-3 border-b border-[rgba(148,163,184,0.1)]">
                  <span>Custo Total:</span>
                  <span className="text-white">{fmt(custoPuro)}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span>Margem ({margem}%):</span>
                  <span className="font-semibold text-[primary]">{fmt(margemValor)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-3">Preço Final</div>
              <div className="p-4 bg-[primary]/10 border border-[primary]/30 rounded-lg mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Preço Calculado:</span>
                  <div className="text-3xl font-black text-[primary]">{fmt(precoCalculado)}</div>
                </div>
                <p className="text-xs text-slate-500 mt-3">Você pode ajustar este valor abaixo</p>
              </div>

              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Preço Final Desejado (opcional)
              </label>
              <input
                type="number"
                value={precoFinal || ""}
                onChange={(e) => setPrecoFinal(parseFloat(e.target.value) || 0)}
                placeholder={precoCalculado.toFixed(2)}
                className="w-full px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary] transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 px-4 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-300 font-semibold text-xs hover:border-[rgba(148,163,184,0.2)] hover:bg-[rgba(148,163,184,0.1)] transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handleSalvar}
                className="flex-1 px-4 py-2 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all"
              >
                💾 Salvar Alterações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
