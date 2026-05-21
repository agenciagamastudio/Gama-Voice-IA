"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Template {
  id: string;
  nome: string;
  descricao: string;
  itens: Array<{ entregavelId: string; quantidade: number }>;
  criadoEm: string;
  usageCount: number;
}

export default function SalvarTemplatePage() {
  const router = useRouter();
  const [orcamento, setOrcamento] = useState<any>(null);
  const [nomTemplate, setNomTemplate] = useState("");
  const [descricao, setDescricao] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [similares, setSimilares] = useState(0);
  const [mostrarNudge, setMostrarNudge] = useState(false);

  useEffect(() => {
    const dados = sessionStorage.getItem("orcamentoEmEdicao");
    if (!dados) {
      router.push("/orcamentos");
      return;
    }

    const orcamentoData = JSON.parse(dados);
    setOrcamento(orcamentoData);

    // TODO: carregar templates do banco
    const templatesSalvos: Template[] = JSON.parse(
      localStorage.getItem("templates") || "[]"
    );
    setTemplates(templatesSalvos);

    // Contar similares
    const similaresCont = templatesSalvos.filter(
      (t) =>
        t.itens.length === orcamentoData.itens.length &&
        t.itens.every((item: any, idx: number) =>
          orcamentoData.itens[idx] &&
          item.entregavelId === orcamentoData.itens[idx].entregavelId
        )
    ).length;

    setSimilares(similaresCont);
    setMostrarNudge(similaresCont < 5);
  }, [router]);

  const handleSalvarTemplate = () => {
    if (!nomTemplate.trim()) return;

    const novoTemplate: Template = {
      id: `tpl-${Date.now()}`,
      nome: nomTemplate,
      descricao,
      itens: orcamento.itens,
      criadoEm: new Date().toISOString(),
      usageCount: 0,
    };

    const templatesSalvos = JSON.parse(
      localStorage.getItem("templates") || "[]"
    );
    templatesSalvos.push(novoTemplate);
    localStorage.setItem("templates", JSON.stringify(templatesSalvos));

    sessionStorage.removeItem("orcamentoEmEdicao");
    router.push("/orcamentos");
  };

  if (!orcamento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 flex items-center justify-center">
        <p className="text-slate-400 text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gama-bg via-gama-surface to-gama-surface-2 relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(148,163,184,0.1)] backdrop-blur-md bg-[rgba(15,23,42,0.4)]">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <Link href="/orcamentos" className="inline-flex items-center gap-2 text-slate-400 hover:text-gama-primary transition-colors mb-4">
              <span>←</span>
              <span>Voltar</span>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gama-primary to-gama-primary bg-clip-text text-transparent">
              📋 Salvar como Template
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Nudge Alert */}
          {mostrarNudge && similares > 0 && (
            <div className="glass glass-card p-6 border border-yellow-500/30 bg-[rgba(251,146,60,0.1)] mb-8 rounded-lg">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-yellow-300 text-sm leading-relaxed">
                    Você já criou {similares} orçamento(s) com essa mesma estrutura de itens.
                    Recomendo esperar até ter pelo menos 5 orçamentos similares antes de salvar como template.
                    Isso garante um padrão mais consolidado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="glass glass-card p-8 border border-[rgba(148,163,184,0.1)] rounded-lg">
            <div className="mb-8">
              <p className="text-slate-400 text-xs uppercase mb-2 tracking-wider">Informações do Template</p>
              <p className="text-slate-300 text-sm">Dê um nome e descrição para este padrão de orçamento</p>
            </div>

            <div className="space-y-6 mb-8">
              {/* Nome Input */}
              <div>
                <label className="block text-slate-400 text-sm mb-3 font-medium">Nome do Template</label>
                <input
                  type="text"
                  placeholder="Ex: Pacote Social Media Básico"
                  value={nomTemplate}
                  onChange={(e) => setNomTemplate(e.target.value)}
                  className="w-full px-6 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-gama-primary/50 focus:ring-1 focus:ring-gama-primary/20 transition-all"
                />
              </div>

              {/* Descrição Input */}
              <div>
                <label className="block text-slate-400 text-sm mb-3 font-medium">Descrição (opcional)</label>
                <textarea
                  placeholder="Descreva quando este template é usado..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-6 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-gama-primary/50 focus:ring-1 focus:ring-gama-primary/20 transition-all h-24 resize-none"
                />
              </div>

              {/* Items Preview */}
              <div className="p-6 rounded-lg bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.1)]">
                <p className="text-slate-400 text-xs uppercase mb-4 tracking-wider font-medium">Itens que serão salvos</p>
                <ul className="space-y-2">
                  {orcamento.itens.map((item: any, idx: number) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-center gap-2">
                      <span className="text-gama-primary">•</span>
                      <span>{item.nome}</span>
                      <span className="text-slate-500">(qtd: {item.quantidade})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 border-t border-[rgba(148,163,184,0.1)] pt-8">
              <button
                onClick={handleSalvarTemplate}
                disabled={!nomTemplate.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  nomTemplate.trim()
                    ? "bg-[primary] text-black hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] hover:scale-105 active:scale-95"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                }`}
              >
                📁 Salvar Template
              </button>
              <Link href="/orcamentos" className="flex-1">
                <button className="w-full px-6 py-3 bg-[rgba(148,163,184,0.05)] border border-[rgba(148,163,184,0.2)] rounded-lg text-slate-300 font-medium hover:border-gama-primary/50 hover:bg-[rgba(136,206,17,0.05)] transition-all">
                  ✕ Cancelar
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
