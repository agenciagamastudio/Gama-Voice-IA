"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAll, remove, duplicate } from "@/lib/storage";
import { fmt } from "@/lib/utils";
import type { Orcamento } from "@/types/orcamento";

export default function HomePage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setOrcamentos(getAll());
  }, []);

  const handleRemove = (id: string) => {
    remove(id);
    setOrcamentos(getAll());
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicate(id);
    if (dup) setOrcamentos(getAll());
  };

  // Agrupar por data de emissão
  const groupedByDate = new Map<string, Orcamento[]>();
  orcamentos.forEach((orc) => {
    try {
      const date = orc.datas.emissao.split("T")[0]; // YYYY-MM-DD
      const dateObj = new Date(date + "T00:00:00Z"); // Adiciona Z para UTC
      const dateFormatted = dateObj.toLocaleDateString("pt-BR", { timeZone: "UTC" });
      if (!groupedByDate.has(dateFormatted)) {
        groupedByDate.set(dateFormatted, []);
      }
      groupedByDate.get(dateFormatted)!.push(orc);
    } catch (e) {
      console.error("Erro ao formatar data:", orc.datas.emissao, e);
    }
  });

  // Ordenar datas decrescente
  const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("/");
    const [dayB, monthB, yearB] = b.split("/");
    const dateA = new Date(`${yearA}-${monthA}-${dayA}T00:00:00Z`);
    const dateB = new Date(`${yearB}-${monthB}-${dayB}T00:00:00Z`);
    return dateB.getTime() - dateA.getTime();
  });

  // Filtrar por busca
  const filteredDates = sortedDates.filter((date) => {
    return groupedByDate
      .get(date)!
      .some((orc) =>
        orc.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orc.numero.toLowerCase().includes(searchTerm.toLowerCase())
      );
  });

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const totalValue = orcamentos.reduce((sum, orc) => sum + orc.precoPraticado, 0);

  const countByStatus = {
    rascunho: orcamentos.filter((o) => o.status === "rascunho").length,
    enviado: orcamentos.filter((o) => o.status === "enviado").length,
    aprovado: orcamentos.filter((o) => o.status === "aprovado").length,
    rejeitado: orcamentos.filter((o) => o.status === "rejeitado").length,
  };

  // Gerar alertas contextuais
  const alerts: Array<{ tipo: "warning" | "danger" | "success"; mensagem: string }> = [];

  // Alerta: orçamentos em espera (enviado)
  if (countByStatus.enviado > 0) {
    alerts.push({
      tipo: "warning",
      mensagem: `⏳ ${countByStatus.enviado} orçamento${countByStatus.enviado > 1 ? "s" : ""} em espera por aprovação`,
    });
  }

  // Alerta: orçamentos rejeitados
  if (countByStatus.rejeitado > 0) {
    alerts.push({
      tipo: "danger",
      mensagem: `⚠️ ${countByStatus.rejeitado} orçamento${countByStatus.rejeitado > 1 ? "s" : ""} rejeitado${countByStatus.rejeitado > 1 ? "s" : ""} — revisar estratégia de preços`,
    });
  }

  // Alerta: orçamentos com baixa margem (<35%)
  const orcamentosLowMargin = orcamentos.filter((o) => {
    const margin = (o.precoPraticado - o.precoFloor) / o.precoFloor * 100;
    return margin < 35 && o.status === "aprovado";
  });
  if (orcamentosLowMargin.length > 0) {
    alerts.push({
      tipo: "warning",
      mensagem: `💰 ${orcamentosLowMargin.length} orçamento${orcamentosLowMargin.length > 1 ? "s" : ""} com margem abaixo da meta (35%)`,
    });
  }

  // Alerta: oportunidade de premium
  const orcamentosPadrao = orcamentos.filter((o) => o.tagContexto === "padrao" && o.status === "aprovado");
  if (orcamentosPadrao.length >= 3) {
    alerts.push({
      tipo: "success",
      mensagem: `✨ ${orcamentosPadrao.length} clientes Padrão — considere oferecer upgrade para Premium`,
    });
  }

  // Alerta: sem orçamentos
  if (orcamentos.length === 0) {
    alerts.push({
      tipo: "success",
      mensagem: "🚀 Comece criando seu primeiro orçamento",
    });
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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-bold text-gama-primary mb-2">
                  GAMA Orçamento
                </h1>
                <p className="text-gama-text-secondary text-lg">Gerencie seus orçamentos com inteligência</p>
              </div>
              <Link href="/orcamentos/novo" className="px-6 py-3 bg-gama-primary text-gama-bg font-bold rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all">
                + Novo Orçamento
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            <div className="glass-card p-6 border-gama-primary/30 bg-gama-primary/5">
              <p className="text-gama-text-muted text-xs uppercase mb-2">Total</p>
              <p className="text-3xl font-bold text-gama-primary">{fmt(totalValue)}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-gama-text-muted text-xs uppercase mb-2">Rascunho</p>
              <p className="text-3xl font-bold text-gama-text">{countByStatus.rascunho}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-gama-text-muted text-xs uppercase mb-2">Enviado</p>
              <p className="text-3xl font-bold text-gama-warning">{countByStatus.enviado}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-gama-text-muted text-xs uppercase mb-2">Aprovado</p>
              <p className="text-3xl font-bold text-gama-success">{countByStatus.aprovado}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-gama-text-muted text-xs uppercase mb-2">Rejeitado</p>
              <p className="text-3xl font-bold text-gama-error">{countByStatus.rejeitado}</p>
            </div>
          </div>

          {/* Alertas */}
          {alerts.length > 0 && (
            <div className="space-y-3 mb-8">
              {alerts.map((alert, idx) => (
                <div key={idx} className={`glass-card p-4 border-l-4 text-sm font-medium ${
                  alert.tipo === "danger" ? "border-gama-error bg-gama-error/10 text-gama-error" :
                  alert.tipo === "warning" ? "border-gama-warning bg-gama-warning/10 text-gama-warning" :
                  "border-gama-success bg-gama-success/10 text-gama-success"
                }`}>
                  {alert.mensagem}
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="mb-8 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gama-text-muted">🔍</span>
            <input
              type="text"
              placeholder="Buscar por cliente ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm px-4 py-2 pl-10 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text placeholder-gama-text-muted focus:outline-none focus:border-gama-primary/50"
            />
          </div>

          {/* Quicklinks */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <Link href="/catalogo" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text-secondary text-sm font-medium hover:border-gama-primary/50 transition-colors">
              📦 Catálogo
            </Link>
            <Link href="/proposal" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text-secondary text-sm font-medium hover:border-gama-primary/50 transition-colors">
              📄 Proposta
            </Link>
            <Link href="/orcamentos/auditoria" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text-secondary text-sm font-medium hover:border-gama-primary/50 transition-colors">
              📊 Auditoria
            </Link>
            <Link href="/empresa" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text-secondary text-sm font-medium hover:border-gama-primary/50 transition-colors">
              ⚙️ Empresa
            </Link>
            <Link href="/lixeira" className="px-4 py-2 bg-gama-surface/50 border border-gama-border rounded-lg text-gama-text-secondary text-sm font-medium hover:border-gama-primary/50 transition-colors">
              🗑️ Lixeira
            </Link>
          </div>

          {/* Orçamentos agrupados por data */}
          {filteredDates.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="text-xl font-bold text-gama-text mb-2">Nenhum orçamento encontrado</p>
              <p className="text-gama-text-secondary mb-6">Crie seu primeiro orçamento agora</p>
              <Link href="/orcamentos/novo" className="inline-block px-6 py-2 bg-gama-primary/20 border border-gama-primary text-gama-primary rounded-lg hover:bg-gama-primary/30 transition-all font-medium">
                + Criar Orçamento
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDates.map((date) => {
                const isExpanded = expandedDates.has(date);
                const orcsInDate = groupedByDate.get(date)!;
                const dateTotal = orcsInDate.reduce((sum, orc) => sum + orc.precoPraticado, 0);

                return (
                  <div key={date}>
                    <button
                      onClick={() => toggleDate(date)}
                      className="w-full px-4 py-3 bg-gama-surface/50 border border-gama-border rounded-lg flex items-center justify-between hover:border-gama-primary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{isExpanded ? "📂" : "📁"}</span>
                        <span className="font-bold text-gama-text">{date}</span>
                        <span className="text-xs text-gama-text-muted font-medium">
                          {orcsInDate.length} {orcsInDate.length === 1 ? "orçamento" : "orçamentos"}
                        </span>
                      </div>
                      <span className="text-gama-primary font-bold">{fmt(dateTotal)}</span>
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 mt-3 pl-4">
                        {orcsInDate.map((orc) => (
                          <Link key={orc.id} href={`/orcamentos/${orc.id}`}>
                            <div className="glass-card p-4 group hover:glass-intense transition-all cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-gama-text group-hover:text-gama-primary transition-colors">
                                    {orc.cliente.nome}
                                  </p>
                                  <p className="text-xs text-gama-text-muted mt-1">
                                    #{orc.numero} • {new Date(orc.datas.emissao).toLocaleDateString("pt-BR")} • {orc.itens.length} itens
                                  </p>
                                </div>

                                <div className="text-right mx-4">
                                  <p className="text-lg font-bold text-gama-primary">{fmt(orc.precoPraticado)}</p>
                                  <p className="text-xs text-gama-text-muted mt-1">
                                    Margem: {((orc.precoPraticado - orc.precoFloor) / orc.precoFloor * 100).toFixed(1)}%
                                  </p>
                                </div>

                                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gama-primary/10 text-gama-primary">
                                  {orc.status.charAt(0).toUpperCase() + orc.status.slice(1)}
                                </div>

                                <div className="flex gap-2 ml-4">
                                  <button onClick={(e) => { e.preventDefault(); handleDuplicate(orc.id); }} className="px-2 py-1 text-sm">📋</button>
                                  <button onClick={(e) => { e.preventDefault(); handleRemove(orc.id); }} className="px-2 py-1 text-sm">🗑️</button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
