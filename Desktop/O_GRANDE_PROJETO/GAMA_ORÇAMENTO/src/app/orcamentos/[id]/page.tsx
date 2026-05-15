"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock data - TODO: conectar a API /api/orcamentos/[id]
const mockOrcamento = {
  id: "orc-001",
  cliente: "Exemplo Ltda",
  data: "2026-05-15",
  status: "rascunho" as const,
  itens: [
    { id: "1", nome: "Post Estático", quantidade: 4, precoFloor: 36.20, profissional: "Designer" },
    { id: "2", nome: "Reels", quantidade: 2, precoFloor: 18.72, profissional: "Editor" },
  ],
  precoFloor: 181.28,
  precoPraticado: 1850.00,
  markup: 59,
  tagContexto: "padrao",
  multiplicador: 1.59,
};

export default function OrcamentoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [orcamento, setOrcamento] = useState(mockOrcamento);
  const [precoPraticado, setPrecoPraticado] = useState(orcamento.precoPraticado);

  const margem = precoPraticado - orcamento.precoFloor;
  const margemPercent = (margem / orcamento.precoFloor) * 100;
  const margemAlerta = precoPraticado < orcamento.precoFloor;

  const handleDuplicar = () => {
    const novoOrcamento = {
      ...orcamento,
      id: `orc-${Date.now()}`,
      data: new Date().toISOString().split("T")[0],
      status: "rascunho" as const,
    };

    sessionStorage.setItem("orcamentoEmEdicao", JSON.stringify({
      clienteId: orcamento.cliente,
      tagContexto: orcamento.tagContexto,
      itens: orcamento.itens.map((i) => ({
        entregavelId: i.id,
        quantidade: i.quantidade,
        precoFloor: i.precoFloor,
      })),
      precoFloorTotal: orcamento.precoFloor,
    }));

    router.push("/orcamentos/novo");
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/orcamentos">
          <Button variant="ghost">← Voltar</Button>
        </Link>
        <div className="mt-4 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{orcamento.cliente}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Orçamento #{orcamento.id} · {new Date(orcamento.data).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              orcamento.status === "rascunho"
                ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {orcamento.status === "rascunho" ? "Rascunho" : "Enviado"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Orçamento</CardTitle>
              <CardDescription>{orcamento.itens.length} entregável(is) • Tag: {orcamento.tagContexto}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-2 font-semibold">Entregável</th>
                      <th className="text-center py-3 px-2 font-semibold">Profissional</th>
                      <th className="text-right py-3 px-2 font-semibold">Qtd</th>
                      <th className="text-right py-3 px-2 font-semibold">Preço Unit.</th>
                      <th className="text-right py-3 px-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orcamento.itens.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-2 font-medium">{item.nome}</td>
                        <td className="py-3 px-2 text-center text-xs text-gray-600 dark:text-gray-400">
                          {item.profissional}
                        </td>
                        <td className="py-3 px-2 text-right">{item.quantidade}</td>
                        <td className="py-3 px-2 text-right">R$ {item.precoFloor.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right font-semibold">
                          R$ {(item.precoFloor * item.quantidade).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* Comparison Floor vs Praticado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativo de Preços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Floor (Mínimo)</p>
                <p className="text-2xl font-bold">R$ {orcamento.precoFloor.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">Praticado</p>
                <p className="text-2xl font-bold">R$ {precoPraticado.toFixed(2)}</p>
              </div>

              <div className={`p-3 rounded border ${
                margemAlerta
                  ? "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-700"
                  : "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-700"
              }`}>
                <p className="text-xs text-gray-600 dark:text-gray-400">Margem</p>
                <p className="text-2xl font-bold">
                  {margemAlerta ? "⚠️" : "✅"} R$ {margem.toFixed(2)} ({margemPercent.toFixed(1)}%)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preço Praticado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ajustar Preço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Preço (R$)</label>
                <input
                  type="number"
                  value={precoPraticado}
                  onChange={(e) => setPrecoPraticado(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded font-semibold dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Multiplicador</label>
                <p className="text-lg font-semibold">
                  {(precoPraticado / orcamento.precoFloor).toFixed(2)}x
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button className="w-full">Salvar Alterações</Button>
              <Button variant="outline" className="w-full">
                Exportar PDF
              </Button>
              <Button variant="outline" className="w-full">
                Enviar para Cliente
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDuplicar}>
                Duplicar Orçamento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-medium">Cliente</p>
                <p>{orcamento.cliente}</p>
              </div>
              <div className="border-t pt-2">
                <p className="font-medium">Tag Contexto</p>
                <p className="capitalize">{orcamento.tagContexto}</p>
              </div>
              <div className="border-t pt-2">
                <p className="font-medium">Data de Criação</p>
                <p>{new Date(orcamento.data).toLocaleDateString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
