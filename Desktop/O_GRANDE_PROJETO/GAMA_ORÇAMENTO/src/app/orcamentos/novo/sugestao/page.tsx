"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        // Buscar templateId do sessionStorage (deve estar salvo antes)
        const templateId = sessionStorage.getItem("templateId");
        if (!templateId) {
          console.warn("templateId não encontrado em sessionStorage");
          setCarregando(false);
          return;
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
      <div className="container py-8">
        <p className="text-center text-gray-600">Carregando sugestões de preço...</p>
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
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/orcamentos/novo">
          <Button variant="ghost">← Voltar para Construção</Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">💰 Precificação do Orçamento</h1>
      </div>

      {/* Floor */}
      <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Preço Floor (Mínimo)</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          R$ {orcamento.precoFloorTotal.toFixed(2)}
        </p>
      </div>

      {/* Sugestões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Média Histórica */}
        <Card
          className="cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          onClick={() => setPrecoPraticado(sugestao.mediaHistorica.valor)}
        >
          <CardHeader>
            <CardTitle className="text-base">📈 Média Histórica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">
              R$ {sugestao.mediaHistorica.valor.toFixed(2)}
            </div>
            {sugestao.mediaHistorica.fonte === "historico" ? (
              <p className="text-xs text-green-600">✅ {sugestao.mediaHistorica.amostras} orçamentos</p>
            ) : (
              <p className="text-xs text-yellow-600">⚠️ Fallback: tag {sugestao.mediaHistorica.tagUsada}</p>
            )}
          </CardContent>
        </Card>

        {/* Multiplicador */}
        <Card
          className="cursor-pointer hover:border-green-500 dark:hover:border-green-500 transition-colors"
          onClick={() => setPrecoPraticado(sugestao.multiplicador.valor)}
        >
          <CardHeader>
            <CardTitle className="text-base">🔄 Multiplicador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-green-600">
              R$ {sugestao.multiplicador.valor.toFixed(2)}
            </div>
            {sugestao.multiplicador.fonte === "historico" ? (
              <p className="text-xs text-green-600">✅ {sugestao.multiplicador.amostras} orçamentos</p>
            ) : (
              <p className="text-xs text-yellow-600">⚠️ Padrão (sem histórico)</p>
            )}
          </CardContent>
        </Card>

        {/* Faixa Segmentada */}
        <Card
          className="cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
          onClick={() => setPrecoPraticado(sugestao.faixaSegmentada.valor)}
        >
          <CardHeader>
            <CardTitle className="text-base">🎯 Faixa: {orcamento.tagContexto}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-purple-600">
              R$ {sugestao.faixaSegmentada.valor.toFixed(2)}
            </div>
            {sugestao.faixaSegmentada.fonte === "historico" ? (
              <p className="text-xs text-green-600">✅ {sugestao.faixaSegmentada.amostras} clientes</p>
            ) : (
              <p className="text-xs text-yellow-600">⚠️ Fallback: tag {sugestao.faixaSegmentada.tagUsada}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sugestão Inteligente */}
      <Card className="mb-8 border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle>⭐ Sugestão Inteligente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold">R$ {sugestao.multiplicador.valor.toFixed(2)}</div>
          {sugestao.convergencia === "sem_dados" && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              ⚠️ Sem dados históricos suficientes — usando fallback
            </p>
          )}
          {sugestao.convergencia === "total" && (
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Forte sinal — as 3 lentes convergem (variação: &lt;3%)
            </p>
          )}
          {sugestao.convergencia === "parcial" && (
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ Sinal moderado — lentes próximas (variação: 3-7%)
            </p>
          )}
          {sugestao.convergencia === "divergente" && (
            <p className="text-sm text-red-700 dark:text-red-300">
              ❌ Sinal fraco — lentes divergem (variação: &gt;7%)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preço Praticado */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>💼 Preço Praticado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Valor (R$)</label>
            <input
              type="number"
              value={precoPraticado}
              onChange={(e) => setPrecoPraticado(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded text-2xl font-bold dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Margem */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Margem</p>
            <div
              className={`p-3 rounded ${
                margemAlerta
                  ? "bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700"
                  : "bg-green-100 dark:bg-green-950 border border-green-300 dark:border-green-700"
              }`}
            >
              {margemAlerta ? (
                <p className="font-bold text-red-800 dark:text-red-200">
                  ⚠️ Abaixo do floor: R$ {margem.toFixed(2)} ({margemPercentual.toFixed(1)}%)
                </p>
              ) : (
                <>
                  <p className="font-bold text-green-800 dark:text-green-200">
                    💚 R$ {margem.toFixed(2)} (+{margemPercentual.toFixed(1)}%)
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {margemPercentual >= 35 ? "✅ Margem-alvo alcançada" : "⚠️ Margem abaixo do alvo"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Button variant="outline" onClick={handleSalvarRascunho}>
              Salvar Rascunho
            </Button>
            <Button onClick={handleGerarProposta} disabled={margemAlerta}>
              Gerar Proposta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
