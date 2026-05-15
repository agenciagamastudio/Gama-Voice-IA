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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Topbar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ color: "var(--text-3)", fontSize: 18 }}>←</a>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Configurações da Empresa</span>
          {saved && <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✓ Salvo! Voltando...</span>}
        </div>
        <button onClick={handleSave} style={{ padding: "8px 20px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
          Salvar
        </button>
      </div>

      <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 24px" }}>
        <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 32, lineHeight: 1.6 }}>
          Esses dados aparecem no cabeçalho de todos os orçamentos. Configure uma vez e pronto.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Logo upload */}
          <div style={{ padding: "16px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: emp.logo_url ? "transparent" : "#88ce11", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, color: "#0a0a0a", flexShrink: 0, overflow: "hidden" }}>
              {emp.logo_url
                ? <img src={emp.logo_url} alt="logo" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 12 }} />
                : (emp.logo_text || "G")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 8 }}>Logo da empresa</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ padding: "7px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-3)", color: "var(--text-2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  📁 Upload PNG / JPG
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => update("logo_url", reader.result as string);
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {emp.logo_url && (
                  <button onClick={() => update("logo_url", "")} style={{ fontSize: 12, color: "var(--error)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    Remover
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                {emp.logo_url ? "✓ Imagem carregada — aparecerá no PDF" : "Ou use a sigla abaixo como fallback"}
              </div>
            </div>
          </div>

          {/* Sigla + Nome */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
            <label style={FIELD_STYLE}>
              <span style={LABEL_STYLE}>Sigla</span>
              <input value={emp.logo_text} onChange={(e) => update("logo_text", e.target.value.slice(0,2).toUpperCase())} maxLength={2} style={{ ...INPUT, textAlign: "center", fontSize: 20, fontWeight: 900 }} />
            </label>
            <label style={FIELD_STYLE}>
              <span style={LABEL_STYLE}>Nome da Empresa</span>
              <input value={emp.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex: GAMA Studio" style={INPUT} />
            </label>
          </div>

          <label style={FIELD_STYLE}>
            <span style={LABEL_STYLE}>CNPJ</span>
            <input value={emp.cnpj} onChange={(e) => update("cnpj", maskCNPJ(e.target.value))} placeholder="00.000.000/0001-00" maxLength={18} style={INPUT} />
          </label>

          <label style={FIELD_STYLE}>
            <span style={LABEL_STYLE}>Endereço Completo</span>
            <input value={emp.endereco} onChange={(e) => update("endereco", e.target.value)} placeholder="Rua, número, cidade, estado, CEP" style={INPUT} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={FIELD_STYLE}>
              <span style={LABEL_STYLE}>Telefone</span>
              <input value={emp.telefone} onChange={(e) => update("telefone", maskPhone(e.target.value))} placeholder="+55 (11) 9 0000-0000" maxLength={20} style={INPUT} />
            </label>
            <label style={FIELD_STYLE}>
              <span style={LABEL_STYLE}>E-mail</span>
              <input value={emp.email} onChange={(e) => update("email", e.target.value)} placeholder="contato@empresa.com" style={INPUT} />
            </label>
          </div>

          <label style={FIELD_STYLE}>
            <span style={LABEL_STYLE}>@Instagram (opcional)</span>
            <input value={emp.instagram || ""} onChange={(e) => update("instagram", e.target.value)} placeholder="@gamaestudio" style={INPUT} />
          </label>
        </div>

        {/* Preview do header */}
        <div style={{ marginTop: 36, padding: 20, background: "#0a0a0a", borderRadius: 12, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: emp.logo_url ? "transparent" : "#88ce11", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#0a0a0a", flexShrink: 0, overflow: "hidden" }}>
            {emp.logo_url
              ? <img src={emp.logo_url} alt="logo" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10 }} />
              : (emp.logo_text || "G")}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{emp.nome || "Nome da empresa"}</div>
            <div style={{ fontSize: 11, color: "#71717a", marginTop: 2, lineHeight: 1.7 }}>
              {emp.cnpj && <>{emp.cnpj} · </>}{emp.telefone || "Telefone"}<br />
              {emp.email || "E-mail"}{ig && <span style={{ color: "#88ce11" }}> · {ig}</span>}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8, textAlign: "center" }}>Preview do cabeçalho do orçamento</div>
      </div>
    </div>
  );
}

const FIELD_STYLE: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const LABEL_STYLE: React.CSSProperties = { fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 };
const INPUT: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 13, outline: "none" };
