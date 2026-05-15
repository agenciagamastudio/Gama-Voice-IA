"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OverheadPage() {
  // TODO: Conectar a Prisma Client para buscar dados
  const overheadItems = [
    { id: "1", descricao: "Salários e Benefícios", categoria: "utilidades", valor: 2000, proporcional: 1.0, ativo: true },
    {
      id: "2",
      descricao: "Software e Ferramentas (Adobe, Canva, Claude, etc)",
      categoria: "software",
      valor: 315,
      proporcional: 1.0,
      ativo: true,
    },
    {
      id: "3",
      descricao: "Infraestrutura (internet, energia, aluguel)",
      categoria: "utilidades",
      valor: 301,
      proporcional: 1.0,
      ativo: true,
    },
  ];

  const overheadTotal = overheadItems
    .filter((item) => item.ativo)
    .reduce((sum, item) => sum + item.valor * item.proporcional, 0);

  const categoriaColors: Record<string, string> = {
    utilidades: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    software: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    ferramentas: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    outros: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Custos Fixos (Overhead)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure custos mensais de infraestrutura e software
          </p>
        </div>
        <Button>+ Novo Item</Button>
      </div>

      {/* KPI: Total Overhead */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">R$ {overheadTotal.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mt-2">Soma de todos os itens ativos e proporcionais</p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens de Overhead</CardTitle>
          <CardDescription>
            Total de itens ativos: {overheadItems.filter((i) => i.ativo).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Descrição</th>
                  <th className="text-left py-3 px-2 font-semibold">Categoria</th>
                  <th className="text-right py-3 px-2 font-semibold">Valor</th>
                  <th className="text-right py-3 px-2 font-semibold">Proporcional</th>
                  <th className="text-right py-3 px-2 font-semibold">Alocado</th>
                  <th className="text-center py-3 px-2 font-semibold">Status</th>
                  <th className="text-center py-3 px-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {overheadItems.map((item) => {
                  const alocado = item.valor * item.proporcional;
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-2 font-medium">{item.descricao}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            categoriaColors[item.categoria] || categoriaColors.outros
                          }`}
                        >
                          {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">R$ {item.valor.toFixed(2)}</td>
                      <td className="py-3 px-2 text-right">{(item.proporcional * 100).toFixed(0)}%</td>
                      <td className="py-3 px-2 text-right font-medium">R$ {alocado.toFixed(2)}</td>
                      <td className="py-3 px-2 text-center">
                        {item.ativo ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center text-sm">
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">💡 Sobre Proporcionais</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          Use o campo "Proporcional" para custos compartilhados:
        </p>
        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300 list-disc list-inside">
          <li>
            <strong>100%</strong> = Custo integralmente alocado à agência (ex: Adobe CC)
          </li>
          <li>
            <strong>33%</strong> = 1/3 do custo alocado (ex: 1/3 da internet residencial)
          </li>
          <li>
            <strong>50%</strong> = Metade do custo (ex: aluguel compartilhado)
          </li>
        </ul>
      </div>
    </div>
  );
}
