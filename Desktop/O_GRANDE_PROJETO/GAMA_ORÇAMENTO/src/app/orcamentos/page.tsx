"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/atoms/Badge";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, Plus, TrendingUp, AlertCircle } from "lucide-react";

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

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    rascunho: { color: "text-gama-text-muted", bg: "bg-gama-surface/50", label: "Rascunho" },
    enviado: { color: "text-gama-info", bg: "bg-gama-info/10", label: "Enviado" },
    aprovado: { color: "text-gama-success", bg: "bg-gama-success/10", label: "Aprovado" },
    rejeitado: { color: "text-gama-error", bg: "bg-gama-error/10", label: "Rejeitado" },
  };

  const getMarginIndicator = (orc: Orcamento) => {
    const margem = orc.precoPraticado - orc.precoFloor;
    const margemPercent = (margem / orc.precoFloor) * 100;

    if (orc.precoPraticado < orc.precoFloor) {
      return { icon: "🔴", label: "Abaixo", color: "text-gama-error" };
    } else if (margemPercent >= 35) {
      return { icon: "🟢", label: "Ótima", color: "text-gama-success" };
    } else if (margemPercent > 0) {
      return { icon: "🟡", label: "Boa", color: "text-gama-warning" };
    }
    return { icon: "⚫", label: "—", color: "text-gama-text-muted" };
  };

  const filteredOrcamentos =
    filtroStatus === "todos" ? orcamentos : orcamentos.filter((o) => o.status === filtroStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-gama-primary-glow to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-gama-primary-dim to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gama-border backdrop-blur-md bg-gama-surface/40">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gama-primary to-gama-primary bg-clip-text text-transparent mb-2">
                  Orçamentos
                </h1>
                <p className="text-gama-text-secondary text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gama-primary" />
                  Crie e gerencie orçamentos para seus clientes
                </p>
              </div>
              <Link href="/orcamentos/novo">
                <button className="group relative px-6 py-3 bg-gama-primary text-black font-bold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95">
                  <Plus className="w-5 h-5 inline mr-2" />
                  Novo Orçamento
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-500" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Filter Pills */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {["todos", "rascunho", "enviado", "aprovado", "rejeitado"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 backdrop-blur-sm border capitalize ${
                  filtroStatus === status
                    ? "bg-gama-primary/20 border-gama-primary text-gama-primary shadow-[0_0_20px_rgba(136,206,17,0.3)]"
                    : "bg-gama-surface/50 border-gama-border text-gama-text-secondary hover:border-gama-primary/50 hover:text-gama-primary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredOrcamentos.length === 0 ? (
            <div className="glass glass-card h-64 flex flex-col items-center justify-center">
              <AlertCircle className="w-16 h-16 text-gama-text-muted mb-4" />
              <p className="text-gama-text text-lg mb-6">Nenhum orçamento encontrado</p>
              <Link href="/orcamentos/novo">
                <button className="px-6 py-2 bg-gama-primary/20 border border-gama-primary text-gama-primary rounded-lg hover:bg-gama-primary/30 transition-all">
                  Criar primeiro orçamento
                </button>
              </Link>
            </div>
          ) : (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="glass glass-card p-4">
                  <p className="text-gama-text-muted text-sm mb-1">Total</p>
                  <p className="text-3xl font-bold text-gama-primary">{orcamentos.length}</p>
                </div>
                <div className="glass glass-card p-4">
                  <p className="text-gama-text-muted text-sm mb-1">Rascunho</p>
                  <p className="text-2xl font-bold text-gama-text">
                    {orcamentos.filter((o) => o.status === "rascunho").length}
                  </p>
                </div>
                <div className="glass glass-card p-4">
                  <p className="text-gama-text-muted text-sm mb-1">Aprovados</p>
                  <p className="text-2xl font-bold text-gama-success">
                    {orcamentos.filter((o) => o.status === "aprovado").length}
                  </p>
                </div>
                <div className="glass glass-card p-4">
                  <p className="text-gama-text-muted text-sm mb-1">Receita Total</p>
                  <p className="text-2xl font-bold text-gama-info">
                    R$ {orcamentos.reduce((sum, o) => sum + o.precoPraticado, 0).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Orcamentos Grid */}
              <div className="grid gap-4">
                {filteredOrcamentos.map((orc) => {
                  const config = statusConfig[orc.status];
                  const margin = getMarginIndicator(orc);
                  const marginAmount = orc.precoPraticado - orc.precoFloor;
                  const marginPercent = (marginAmount / orc.precoFloor) * 100;

                  return (
                    <Link key={orc.id} href={`/orcamentos/${orc.id}`}>
                      <div className="glass glass-card group hover:glass-intense transition-all duration-300 cursor-pointer">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white group-hover:text-gama-primary transition-colors">
                                {orc.cliente}
                              </h3>
                              <p className="text-slate-400 text-sm">
                                {new Date(orc.data).toLocaleDateString("pt-BR")} • {orc.itens} itens
                              </p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gama-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>

                          <div className="grid grid-cols-5 gap-4">
                            {/* Floor Price */}
                            <div className="bg-gama-surface/50 rounded-lg p-3">
                              <p className="text-gama-text-muted text-xs uppercase mb-1">Floor</p>
                              <p className="text-gama-text font-bold">
                                R$ {orc.precoFloor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>

                            {/* Practiced Price */}
                            <div className="bg-gama-primary/10 rounded-lg p-3 border border-gama-primary/30">
                              <p className="text-gama-text-muted text-xs uppercase mb-1">Praticado</p>
                              <p className="text-gama-primary font-bold">
                                R$ {orc.precoPraticado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>

                            {/* Multiplier */}
                            <div className="bg-gama-surface/50 rounded-lg p-3">
                              <p className="text-gama-text-muted text-xs uppercase mb-1">Multi.</p>
                              <p className="text-gama-text font-bold">
                                {orc.multiplicador ? `${orc.multiplicador.toFixed(2)}x` : "—"}
                              </p>
                            </div>

                            {/* Margin */}
                            <div className="bg-gama-surface/50 rounded-lg p-3">
                              <p className="text-gama-text-muted text-xs uppercase mb-1">Margem</p>
                              <p className={`text-lg font-bold ${margin.color}`}>
                                {marginPercent.toFixed(0)}%
                              </p>
                            </div>

                            {/* Status */}
                            <div className="flex flex-col justify-center items-center">
                              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                                {config.label}
                              </div>
                              <p className="text-2xl mt-1">{margin.icon}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 glass glass-card p-6 border-l-2 border-gama-primary">
            <h2 className="text-lg font-bold text-gama-primary mb-4 flex items-center gap-2">
              📋 Fluxo de Orçamento
            </h2>
            <ol className="text-gama-text-secondary space-y-2 text-sm list-decimal list-inside ml-2">
              <li>Crie um novo orçamento selecionando o cliente</li>
              <li>Adicione entregáveis do catálogo com quantidades</li>
              <li>Preço floor é calculado automaticamente</li>
              <li>Adicione markup se necessário</li>
              <li>Salve como rascunho ou envie para cliente</li>
              <li>Exporte como PDF para compartilhamento</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
