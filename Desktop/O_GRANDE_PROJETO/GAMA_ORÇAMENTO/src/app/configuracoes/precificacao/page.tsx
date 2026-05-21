"use client";

import { useState, useEffect } from "react";
import { getPricingConfig, savePricingConfig, PRICING_DEFAULT } from "@/lib/storage";
import type { PricingConfig, CustoFixo } from "@/types/orcamento";
import { genId, fmt } from "@/lib/utils";

const SUGESTOES_CUSTOS = [
  { nome: "Adobe Creative Suite", categoria: "software" as const, valor_sugerido: 300 },
  { nome: "Figma Pro", categoria: "software" as const, valor_sugerido: 90 },
  { nome: "Canva Pro", categoria: "software" as const, valor_sugerido: 55 },
  { nome: "Google Workspace", categoria: "software" as const, valor_sugerido: 35 },
  { nome: "Internet", categoria: "infra" as const, valor_sugerido: 150 },
  { nome: "Celular (plano)", categoria: "infra" as const, valor_sugerido: 80 },
  { nome: "Energia elétrica", categoria: "infra" as const, valor_sugerido: 200 },
];

export default function ConfiguraPrecificacaoPage() {
  const [cfg, setCfg] = useState<PricingConfig>(PRICING_DEFAULT);
  const [saved, setSaved] = useState(false);
  const [newCustoNome, setNewCustoNome] = useState("");
  const [newCustoValor, setNewCustoValor] = useState("");
  const [newCustoCategoria, setNewCustoCategoria] = useState<"software" | "infra" | "pessoal" | "outro">("software");
  const [editingCustoId, setEditingCustoId] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState<string>("");
  const [editingCategoria, setEditingCategoria] = useState<"software" | "infra" | "pessoal" | "outro">("software");
  const [editingValor, setEditingValor] = useState<string>("");

  useEffect(() => {
    setCfg(getPricingConfig());
  }, []);

  const handleSave = () => {
    savePricingConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddCusto = () => {
    if (!newCustoNome || !newCustoValor) return;
    const newCusto: CustoFixo = {
      id: genId(),
      nome: newCustoNome,
      valor_mensal: parseFloat(newCustoValor),
      categoria: newCustoCategoria,
    };
    setCfg({ ...cfg, custos_fixos: [...cfg.custos_fixos, newCusto] });
    setNewCustoNome("");
    setNewCustoValor("");
  };

  const handleRemoveCusto = (id: string) => {
    setCfg({ ...cfg, custos_fixos: cfg.custos_fixos.filter((c) => c.id !== id) });
  };

  const handleStartEdit = (id: string, nome: string, categoria: "software" | "infra" | "pessoal" | "outro", valor: number) => {
    setEditingCustoId(id);
    setEditingNome(nome);
    setEditingCategoria(categoria);
    setEditingValor(valor.toString());
  };

  const handleSaveEdit = (id: string) => {
    const novoValor = parseFloat(editingValor) || 0;
    if (editingNome.trim() && novoValor > 0) {
      setCfg({
        ...cfg,
        custos_fixos: cfg.custos_fixos.map((c) =>
          c.id === id ? { ...c, nome: editingNome, categoria: editingCategoria, valor_mensal: novoValor } : c
        ),
      });
    }
    setEditingCustoId(null);
    setEditingNome("");
    setEditingCategoria("software");
    setEditingValor("");
  };

  const handleCancelEdit = () => {
    setEditingCustoId(null);
    setEditingNome("");
    setEditingCategoria("software");
    setEditingValor("");
  };

  const handleAddSugestao = (nome: string, valor: number) => {
    if (cfg.custos_fixos.some((c) => c.nome === nome)) return;
    const newCusto: CustoFixo = { id: genId(), nome, valor_mensal: valor, categoria: "software" };
    setCfg({ ...cfg, custos_fixos: [...cfg.custos_fixos, newCusto] });
  };

  const totalCustoFixo = cfg.custos_fixos.reduce((s, c) => s + c.valor_mensal, 0);
  const totalUnidades = (cfg.unidades_faturamento?.projetos_fechados || 0) +
                        (cfg.unidades_faturamento?.servicos_soltos || 0) +
                        (cfg.unidades_faturamento?.pacotes_combos || 0) +
                        (cfg.unidades_faturamento?.consultoria_hora || 0);
  const overheadPorUnidade = totalUnidades > 0 ? totalCustoFixo / totalUnidades : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2]">
      {/* Topbar */}
      <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)] px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <a href="/catalogo" className="text-slate-500 hover:text-slate-300 transition-colors text-lg">←</a>
          <span className="font-bold text-sm">Configuração de Precificação</span>
          {saved && <span className="text-xs text-green-400 font-semibold">✓ Salvo!</span>}
        </div>
        <button onClick={handleSave} className="px-5 py-1.5 rounded-lg border-none bg-[primary] text-black font-bold text-xs hover:shadow-[0_0_20px_rgba(136,206,17,0.4)] transition-all">
          Salvar Configuração
        </button>
      </div>

      <div className="max-w-2xl mx-auto pt-8 pb-12 px-6">
        {/* Explicação */}
        <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-200 font-semibold mb-2">💡 Como funciona</p>
          <p className="text-xs text-yellow-300 leading-relaxed">
            Aqui você configura seus custos fixos <strong>uma vez</strong>. Depois, quando criar serviços no catálogo, o sistema calcula automaticamente quanto cada projeto precisa cobrir de overhead. Nunca mais você esquece um custo fixo!
          </p>
        </div>

        {/* Section 1: Taxa Horária */}
        <div className="glass glass-card p-6 mb-6">
          <h2 className="text-sm font-bold mb-4 text-white">💰 Taxa Horária</h2>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Quanto você cobra por hora?</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={cfg.taxa_horaria}
                  onChange={(e) => setCfg({ ...cfg, taxa_horaria: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary]"
                />
                <span className="flex items-center text-slate-400 font-semibold">R$/h</span>
              </div>
            </label>
            <p className="text-xs text-slate-400">Base para calcular custo de execução de serviços por hora</p>
          </div>
        </div>

        {/* Section 2: Unidades de Faturamento */}
        <div className="glass glass-card p-6 mb-6">
          <h2 className="text-sm font-bold mb-4 text-white">📊 Unidades de Faturamento</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Quantas unidades de faturamento você tem por mês? Os custos fixos serão distribuídos entre TODAS as unidades (projetos fechados, serviços soltos, pacotes/combos e consultoria).
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Projetos Fechados</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.projetos_fechados || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    projetos_fechados: parseInt(e.target.value) || 0
                  }
                })}
                className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary]"
              />
              <span className="text-xs text-slate-500">Contratos/projetos completos</span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Serviços Soltos</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.servicos_soltos || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    servicos_soltos: parseInt(e.target.value) || 0
                  }
                })}
                className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary]"
              />
              <span className="text-xs text-slate-500">Posts, stories, pequenos trabalhos</span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Pacotes/Combos</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.pacotes_combos || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    pacotes_combos: parseInt(e.target.value) || 0
                  }
                })}
                className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary]"
              />
              <span className="text-xs text-slate-500">Pacotes de serviços pré-definidos</span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Consultoria/Hora</span>
              <input
                type="number"
                min="0"
                value={cfg.unidades_faturamento?.consultoria_hora || 0}
                onChange={(e) => setCfg({
                  ...cfg,
                  unidades_faturamento: {
                    ...cfg.unidades_faturamento,
                    consultoria_hora: parseInt(e.target.value) || 0
                  }
                })}
                className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary]"
              />
              <span className="text-xs text-slate-500">Horas de consultoria/atendimento</span>
            </label>
          </div>
          <p className="text-xs text-slate-500">💡 O overhead será distribuído entre TODAS as unidades, não apenas "projetos"</p>
        </div>

        {/* Section 3: Custos Fixos */}
        <div className="glass glass-card p-6 mb-6">
          <h2 className="text-sm font-bold mb-4 text-white">📌 Custos Fixos Mensais</h2>

          {/* Sugestões prontas */}
          <div className="mb-5">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Sugestões (clique para adicionar)</p>
            <div className="flex gap-2 flex-wrap">
              {SUGESTOES_CUSTOS.map((s) => (
                <button
                  key={s.nome}
                  onClick={() => handleAddSugestao(s.nome, s.valor_sugerido)}
                  disabled={cfg.custos_fixos.some((c) => c.nome === s.nome)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                    cfg.custos_fixos.some((c) => c.nome === s.nome)
                      ? "border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-slate-500 cursor-default opacity-50"
                      : "border-[rgba(148,163,184,0.2)] bg-[rgba(148,163,184,0.1)] text-slate-300 hover:border-[primary]/50 cursor-pointer"
                  }`}
                >
                  {s.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de custos */}
          {cfg.custos_fixos.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Seus custos</p>
              <div className="flex flex-col gap-2">
                {cfg.custos_fixos.map((custo) => (
                  <div
                    key={custo.id}
                    className={`flex justify-between ${editingCustoId === custo.id ? "items-start" : "items-center"} p-3 rounded-lg transition-all ${
                      editingCustoId === custo.id
                        ? "bg-[rgba(136,206,17,0.1)] border border-[primary]"
                        : "bg-[rgba(148,163,184,0.05)]"
                    }`}
                  >
                    {editingCustoId === custo.id ? (
                      // Modo edição
                      <div className="flex-1 flex flex-col gap-2 mr-3">
                        <input
                          type="text"
                          placeholder="Nome do custo"
                          value={editingNome}
                          onChange={(e) => setEditingNome(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(custo.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          autoFocus
                          className="px-2 py-1 rounded-lg border border-[primary] bg-[rgba(15,23,42,0.8)] text-white text-xs focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editingCategoria}
                            onChange={(e) => setEditingCategoria(e.target.value as any)}
                            className="px-2 py-1 rounded-lg border border-[primary] bg-[rgba(15,23,42,0.8)] text-white text-xs focus:outline-none"
                          >
                            <option value="software">Software</option>
                            <option value="infra">Infraestrutura</option>
                            <option value="pessoal">Pessoal</option>
                            <option value="outro">Outro</option>
                          </select>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">R$</span>
                            <input
                              type="number"
                              value={editingValor}
                              onChange={(e) => setEditingValor(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(custo.id);
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                              className="flex-1 px-2 py-1 rounded-lg border border-[primary] bg-[rgba(15,23,42,0.8)] text-white text-xs focus:outline-none"
                            />
                            <span className="text-xs text-slate-400">/mês</span>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveEdit(custo.id)}
                            className="bg-none border-none text-[success] cursor-pointer text-sm font-bold"
                          >
                            ✓ Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-none border-none text-slate-500 cursor-pointer text-sm"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo visualização
                      <>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-white">{custo.nome}</div>
                          <div className="text-xs text-slate-500">{custo.categoria}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStartEdit(custo.id, custo.nome, custo.categoria, custo.valor_mensal)}
                            className="bg-none border-none text-xs font-semibold text-[primary] cursor-pointer p-0"
                          >
                            {fmt(custo.valor_mensal)}/mês
                          </button>
                          <button
                            onClick={() => handleRemoveCusto(custo.id)}
                            className="bg-none border-none text-slate-500 cursor-pointer text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar novo custo */}
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Nome do custo"
              value={newCustoNome}
              onChange={(e) => setNewCustoNome(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[primary]"
            />
            <select
              value={newCustoCategoria}
              onChange={(e) => setNewCustoCategoria(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm focus:outline-none focus:border-[primary]"
            >
              <option value="software">Software</option>
              <option value="infra">Infraestrutura</option>
              <option value="pessoal">Pessoal</option>
              <option value="outro">Outro</option>
            </select>
            <input
              type="number"
              placeholder="Valor mensal"
              value={newCustoValor}
              onChange={(e) => setNewCustoValor(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[rgba(148,163,184,0.1)] bg-[rgba(148,163,184,0.05)] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[primary]"
            />
            <button
              onClick={handleAddCusto}
              disabled={!newCustoNome || !newCustoValor}
              className={`px-3 py-2 rounded-lg border-none text-black font-bold text-sm transition-all ${
                newCustoNome && newCustoValor
                  ? "bg-[primary] cursor-pointer hover:shadow-[0_0_20px_rgba(136,206,17,0.4)]"
                  : "bg-[rgba(148,163,184,0.1)] text-slate-500 cursor-not-allowed"
              }`}
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* Section 4: Margem Padrão */}
        <div className="glass glass-card p-6 mb-6">
          <h2 className="text-sm font-bold mb-4 text-white">📈 Margem Padrão</h2>
          <div className="flex flex-col gap-3">
            <input
              type="range"
              min="0"
              max="60"
              value={cfg.margem_padrao}
              onChange={(e) => setCfg({ ...cfg, margem_padrao: parseInt(e.target.value) })}
              className="w-full accent-[primary]"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-white">Seu lucro padrão: <strong className="text-[primary]">{cfg.margem_padrao}%</strong></span>
              <span className="text-xs text-slate-400">Se custo = R$ 1000, você ganha R$ {Math.round((cfg.margem_padrao / 100) * 1000)}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Resumo */}
        <div className="glass glass-card p-6 border border-[primary]/30">
          <h2 className="text-sm font-bold mb-4 text-white">📊 Resumo do Overhead</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Total de custos fixos/mês</p>
              <p className="text-2xl font-black text-[primary]">{fmt(totalCustoFixo)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Total de unidades</p>
              <p className="text-2xl font-black text-[primary]">{totalUnidades}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Overhead por unidade</p>
              <p className="text-2xl font-black text-[primary]">{fmt(overheadPorUnidade)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Margem padrão</p>
              <p className="text-2xl font-black text-[primary]">{cfg.margem_padrao}%</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[primary]/20">
            <p className="text-xs text-slate-400">
              💡 <strong>Como funciona:</strong> Custos fixos totais (R$ {fmt(totalCustoFixo)}) divididos entre suas {totalUnidades} unidade{totalUnidades !== 1 ? 's' : ''} = R$ {fmt(overheadPorUnidade)} por unidade.
              Esse overhead será adicionado automaticamente a cada serviço quando você criar orçamentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
