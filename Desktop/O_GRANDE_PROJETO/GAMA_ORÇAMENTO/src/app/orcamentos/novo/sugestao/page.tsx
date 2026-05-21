"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrcamentoEmEdicao {
  clienteId: string;
  tagContexto: string;
  itens: Array<{ entregavelId: string; quantidade: number; precoFloor: number }>;
  precoFloorTotal: number;
}

interface SugestaoLente {
  valor: number;
  fonte: "historico" | "fallback_tag";
  amostras: number;
  tagUsada?: string;
}

interface SugestaoPreco {
  mediaHistorica: SugestaoLente;
  multiplicador: SugestaoLente;
  faixaSegmentada: SugestaoLente;
  convergencia: "total" | "parcial" | "divergente" | "sem_dados";
  variacao?: number;
}

export default function SugestaoPrecoPage() {
  const router = useRouter();
  const [orcamento, setOrcamento] = useState<OrcamentoEmEdicao | null>(null);
  const [sugestao, setSugestao] = useState<SugestaoPreco | null>(null);
  const [precoPraticado, setPrecoPraticado] = useState<number>(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const dados = sessionStorage.getItem("orcamentoEmEdicao");
    if (!dados) {
      router.push("/orcamentos/novo");
      return;
    }

    const orcamentoData = JSON.parse(dados) as OrcamentoEmEdicao;
    setOrcamento(orcamentoData);

    // Chamar API para gerar sugestões
    const carregarSugestoes = async () => {
      try {
        // Buscar templateId do sessionStorage
        let templateId = sessionStorage.getItem("templateId");

        // Fallback: se templateId não existe, gerar sugestão padrão baseada no modo
        if (!templateId) {
          const modo = sessionStorage.getItem("modo");
          if (modo === "construcao") {
            // Gerar sugestão default com multiplicador padrão (sem histórico)
            const sugestaoDefault: SugestaoPreco = {
              mediaHistorica: {
                valor: orcamentoData.precoFloorTotal * 1.45,
                fonte: "fallback_tag",
                amostras: 0,
                tagUsada: orcamentoData.tagContexto,
              },
              multiplicador: {
                valor: orcamentoData.precoFloorTotal * 1.65,
                fonte: "fallback_tag",
                amostras: 0,
              },
              faixaSegmentada: {
                valor: orcamentoData.precoFloorTotal * 1.55,
                fonte: "fallback_tag",
                amostras: 0,
                tagUsada: orcamentoData.tagContexto,
              },
              convergencia: "sem_dados",
            };
            setSugestao(sugestaoDefault);
            setPrecoPraticado(sugestaoDefault.multiplicador.valor);
            setCarregando(false);
            return;
          }
          throw new Error("templateId e modo não encontrados");
        }

        const response = await fetch(
          `/api/sugestoes?templateId=${templateId}&clienteId=${orcamentoData.clienteId}&floor=${orcamentoData.precoFloorTotal}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const sugestoes: SugestaoPreco = await response.json();
        setSugestao(sugestoes);
        // Seleciona o multiplicador como default (mais robusto)
        setPrecoPraticado(sugestoes.multiplicador.valor);
      } catch (error) {
        console.error("Erro ao carregar sugestões:", error);
        // Fallback: mantém a página funcional mesmo sem API
        setCarregando(false);
      } finally {
        setCarregando(false);
      }
    };

    carregarSugestoes();
  }, [router]);

  if (carregando || !orcamento || !sugestao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 relative overflow-hidden flex items-center justify-center">
        <p className="text-slate-400 text-lg">Carregando sugestões de preço...</p>
      </div>
    );
  }

  const margem = precoPraticado - orcamento.precoFloorTotal;
  const margemPercentual = (margem / orcamento.precoFloorTotal) * 100;
  const margemAlerta = precoPraticado < orcamento.precoFloorTotal;

  const handleSalvarRascunho = () => {
    // TODO: salvar em DB com status "rascunho"
    sessionStorage.removeItem("orcamentoEmEdicao");
    router.push("/orcamentos");
  };

  const handleGerarProposta = () => {
    // TODO: salvar em DB com status "enviado" e ir para PDF
    sessionStorage.removeItem("orcamentoEmEdicao");
    router.push("/orcamentos");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-gama-primary/15 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-gama-primary/10 to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-start justify-between">
              <div>
                <Link href="/orcamentos/novo" className="inline-flex items-center gap-2 text-slate-400 hover:text-gama-primary transition-colors mb-4">
                  <span>←</span>
                  <span>Voltar para Construção</span>
                </Link>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gama-primary to-gama-primary bg-clip-text text-transparent">
                  💰 Precificação do Orçamento
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Floor Card */}
          <div className="glass glass-card p-8 border border-gama-primary/30 bg-gama-primary/5 mb-12">
            <p className="text-slate-400 text-xs uppercase mb-2 tracking-wider">Preço Floor (Mínimo Obrigatório)</p>
            <p className="text-5xl font-bold text-gama-primary">
              R$ {orcamento.precoFloorTotal.toFixed(2)}
            </p>
          </div>

          {/* 3 Lentes de Precificação */}
          <div className="mb-12">
            <p className="text-slate-400 text-sm uppercase mb-4 tracking-wider">3 Lentes de Precificação</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Média Histórica */}
              <button
                onClick={() => setPrecoPraticado(sugestao.mediaHistorica.valor)}
                className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] rounded-lg hover:border-gama-primary/50 hover:bg-gama-primary/5 transition-all active:scale-95 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">📈</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gama-primary/10 text-gama-primary">Histórica</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  R$ {sugestao.mediaHistorica.valor.toFixed(2)}
                </p>
                {sugestao.mediaHistorica.fonte === "historico" ? (
                  <p className="text-xs text-green-400">✅ {sugestao.mediaHistorica.amostras} orçamentos analisados</p>
                ) : (
                  <p className="text-xs text-yellow-400">⚠️ Fallback: tag {sugestao.mediaHistorica.tagUsada}</p>
                )}
              </button>

              {/* Multiplicador */}
              <button
                onClick={() => setPrecoPraticado(sugestao.multiplicador.valor)}
                className="glass glass-card p-6 border border-gama-primary/50 bg-gama-primary/10 rounded-lg hover:border-gama-primary hover:bg-gama-primary/15 transition-all active:scale-95 text-left ring-1 ring-gama-primary/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">🔄</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gama-primary text-black">Recomendado</span>
                </div>
                <p className="text-2xl font-bold text-gama-primary mb-2">
                  R$ {sugestao.multiplicador.valor.toFixed(2)}
                </p>
                {sugestao.multiplicador.fonte === "historico" ? (
                  <p className="text-xs text-green-400">✅ {sugestao.multiplicador.amostras} orçamentos analisados</p>
                ) : (
                  <p className="text-xs text-yellow-400">⚠️ Padrão (sem histórico suficiente)</p>
                )}
              </button>

              {/* Faixa Segmentada */}
              <button
                onClick={() => setPrecoPraticado(sugestao.faixaSegmentada.valor)}
                className="glass glass-card p-6 border border-[rgba(148,163,184,0.1)] rounded-lg hover:border-gama-primary/50 hover:bg-gama-primary/5 transition-all active:scale-95 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">🎯</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gama-primary/10 text-gama-primary">Segmentado</span>
                </div>
                <p className="text-xl font-bold text-white mb-1">{orcamento.tagContexto}</p>
                <p className="text-2xl font-bold text-gama-primary mb-2">
                  R$ {sugestao.faixaSegmentada.valor.toFixed(2)}
                </p>
                {sugestao.faixaSegmentada.fonte === "historico" ? (
                  <p className="text-xs text-green-400">✅ {sugestao.faixaSegmentada.amostras} clientes</p>
                ) : (
                  <p className="text-xs text-yellow-400">⚠️ Fallback: tag {sugestao.faixaSegmentada.tagUsada}</p>
                )}
              </button>
            </div>
          </div>

          {/* Sugestão Inteligente */}
          <div className="glass glass-card p-8 border border-gama-primary/50 bg-gama-primary/8 mb-12 rounded-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 text-xs uppercase mb-2 tracking-wider">Sugestão Inteligente</p>
                <p className="text-4xl font-bold text-gama-primary">R$ {sugestao.multiplicador.valor.toFixed(2)}</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>

            {sugestao.convergencia === "sem_dados" && (
              <div className="p-3 rounded-lg bg-[rgba(251,146,60,0.1)] border border-orange-500/30 text-orange-300 text-sm">
                ⚠️ Sem dados históricos suficientes — usando fallback
              </div>
            )}
            {sugestao.convergencia === "total" && (
              <div className="p-3 rounded-lg bg-[rgba(34,197,94,0.1)] border border-green-500/30 text-green-300 text-sm">
                ✅ Forte sinal — as 3 lentes convergem (variação &lt;3%)
              </div>
            )}
            {sugestao.convergencia === "parcial" && (
              <div className="p-3 rounded-lg bg-[rgba(251,146,60,0.1)] border border-yellow-500/30 text-yellow-300 text-sm">
                ⚠️ Sinal moderado — lentes próximas (variação 3-7%)
              </div>
            )}
            {sugestao.convergencia === "divergente" && (
              <div className="p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-red-500/30 text-red-300 text-sm">
                ❌ Sinal fraco — lentes divergem (variação &gt;7%)
              </div>
            )}
          </div>

          {/* Preço Praticado */}
          <div className="glass glass-card p-8 border border-[rgba(148,163,184,0.1)] rounded-lg">
            <div className="mb-8">
              <p className="text-slate-400 text-xs uppercase mb-4 tracking-wider">Ajuste o Preço Final</p>
              <div>
                <label className="block text-slate-400 text-sm mb-3">Valor Final (R$)</label>
                <input
                  type="number"
                  value={precoPraticado}
                  onChange={(e) => setPrecoPraticado(parseFloat(e.target.value) || 0)}
                  className="w-full px-6 py-4 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-4xl font-bold text-gama-primary placeholder-slate-600 focus:outline-none focus:border-gama-primary/50 focus:ring-1 focus:ring-gama-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Margem Analysis */}
            <div className="border-t border-[rgba(148,163,184,0.1)] pt-8">
              <p className="text-slate-400 text-xs uppercase mb-4 tracking-wider">Análise de Margem</p>

              {margemAlerta ? (
                <div className="p-6 rounded-lg bg-[rgba(239,68,68,0.1)] border border-red-500/30 mb-6">
                  <p className="font-bold text-red-300 text-lg mb-2">
                    ⚠️ Preço abaixo do floor
                  </p>
                  <p className="text-red-200">
                    Diferença: R$ {margem.toFixed(2)} ({margemPercentual.toFixed(1)}%)
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-lg bg-[rgba(34,197,94,0.1)] border border-green-500/30 mb-6">
                  <div className="flex items-baseline gap-4 mb-2">
                    <p className="text-3xl font-bold text-gama-primary">R$ {margem.toFixed(2)}</p>
                    <p className="text-xl text-green-300">+{margemPercentual.toFixed(1)}%</p>
                  </div>
                  <p className={`text-sm ${margemPercentual >= 35 ? "text-green-300" : "text-yellow-300"}`}>
                    {margemPercentual >= 35 ? "✅ Margem-alvo alcançada (35%+)" : "⚠️ Margem abaixo do alvo"}
                  </p>
                </div>
              )}

              {/* Floor Reference */}
              <div className="p-4 rounded-lg bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)]">
                <p className="text-xs text-slate-500 mb-1">Floor (mínimo)</p>
                <p className="text-sm font-semibold text-slate-300">R$ {orcamento.precoFloorTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-4 pt-8 border-t border-[rgba(148,163,184,0.1)]">
              <button
                onClick={handleSalvarRascunho}
                className="flex-1 px-6 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-slate-300 font-medium hover:border-gama-primary/50 hover:bg-gama-primary/5 transition-all"
              >
                💾 Salvar Rascunho
              </button>
              <button
                onClick={handleGerarProposta}
                disabled={margemAlerta}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  margemAlerta
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                    : "bg-gama-primary text-black hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] hover:scale-105 active:scale-95"
                }`}
              >
                📤 Gerar Proposta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
