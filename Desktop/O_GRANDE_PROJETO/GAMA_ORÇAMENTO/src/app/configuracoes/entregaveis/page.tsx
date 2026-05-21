"use client";

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

const categoriaColors: Record<string, { bg: string; text: string; badge: string }> = {
  producao: { bg: "bg-[rgba(59,130,246,0.1)]", text: "text-blue-300", badge: "bg-blue-500/30 text-blue-200" },
  estrategia: { bg: "bg-[rgba(168,85,247,0.1)]", text: "text-purple-300", badge: "bg-purple-500/30 text-purple-200" },
  gestao: { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-green-300", badge: "bg-green-500/30 text-green-200" },
  extras: { bg: "bg-[rgba(249,115,22,0.1)]", text: "text-orange-300", badge: "bg-orange-500/30 text-orange-200" },
};

const unidadeLabels: Record<string, string> = {
  unidade: "Unidade",
  hora: "Hora",
  mensal: "Mensal",
};

export default function EntregaveisPage() {
  const [entregaveis] = useState(mockEntregaveis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)]">
          <div className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[primary] to-[primary-light] bg-clip-text text-transparent">
                📦 Catálogo de Entregáveis
              </h1>
              <p className="text-slate-400 mt-2">
                Configure tipos de serviço com tempo padrão e profissional responsável
              </p>
            </div>
            <button className="px-6 py-3 bg-[primary] text-black rounded-lg font-bold hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] hover:scale-105 active:scale-95 transition-all">
              + Novo Entregável
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Table Card */}
          <div className="glass glass-card p-8 border border-[rgba(148,163,184,0.1)] rounded-lg mb-12">
            <div className="mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Lista de Entregáveis</p>
              <p className="text-slate-300 text-sm">
                Total de entregáveis ativos: <span className="text-[primary] font-bold">{entregaveis.filter((e) => e.ativo).length}</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(148,163,184,0.1)]">
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Nome</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Categoria</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-300">Profissional</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Tempo</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-300">Unidade</th>
                    <th className="text-right py-4 px-4 font-semibold text-slate-300">Preço Floor</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {entregaveis.map((entregavel) => (
                    <tr key={entregavel.id} className="border-b border-[rgba(148,163,184,0.05)] hover:bg-[rgba(136,206,17,0.05)] transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{entregavel.nome}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            categoriaColors[entregavel.categoria]?.badge || categoriaColors.extras.badge
                          }`}
                        >
                          {entregavel.categoria.charAt(0).toUpperCase() + entregavel.categoria.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{entregavel.profissional}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{entregavel.tempoMinutos}min</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 bg-[rgba(148,163,184,0.1)] text-slate-300 rounded text-xs">
                          {unidadeLabels[entregavel.unidade]}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-[primary]">R$ {entregavel.precoFloor.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center">
                        <button className="px-3 py-1 text-[primary] hover:bg-[rgba(136,206,17,0.1)] rounded transition-colors text-sm font-medium">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Section */}
          <div className="glass glass-card p-8 border border-[primary]/30 bg-[rgba(136,206,17,0.05)] rounded-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">💡</span>
              <div>
                <h2 className="text-lg font-bold text-[primary] mb-3">Como Funciona</h2>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  Cada entregável tem um tempo padrão em minutos. O preço floor é calculado automaticamente:
                </p>
                <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg mb-4 border border-[rgba(148,163,184,0.1)]">
                  <code className="text-xs text-slate-300 font-mono">
                    Preço Floor = (Tempo em Minutos ÷ 60) × Hora-Vendida do Profissional
                  </code>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  <span className="text-[primary] font-semibold">Exemplo:</span> Post Estático (20 min) com Designer (R$108,61/h) = (20÷60) × 108,61 = R$36,20
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
