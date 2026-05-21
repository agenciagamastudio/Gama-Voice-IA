"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEmpresa, saveEmpresa } from "@/lib/storage";
import { maskPhone, maskCNPJ } from "@/lib/utils";
import type { Empresa } from "@/types/orcamento";

export default function EmpresaPage() {
  const router = useRouter();
  const [emp, setEmp] = useState<Empresa | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setEmp(getEmpresa()); }, []);

  const update = (key: keyof Empresa, val: string) => {
    setEmp((prev) => prev ? { ...prev, [key]: val } : prev);
    setSaved(false);
  };

  const handleSave = () => {
    if (!emp) return;
    saveEmpresa(emp);
    setSaved(true);
    setTimeout(() => router.push("/"), 800);
  };

  if (!emp) return null;

  const ig = emp.instagram ? (emp.instagram.startsWith("@") ? emp.instagram : "@" + emp.instagram) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gama-border backdrop-blur-md bg-gama-surface/40">
          <div className="max-w-3xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <a href="/" className="text-gama-text-secondary hover:text-gama-text transition-colors text-xl font-bold">←</a>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gama-primary to-[primary-light] bg-clip-text text-transparent">Configurações da Empresa</h1>
              {saved && <span className="text-xs text-green-400 font-semibold ml-4">✓ Salvo! Voltando...</span>}
            </div>
            <button onClick={handleSave} className="px-4 py-2 bg-gama-primary text-black font-bold rounded-lg hover:shadow-[0_0_30px_rgba(136,206,17,0.5)] transition-all text-sm">
              Salvar
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-gama-text-secondary text-sm mb-8 leading-relaxed">
            Esses dados aparecem no cabeçalho de todos os orçamentos. Configure uma vez e pronto.
          </p>

          <div className="space-y-6">

            {/* Logo upload */}
            <div className="glass glass-card p-6 flex items-center gap-6">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center font-black text-lg flex-shrink-0 overflow-hidden ${emp.logo_url ? 'bg-transparent' : 'bg-gama-primary text-black'}`}>
                {emp.logo_url
                  ? <img src={emp.logo_url} alt="logo" className="w-14 h-14 object-contain rounded-lg" />
                  : (emp.logo_text || "G")}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white mb-3">Logo da empresa</div>
                <div className="flex gap-2 items-center">
                  <label className="px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-gama-text text-xs font-semibold cursor-pointer hover:border-gama-primary/50 transition-colors">
                    📁 Upload PNG/JPG
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => update("logo_url", reader.result as string);
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {emp.logo_url && (
                    <button onClick={() => update("logo_url", "")} className="text-xs text-[error] hover:text-[error] transition-colors">
                      Remover
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {emp.logo_url ? "✓ Imagem carregada — aparecerá no PDF" : "Ou use a sigla abaixo como fallback"}
                </div>
              </div>
            </div>

            {/* Sigla + Nome */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <label className="block">
                  <span className="text-xs uppercase text-gama-text-secondary font-bold tracking-wider mb-2 block">Sigla</span>
                  <input value={emp.logo_text} onChange={(e) => update("logo_text", e.target.value.slice(0,2).toUpperCase())} maxLength={2} className="w-full px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-white text-center text-lg font-black focus:border-gama-primary/50 transition-colors" />
                </label>
              </div>
              <div className="md:col-span-4">
                <label className="block">
                  <span className="text-xs uppercase text-gama-text-secondary font-bold tracking-wider mb-2 block">Nome da Empresa</span>
                  <input value={emp.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex: GAMA Studio" className="w-full px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-white placeholder-slate-500 focus:border-gama-primary/50 transition-colors" />
                </label>
              </div>
            </div>

            <label className="block">
              <span className="text-xs uppercase text-gama-text-secondary font-bold tracking-wider mb-2 block">CNPJ</span>
              <input value={emp.cnpj} onChange={(e) => update("cnpj", maskCNPJ(e.target.value))} placeholder="00.000.000/0001-00" maxLength={18} className="w-full px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-white placeholder-slate-500 focus:border-gama-primary/50 transition-colors" />
            </label>

            <label className="block">
              <span className="text-xs uppercase text-gama-text-secondary font-bold tracking-wider mb-2 block">Endereço Completo</span>
              <input value={emp.endereco} onChange={(e) => update("endereco", e.target.value)} placeholder="Rua, número, cidade, estado, CEP" className="w-full px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-white placeholder-slate-500 focus:border-gama-primary/50 transition-colors" />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs uppercase text-gama-text-secondary font-bold tracking-wider mb-2 block">Telefone</span>
                <input value={emp.telefone} onChange={(e) => update("telefone", maskPhone(e.target.value))} placeholder="+55 (11) 9 0000-0000" maxLength={20} className="w-full px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-white placeholder-slate-500 focus:border-gama-primary/50 transition-colors" />
              </label>
              <label className="block">
                <span className="text-xs uppercase text-gama-text-secondary font-bold tracking-wider mb-2 block">E-mail</span>
                <input value={emp.email} onChange={(e) => update("email", e.target.value)} placeholder="contato@empresa.com" className="w-full px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-white placeholder-slate-500 focus:border-gama-primary/50 transition-colors" />
              </label>
            </div>

            <label className="block">
              <span className="text-xs uppercase text-gama-text-secondary font-bold tracking-wider mb-2 block">@Instagram (opcional)</span>
              <input value={emp.instagram || ""} onChange={(e) => update("instagram", e.target.value)} placeholder="@gamaestudio" className="w-full px-3 py-2 rounded-lg border border-gama-border bg-gama-surface/50 text-white placeholder-slate-500 focus:border-gama-primary/50 transition-colors" />
            </label>
          </div>

          {/* Preview do header */}
          <div className="mt-12 glass glass-card p-6 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-black text-base flex-shrink-0 overflow-hidden ${emp.logo_url ? 'bg-transparent' : 'bg-gama-primary text-black'}`}>
              {emp.logo_url
                ? <img src={emp.logo_url} alt="logo" className="w-11 h-11 object-contain rounded-lg" />
                : (emp.logo_text || "G")}
            </div>
            <div>
              <div className="font-bold text-base text-white">{emp.nome || "Nome da empresa"}</div>
              <div className="text-xs text-gama-text-secondary mt-1 leading-relaxed">
                {emp.cnpj && <>{emp.cnpj} · </>}{emp.telefone || "Telefone"}<br />
                {emp.email || "E-mail"}{ig && <span className="text-gama-primary"> · {ig}</span>}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 text-center">Preview do cabeçalho do orçamento</div>
        </div>
      </div>
    </div>
  );
}

const FIELD_STYLE: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const LABEL_STYLE: React.CSSProperties = { fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 };
const INPUT: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13, outline: "none" };
