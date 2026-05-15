"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Mock data - TODO: conectar a API /api/entregaveis
const mockEntregaveis = [
  { id: "1", nome: "Post Estático", categoria: "producao", profissional: "Designer", tempoMinutos: 20, unidade: "unidade", precoFloor: 36.20, ativo: true },
  { id: "2", nome: "Carrossel (3-5 slides)", categoria: "producao", profissional: "Designer", tempoMinutos: 45, unidade: "unidade", precoFloor: 81.46, ativo: true },
  { id: "3", nome: "Reels", categoria: "producao", profissional: "Editor", tempoMinutos: 15, unidade: "unidade", precoFloor: 18.72, ativo: true },
  { id: "4", nome: "Story", categoria: "producao", profissional: "Designer", tempoMinutos: 10, unidade: "unidade", precoFloor: 18.10, ativo: true },
  { id: "5", nome: "Estratégia Mensal", categoria: "estrategia", profissional: "Matheus", tempoMinutos: 120, unidade: "mensal", precoFloor: 284.72, ativo: true },
  { id: "6", nome: "Planejamento de Campanha", categoria: "estrategia", profissional: "Matheus", tempoMinutos: 180, unidade: "unidade", precoFloor: 427.08, ativo: true },
  { id: "7", nome: "Gestão de Rede Social (mensal)", categoria: "gestao", profissional: "Graça", tempoMinutos: 300, unidade: "mensal", precoFloor: 441.80, ativo: true },
  { id: "8", nome: "Resposta a Comentários/DMs", categoria: "gestao", profissional: "Graça", tempoMinutos: 60, unidade: "mensal", precoFloor: 88.36, ativo: true },
];

const categoriaColors: Record<string, string> = {
  producao: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  estrategia: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  gestao: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  extras: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const unidadeLabels: Record<string, string> = {
  unidade: "Unidade",
  hora: "Hora",
  mensal: "Mensal",
};

export default function EntregaveisPage() {
  const [entregaveis] = useState(mockEntregaveis);

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Catálogo de Entregáveis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure tipos de serviço com tempo padrão e profissional responsável
          </p>
        </div>
        <Button>+ Novo Entregável</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Entregáveis</CardTitle>
          <CardDescription>
            Total de entregáveis ativos: {entregaveis.filter((e) => e.ativo).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Nome</th>
                  <th className="text-left py-3 px-2 font-semibold">Categoria</th>
                  <th className="text-left py-3 px-2 font-semibold">Profissional</th>
                  <th className="text-right py-3 px-2 font-semibold">Tempo</th>
                  <th className="text-center py-3 px-2 font-semibold">Unidade</th>
                  <th className="text-right py-3 px-2 font-semibold">Preço Floor</th>
                  <th className="text-center py-3 px-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {entregaveis.map((entregavel) => (
                  <tr key={entregavel.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-2 font-medium">{entregavel.nome}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          categoriaColors[entregavel.categoria] || categoriaColors.extras
                        }`}
                      >
                        {entregavel.categoria.charAt(0).toUpperCase() + entregavel.categoria.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{entregavel.profissional}</td>
                    <td className="py-3 px-2 text-right">{entregavel.tempoMinutos}min</td>
                    <td className="py-3 px-2 text-center text-xs">
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                        {unidadeLabels[entregavel.unidade]}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold">R$ {entregavel.precoFloor.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center text-sm">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">💡 Como Funciona</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Cada entregável tem um tempo padrão em minutos. O preço floor é calculado automaticamente:
        </p>
        <code className="block bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs mb-3">
          Preço Floor = (Tempo em Minutos ÷ 60) × Hora-Vendida do Profissional
        </code>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Exemplo:</strong> Post Estático (20 min) com Designer (R$108,61/h) = (20÷60) × 108,61 = R$36,20
        </p>
      </div>
    </div>
  );
}
