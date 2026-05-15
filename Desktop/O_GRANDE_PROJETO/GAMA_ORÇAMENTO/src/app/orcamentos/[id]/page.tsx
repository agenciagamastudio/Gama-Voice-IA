"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data - TODO: conectar a API /api/orcamentos/[id]
const mockOrcamento = {
  id: "orc-001",
  cliente: "Exemplo Ltda",
  data: "2026-05-15",
  status: "rascunho",
  itens: [
    { id: "1", nome: "Post Estático", quantidade: 4, precoFloor: 36.20 },
    { id: "2", nome: "Reels", quantidade: 1, precoFloor: 18.72 },
  ],
  precoFloor: 162.52,
  markup: 0,
  precoTotal: 162.52,
};

export default function OrcamentoDetailPage({ params }: { params: { id: string } }) {
  const orc = mockOrcamento;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link href="/orcamentos">
          <Button variant="ghost">← Voltar</Button>
        </Link>
        <div className="mt-4 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{orc.cliente}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Orçamento #{orc.id} · {new Date(orc.data).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              orc.status === "rascunho"
                ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {orc.status === "rascunho" ? "Rascunho" : "Enviado"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Orçamento</CardTitle>
              <CardDescription>{orc.itens.length} entregável(is)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Entregável</th>
                      <th className="text-right py-3 px-2 font-semibold">Qtd</th>
                      <th className="text-right py-3 px-2 font-semibold">Preço Unit.</th>
                      <th className="text-right py-3 px-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orc.itens.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-2">{item.nome}</td>
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
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Preço Floor:</span>
                <span className="font-semibold">R$ {orc.precoFloor.toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="text-gray-600 dark:text-gray-400">Markup:</span>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-24 px-2 py-1 border rounded text-right dark:bg-gray-800"
                  placeholder="0%"
                />
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total:</span>
                <span>R$ {orc.precoTotal.toFixed(2)}</span>
              </div>

              <div className="space-y-2 pt-4">
                <Button className="w-full">Salvar Alterações</Button>
                <Button variant="outline" className="w-full">
                  Exportar PDF
                </Button>
                <Button variant="outline" className="w-full">
                  Enviar para Cliente
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-medium">Cliente</p>
                <p>{orc.cliente}</p>
              </div>
              <div className="border-t pt-2">
                <p className="font-medium">Data de Criação</p>
                <p>{new Date(orc.data).toLocaleDateString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
