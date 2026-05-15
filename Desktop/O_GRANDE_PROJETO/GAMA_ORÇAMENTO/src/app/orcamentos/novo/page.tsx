"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  // Carregar dados da API
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const response = await fetch("/api/entregaveis");
        if (!response.ok) throw new Error("Falha ao carregar entregáveis");

        const data = await response.json();
        setEntregaveis(data.entregaveis || []);

        // TODO: carregar clientes também (será adicionado em fase posterior)
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
    router.push("/orcamentos/novo/sugestao");
  };

  if (carregando) {
    return (
      <div className="container py-8">
        <p className="text-center text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="container py-8">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-800 dark:text-red-100">⚠️ Erro: {erro}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/orcamentos">
          <Button variant="ghost">← Voltar</Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Novo Orçamento</h1>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={modo === "construcao" ? "default" : "outline"}
          onClick={() => setModo("construcao")}
        >
          Modo Construção
        </Button>
        <Button
          variant={modo === "template" ? "default" : "outline"}
          onClick={() => setModo("template")}
        >
          Usar Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Selecione o Cliente</CardTitle>
              <CardDescription>Escolha para quem o orçamento será criado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => setClienteSelecionado(cliente.id)}
                    className={`w-full text-left p-3 rounded border-2 transition-all ${
                      clienteSelecionado === cliente.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {cliente.nome}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tag de Contexto */}
          <Card>
            <CardHeader>
              <CardTitle>Tag de Contexto</CardTitle>
              <CardDescription>Classifique o tipo de cliente/orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {(["premium", "padrao", "estrategico", "indicacao"] as TagContexto[]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagContexto(tag)}
                    className={`p-3 rounded border-2 transition-all capitalize ${
                      tagContexto === tag
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Entregáveis Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Adicione Entregáveis</CardTitle>
              <CardDescription>Selecione itens do catálogo para este orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entregaveis.map((entregavel) => (
                  <div
                    key={entregavel.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{entregavel.nome}</p>
                      <p className="text-xs text-gray-500">
                        {entregavel.profissional.nome} • {entregavel.tempoMinutos}min
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        R$ {entregavel.precoFloorUnitario.toFixed(2)} (floor)
                      </p>
                    </div>
                    {itens.find((i) => i.entregavelId === entregavel.id) ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={itens.find((i) => i.entregavelId === entregavel.id)?.quantidade || 1}
                          onChange={(e) => atualizarQuantidade(entregavel.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-center dark:bg-gray-800"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removerItem(entregavel.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => adicionarItem(entregavel.id)}>
                        Adicionar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
                <p className="font-semibold">
                  {clienteSelecionado ? clientes.find((c) => c.id === clienteSelecionado)?.nome : "Nenhum"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tag</p>
                <p className="font-semibold capitalize">{tagContexto}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Itens Adicionados</p>
                {itens.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum item adicionado</p>
                ) : (
                  <div className="space-y-2">
                    {itens.map((item) => (
                      <div key={item.entregavelId} className="flex justify-between text-sm">
                        <span>
                          {item.nome} × {item.quantidade}
                        </span>
                        <span className="font-medium">
                          R$ {(item.precoFloor * item.quantidade).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="flex justify-between text-lg font-bold">
                  <span>Floor Total:</span>
                  <span>R$ {precoFloorTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  disabled={!clienteSelecionado || itens.length === 0}
                  onClick={handleCalcularSugestoes}
                >
                  Calcular Sugestões de Preço
                </Button>
                <Link href="/orcamentos" className="block">
                  <Button variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💡 Dica</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 dark:text-gray-300">
              Preços mostrados são o floor (mínimo). O próximo passo te mostrará sugestões de preço com markup.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
