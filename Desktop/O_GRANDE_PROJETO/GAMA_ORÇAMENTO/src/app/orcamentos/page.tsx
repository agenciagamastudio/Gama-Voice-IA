"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Orcamento {
  id: string;
  cliente: string;
  data: string;
  status: "rascunho" | "enviado" | "aprovado" | "rejeitado";
  precoFloor: number;
  precoPraticado: number;
  itens: number;
  tagContexto?: string;
  multiplicador?: number;
}

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  useEffect(() => {
    // Mock data - TODO: conectar a API /api/orcamentos
    const mockData: Orcamento[] = [
      {
        id: "orc-001",
        cliente: "Exemplo Ltda",
        data: "2026-05-15",
        status: "rascunho",
        precoFloor: 1165.82,
        precoPraticado: 1850.00,
        multiplicador: 1.59,
        itens: 5,
        tagContexto: "padrao",
      },
    ];
    setOrcamentos(mockData);
  }, []);

  const statusColors: Record<string, string> = {
    rascunho: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    enviado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    aprovado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    rejeitado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusLabels: Record<string, string> = {
    rascunho: "Rascunho",
    enviado: "Enviado",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Crie e gerencie orçamentos para seus clientes
          </p>
        </div>
        <Link href="/orcamentos/novo">
          <Button>+ Novo Orçamento</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        {["todos", "rascunho", "enviado", "aprovado", "rejeitado"].map((status) => (
          <Button
            key={status}
            variant={filtroStatus === status ? "default" : "outline"}
            onClick={() => setFiltroStatus(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {orcamentos.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Nenhum orçamento criado ainda</p>
            <Link href="/orcamentos/novo">
              <Button>Criar primeiro orçamento</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Orçamentos</CardTitle>
            <CardDescription>
              Mostrando{" "}
              {filtroStatus === "todos"
                ? orcamentos.length
                : orcamentos.filter((o) => o.status === filtroStatus).length}{" "}
              de {orcamentos.length} orçamento(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-2 font-semibold">Cliente</th>
                    <th className="text-left py-3 px-2 font-semibold">Data</th>
                    <th className="text-center py-3 px-2 font-semibold">Itens</th>
                    <th className="text-right py-3 px-2 font-semibold">Floor</th>
                    <th className="text-right py-3 px-2 font-semibold">Praticado</th>
                    <th className="text-center py-3 px-2 font-semibold">Multi.</th>
                    <th className="text-center py-3 px-2 font-semibold">Tag</th>
                    <th className="text-center py-3 px-2 font-semibold">Status</th>
                    <th className="text-center py-3 px-2 font-semibold">Margem</th>
                    <th className="text-center py-3 px-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(filtroStatus === "todos"
                    ? orcamentos
                    : orcamentos.filter((o) => o.status === filtroStatus)
                  ).map((orc) => {
                    const margem = orc.precoPraticado - orc.precoFloor;
                    const margemPercent = (margem / orc.precoFloor) * 100;
                    let indicador = "⚫";
                    if (orc.precoPraticado < orc.precoFloor) indicador = "🔴";
                    else if (margemPercent >= 35) indicador = "🟢";
                    else if (margemPercent > 0) indicador = "🟡";

                    return (
                      <tr key={orc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-2 font-medium">{orc.cliente}</td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                          {new Date(orc.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-2 text-center">{orc.itens}</td>
                        <td className="py-3 px-2 text-right text-sm">
                          R$ {orc.precoFloor.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold">
                          R$ {orc.precoPraticado.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center text-sm">
                          {orc.multiplicador ? `${orc.multiplicador.toFixed(2)}x` : "-"}
                        </td>
                        <td className="py-3 px-2 text-center text-xs capitalize">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {orc.tagContexto || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              statusColors[orc.status] || statusColors.rascunho
                            }`}
                          >
                            {statusLabels[orc.status]}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center" title={`${margemPercent.toFixed(1)}%`}>
                          {indicador}
                        </td>
                        <td className="py-3 px-2 text-center text-sm">
                          <Link href={`/orcamentos/${orc.id}`}>
                            <Button variant="ghost" size="sm">
                              Abrir
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">💡 Fluxo de Orçamento</h2>
        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
          <li>Crie um novo orçamento selecionando cliente</li>
          <li>Adicione entregáveis do catálogo com quantidades</li>
          <li>Preço floor é calculado automaticamente</li>
          <li>Adicione markup se necessário</li>
          <li>Salve como rascunho ou envie para cliente</li>
          <li>Exporte como PDF para compartilhamento</li>
        </ol>
      </div>
    </div>
  );
}
