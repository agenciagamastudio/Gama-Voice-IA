"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

// Mock data - TODO: conectar a APIs reais
const mockClientes = [
  { id: "1", nome: "Exemplo Ltda" },
  { id: "2", nome: "Cliente 2" },
];

const mockEntregaveis = [
  { id: "1", nome: "Post Estático", categoria: "producao", precoFloor: 36.20 },
  { id: "2", nome: "Carrossel (3-5 slides)", categoria: "producao", precoFloor: 81.46 },
  { id: "3", nome: "Reels", categoria: "producao", precoFloor: 18.72 },
  { id: "4", nome: "Story", categoria: "producao", precoFloor: 18.10 },
  { id: "5", nome: "Estratégia Mensal", categoria: "estrategia", precoFloor: 284.72 },
  { id: "6", nome: "Planejamento de Campanha", categoria: "estrategia", precoFloor: 427.08 },
  { id: "7", nome: "Gestão de Rede Social (mensal)", categoria: "gestao", precoFloor: 441.80 },
  { id: "8", nome: "Resposta a Comentários/DMs", categoria: "gestao", precoFloor: 88.36 },
];

interface ItemSelecionado {
  entregavelId: string;
  quantidade: number;
  precoFloor: number;
}

export default function NovoOrcamentoPage() {
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("");
  const [itens, setItens] = useState<ItemSelecionado[]>([]);

  const adicionarItem = (entregavelId: string) => {
    const entregavel = mockEntregaveis.find((e) => e.id === entregavelId);
    if (!entregavel) return;

    const itemExistente = itens.find((i) => i.entregavelId === entregavelId);
    if (itemExistente) {
      setItens(itens.map((i) => (i.entregavelId === entregavelId ? { ...i, quantidade: i.quantidade + 1 } : i)));
    } else {
      setItens([...itens, { entregavelId, quantidade: 1, precoFloor: entregavel.precoFloor }]);
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

  const precoTotal = itens.reduce((sum, item) => sum + item.precoFloor * item.quantidade, 0);

  const entregaveisAdicionados = itens.map((item) => mockEntregaveis.find((e) => e.id === item.entregavelId));

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/orcamentos">
          <Button variant="ghost">← Voltar</Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Novo Orçamento</h1>
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
                {mockClientes.map((cliente) => (
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

          {/* Entregáveis Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Adicione Entregáveis</CardTitle>
              <CardDescription>Selecione itens do catálogo para este orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEntregaveis.map((entregavel) => (
                  <div
                    key={entregavel.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{entregavel.nome}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        R$ {entregavel.precoFloor.toFixed(2)} (floor)
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
                  {clienteSelecionado ? mockClientes.find((c) => c.id === clienteSelecionado)?.nome : "Nenhum"}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Itens Adicionados</p>
                {itens.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum item adicionado</p>
                ) : (
                  <div className="space-y-2">
                    {entregaveisAdicionados.map((entregavel, idx) => {
                      const item = itens[idx];
                      return (
                        entregavel && (
                          <div key={entregavel.id} className="flex justify-between text-sm">
                            <span>
                              {entregavel.nome} × {item.quantidade}
                            </span>
                            <span className="font-medium">
                              R$ {(entregavel.precoFloor * item.quantidade).toFixed(2)}
                            </span>
                          </div>
                        )
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {precoTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  disabled={!clienteSelecionado || itens.length === 0}
                >
                  Salvar Orçamento
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
              Preços mostrados são o floor (mínimo). Você pode adicionar markup ao salvar.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
