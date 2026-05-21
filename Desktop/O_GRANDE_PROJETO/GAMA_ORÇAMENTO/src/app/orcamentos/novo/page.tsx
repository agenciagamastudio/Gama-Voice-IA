"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, AlertCircle } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
}

interface Entregavel {
  id: string;
  nome: string;
  categoria: "producao" | "estrategia" | "gestao" | "extras";
  precoFloorUnitario: number;
  profissional: { nome: string; funcao: string };
  tempoMinutos: number;
  unidade: string;
}

interface ItemSelecionado {
  entregavelId: string;
  quantidade: number;
  precoFloor: number;
  nome: string;
}

type Modo = "construcao" | "template";
type TagContexto = "premium" | "padrao" | "estrategico" | "indicacao";

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("construcao");
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [tagContexto, setTagContexto] = useState<TagContexto>("padrao");
  const [itens, setItens] = useState<ItemSelecionado[]>([]);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [entregaveis, setEntregaveis] = useState<Entregavel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const response = await fetch("/api/entregaveis");
        if (!response.ok) throw new Error("Falha ao carregar entregáveis");

        const data = await response.json();
        setEntregaveis(data.entregaveis || []);

        setClientes([
          { id: "1", nome: "Exemplo Ltda" },
          { id: "2", nome: "Cliente 2" },
        ]);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const adicionarItem = (entregavelId: string) => {
    const entregavel = entregaveis.find((e) => e.id === entregavelId);
    if (!entregavel) return;

    const itemExistente = itens.find((i) => i.entregavelId === entregavelId);
    if (itemExistente) {
      setItens(itens.map((i) =>
        i.entregavelId === entregavelId ? { ...i, quantidade: i.quantidade + 1 } : i
      ));
    } else {
      setItens([
        ...itens,
        {
          entregavelId,
          quantidade: 1,
          precoFloor: entregavel.precoFloorUnitario,
          nome: entregavel.nome,
        },
      ]);
    }
  };

  const removerItem = (entregavelId: string) => {
    setItens(itens.filter((i) => i.entregavelId !== entregavelId));
  };

  const atualizarQuantidade = (entregavelId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerItem(entregavelId);
    } else {
      setItens(itens.map((i) => (i.entregavelId === entregavelId ? { ...i, quantidade } : i)));
    }
  };

  const precoFloorTotal = itens.reduce((sum, item) => sum + item.precoFloor * item.quantidade, 0);

  const handleCalcularSugestoes = () => {
    if (!clienteSelecionado || itens.length === 0) return;

    const orcamentoData = {
      clienteId: clienteSelecionado,
      tagContexto,
      itens,
      precoFloorTotal,
    };

    sessionStorage.setItem("orcamentoEmEdicao", JSON.stringify(orcamentoData));
    sessionStorage.setItem("modo", "construcao");
    router.push("/orcamentos/novo/sugestao");
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gama-bg flex items-center justify-center">
        <div className="text-gama-text-muted text-lg">Carregando dados...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gama-bg p-6">
        <div className="max-w-2xl mx-auto glass-card border-l-4 border-gama-error p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-gama-error flex-shrink-0" />
            <div>
              <h3 className="text-gama-error font-bold mb-1">Erro ao carregar dados</h3>
              <p className="text-gama-text-secondary">{erro}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gama-bg relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-gama-primary-glow to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-gama-primary-dim to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gama-border backdrop-blur-md bg-gama-surface/40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/orcamentos">
                <button className="p-2 hover:bg-gama-surface/50 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gama-text-muted" />
                </button>
              </Link>
            </div>
            <h1 className="text-5xl font-bold text-gama-primary">
              Novo Orçamento
            </h1>
            <p className="text-gama-text-secondary text-lg mt-2">Construa um orçamento passo a passo ou use um template</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Mode Toggle */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setModo("construcao")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                modo === "construcao"
                  ? "bg-gama-primary/20 border border-gama-primary text-gama-primary"
                  : "bg-gama-surface/50 border border-gama-border text-gama-text-secondary hover:border-gama-primary/50"
              }`}
            >
              Modo Construção
            </button>
            <button
              onClick={() => setModo("template")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                modo === "template"
                  ? "bg-gama-primary/20 border border-gama-primary text-gama-primary"
                  : "bg-gama-surface/50 border border-gama-border text-gama-text-secondary hover:border-gama-primary/50"
              }`}
            >
              Usar Template
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cliente Selection */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-gama-text mb-1">Selecione o Cliente</h2>
                <p className="text-gama-text-muted text-sm mb-6">Escolha para quem o orçamento será criado</p>
                <div className="space-y-2">
                  {clientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => setClienteSelecionado(cliente.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        clienteSelecionado === cliente.id
                          ? "border-gama-primary bg-gama-primary/10 text-gama-primary"
                          : "border-gama-border text-gama-text-secondary hover:border-gama-primary/50"
                      }`}
                    >
                      {cliente.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag de Contexto */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-gama-text mb-1">Tag de Contexto</h2>
                <p className="text-gama-text-muted text-sm mb-6">Classifique o tipo de cliente/orçamento</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["premium", "padrao", "estrategico", "indicacao"] as TagContexto[]).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTagContexto(tag)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium capitalize text-sm ${
                        tagContexto === tag
                          ? "border-gama-primary bg-gama-primary/10 text-gama-primary"
                          : "border-gama-border text-gama-text-secondary hover:border-gama-primary/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entregáveis Selection */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-gama-text mb-1">Adicione Entregáveis</h2>
                <p className="text-gama-text-muted text-sm mb-6">Selecione itens do catálogo para este orçamento</p>
                <div className="space-y-3">
                  {entregaveis.map((entregavel) => {
                    const item = itens.find((i) => i.entregavelId === entregavel.id);
                    return (
                      <div key={entregavel.id} className="bg-gama-surface/50 border border-gama-border rounded-lg p-4 hover:border-gama-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-gama-text">{entregavel.nome}</p>
                            <p className="text-xs text-gama-text-muted mt-1">
                              {entregavel.profissional.nome} • {entregavel.tempoMinutos}min
                            </p>
                            <p className="text-sm text-gama-primary font-medium mt-2">
                              R$ {entregavel.precoFloorUnitario.toFixed(2)} (floor)
                            </p>
                          </div>
                          {item ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => atualizarQuantidade(entregavel.id, parseInt(e.target.value))}
                                className="w-16 px-2 py-1 bg-gama-primary/10 border border-gama-primary/30 rounded text-center text-gama-primary font-medium"
                              />
                              <button
                                onClick={() => removerItem(entregavel.id)}
                                className="px-3 py-1 bg-gama-error/10 border border-gama-error/30 rounded text-gama-error text-sm font-medium hover:bg-gama-error/20 transition-colors"
                              >
                                Remover
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => adicionarItem(entregavel.id)}
                              className="px-4 py-2 bg-gama-primary/20 border border-gama-primary rounded-lg text-gama-primary font-medium hover:bg-gama-primary/30 transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="glass-card p-6 border-l-2 border-gama-primary">
                <h2 className="text-xl font-bold text-gama-text mb-6">Resumo</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-gama-text-muted mb-1">Cliente</p>
                    <p className="text-lg font-semibold text-gama-text">
                      {clienteSelecionado
                        ? clientes.find((c) => c.id === clienteSelecionado)?.nome
                        : "Nenhum selecionado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-gama-text-muted mb-1">Tag</p>
                    <p className="text-lg font-semibold text-gama-primary capitalize">{tagContexto}</p>
                  </div>

                  <div className="border-t border-gama-border pt-4">
                    <p className="text-xs uppercase text-gama-text-muted mb-3">Itens ({itens.length})</p>
                    {itens.length === 0 ? (
                      <p className="text-sm text-gama-text-muted italic">Nenhum item adicionado</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {itens.map((item) => (
                          <div key={item.entregavelId} className="flex justify-between text-sm">
                            <span className="text-gama-text-secondary">{item.nome} ×{item.quantidade}</span>
                            <span className="text-gama-primary font-medium">
                              R$ {(item.precoFloor * item.quantidade).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-gama-primary/10 border border-gama-primary/30 rounded-lg p-4">
                    <p className="text-xs uppercase text-gama-text-muted mb-2">Floor Total</p>
                    <p className="text-3xl font-bold text-gama-primary">R$ {precoFloorTotal.toFixed(2)}</p>
                  </div>

                  <div className="space-y-2 pt-4">
                    <button
                      disabled={!clienteSelecionado || itens.length === 0}
                      onClick={handleCalcularSugestoes}
                      className="w-full px-4 py-3 bg-gama-primary text-gama-bg font-bold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Calcular Sugestões
                    </button>
                    <Link href="/orcamentos" className="block">
                      <button className="w-full px-4 py-3 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text-secondary font-medium hover:border-gama-primary/50 transition-colors">
                        Cancelar
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tip Card */}
              <div className="glass-card p-6 border-l-2 border-gama-info/50">
                <p className="text-sm text-gama-text-secondary">
                  <span className="text-lg mr-2">💡</span>
                  Preços mostrados são o <span className="text-gama-primary font-medium">floor (mínimo)</span>. O próximo passo mostrará sugestões com markup aplicado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
