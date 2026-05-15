"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Orcamento, OrcamentoItem, OrcamentoStatus, CatalogItem } from "@/types/orcamento";
import { save, saveEmpresa, getCatalogo } from "@/lib/storage";
import { genId, fmt, maskPhone, maskCNPJ, maskDocumento } from "@/lib/utils";
import OrcamentoDoc from "./OrcamentoDoc";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LIST: OrcamentoStatus[] = ["Rascunho","Pendente","Aprovado","Rejeitado"];

const PHASES = [
  { id: 1, label: "Dados Gerais",        icon: "📋" },
  { id: 2, label: "Dados da Empresa",    icon: "🏢" },
  { id: 3, label: "Dados do Cliente",    icon: "👤" },
  { id: 4, label: "Itens do Orçamento",  icon: "📦" },
  { id: 5, label: "Termos e Garantia",   icon: "📝" },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { initial: Orcamento; isNew?: boolean }

export default function StudioEditor({ initial, isNew }: Props) {
  const router = useRouter();
  const [orc, setOrc]       = useState<Orcamento>(initial);
  const [phase, setPhase]   = useState(1);
  const [saved, setSaved]   = useState(false);
  const [preview, setPreview] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  useEffect(() => { setCatalog(getCatalogo()); }, []);

  // ── Updaters ─────────────────────────────────────────────────────────────

  const update = useCallback(<K extends keyof Orcamento>(key: K, val: Orcamento[K]) => {
    setOrc((p) => ({ ...p, [key]: val })); setSaved(false);
  }, []);

  const updateCliente  = (key: keyof Orcamento["cliente"], val: string) =>
    setOrc((p) => { setSaved(false); return { ...p, cliente: { ...p.cliente, [key]: val } }; });

  const updateEmpresa  = (key: keyof Orcamento["empresa"], val: string) =>
    setOrc((p) => { setSaved(false); return { ...p, empresa: { ...p.empresa, [key]: val } }; });

  const addItem = () => {
    const it: OrcamentoItem = { id: genId(), descricao: "", quantidade: 1, preco_unitario: 0, total: 0 };
    setOrc((p) => ({ ...p, itens: [...p.itens, it] })); setSaved(false);
  };

  const updateItem = (id: string, key: keyof OrcamentoItem, val: string | number) =>
    setOrc((p) => ({
      ...p,
      itens: p.itens.map((it) => {
        if (it.id !== id) return it;
        const u = { ...it, [key]: val };
        u.total = Number(u.quantidade) * Number(u.preco_unitario);
        return u;
      }),
    }));

  const fillFromCatalog = (itemId: string, cat: CatalogItem) => {
    setOrc((p) => ({
      ...p,
      itens: p.itens.map((it) => {
        if (it.id !== itemId) return it;
        // cat.preco já inclui overhead + margem (pré-calculado no catálogo)
        const desc = cat.descricao ? `${cat.nome} — ${cat.descricao}` : cat.nome;
        return { ...it, descricao: desc, preco_unitario: cat.preco, total: it.quantidade * cat.preco };
      }),
    }));
    setSaved(false);
  };

  const removeItem = (id: string) =>
    setOrc((p) => ({ ...p, itens: p.itens.filter((i) => i.id !== id) }));

  const handleSave = () => {
    save(orc);
    saveEmpresa(orc.empresa);
    setSaved(true);
    if (isNew) router.push("/");
  };

  // ── Totals ────────────────────────────────────────────────────────────────

  const subtotal  = orc.itens.reduce((s, i) => s + i.total, 0);
  const desconto  = orc.desconto_percentual > 0 ? subtotal * (orc.desconto_percentual / 100) : 0;
  const total     = subtotal - desconto;

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden" }}>

      {/* ── TOPBAR ────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, flexShrink: 0, gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" style={{ color: "var(--text-3)", fontSize: 20, lineHeight: 1 }}>←</a>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{isNew ? "Novo Orçamento" : `#${orc.numero}`}</span>
          {saved && <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✓ Salvo</span>}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setPreview((v) => !v)}
            style={{ padding: "6px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: preview ? "var(--surface-3)" : "transparent", color: preview ? "var(--text)" : "var(--text-2)", fontSize: 12, fontWeight: 600 }}
          >
            {preview ? "✏️ Editor" : "👁 Preview"}
          </button>

          <select
            value={orc.status}
            onChange={(e) => update("status", e.target.value as OrcamentoStatus)}
            style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 12 }}
          >
            {STATUS_LIST.map((s) => <option key={s}>{s}</option>)}
          </select>

          {!isNew && (
            <a href={`/${orc.id}/preview`} style={{ padding: "7px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-green)", background: "var(--primary-dim)", color: "var(--primary)", fontSize: 12, fontWeight: 700 }}>
              🖨 PDF
            </a>
          )}

          <button onClick={handleSave} style={{ padding: "7px 18px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 800, fontSize: 13 }}>
            {isNew ? "Salvar" : "Salvar"}
          </button>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      {preview ? (
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <OrcamentoDoc orc={orc} />
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── LEFT: phases ──────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Phase stepper */}
            <div style={{ padding: "0 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 4, overflowX: "auto", flexShrink: 0 }}>
              {PHASES.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPhase(p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "12px 14px",
                    borderBottom: phase === p.id ? "2px solid var(--primary)" : "2px solid transparent",
                    background: "transparent", border: "none",
                    borderBottomWidth: 2,
                    borderBottomStyle: "solid",
                    borderBottomColor: phase === p.id ? "var(--primary)" : "transparent",
                    color: phase === p.id ? "var(--primary)" : "var(--text-3)",
                    fontWeight: phase === p.id ? 700 : 400,
                    fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    marginBottom: -1,
                  }}
                >
                  <span>{p.icon}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ opacity: 0.5, fontSize: 10 }}>{i + 1}.</span>
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Phase content (scrollable) */}
            <div style={{ flex: 1, overflow: "auto", padding: "28px 28px 120px" }}>

              {/* ── FASE 1: Dados Gerais ───────────────────────────────────── */}
              {phase === 1 && (
                <PhaseWrapper title="Dados Gerais" icon="📋" desc="Número, status e datas do orçamento.">
                  <Grid2>
                    <Field label="Número do Orçamento">
                      <input value={orc.numero} onChange={(e) => update("numero", e.target.value)} style={INPUT} />
                    </Field>
                    <Field label="Status">
                      <select value={orc.status} onChange={(e) => update("status", e.target.value as OrcamentoStatus)} style={INPUT}>
                        {STATUS_LIST.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Data de Emissão">
                      <input
                        value={orc.datas.emissao}
                        onChange={(e) => update("datas", { ...orc.datas, emissao: e.target.value })}
                        placeholder="DD/MM/AAAA" style={INPUT}
                      />
                    </Field>
                    <Field label="Válido até">
                      <input
                        value={orc.datas.validade}
                        onChange={(e) => update("datas", { ...orc.datas, validade: e.target.value })}
                        placeholder="DD/MM/AAAA" style={INPUT}
                      />
                    </Field>
                  </Grid2>
                </PhaseWrapper>
              )}

              {/* ── FASE 2: Dados da Empresa ───────────────────────────────── */}
              {phase === 2 && (
                <PhaseWrapper title="Dados da Empresa" icon="🏢" desc="Aparece no cabeçalho de todos os orçamentos. Salvo automaticamente.">

                  {/* Logo upload */}
                  <div style={{ marginBottom: 20, padding: "14px 16px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: orc.empresa.logo_url ? "transparent" : "#88ce11", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#0a0a0a", flexShrink: 0, overflow: "hidden" }}>
                      {orc.empresa.logo_url
                        ? <img src={orc.empresa.logo_url} alt="logo" style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 10 }} />
                        : (orc.empresa.logo_text || "?")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>Logo da empresa</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <label style={{ padding: "6px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-3)", color: "var(--text-2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          📁 Upload PNG / JPG
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => updateEmpresa("logo_url", reader.result as string);
                            reader.readAsDataURL(file);
                          }} />
                        </label>
                        {orc.empresa.logo_url && (
                          <button onClick={() => updateEmpresa("logo_url", "")} style={{ fontSize: 11, color: "var(--error)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            Remover
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
                        {orc.empresa.logo_url ? "✓ Imagem carregada — aparecerá no PDF" : "Ou use a sigla de 2 letras abaixo"}
                      </div>
                    </div>
                  </div>

                  <Grid2>
                    <Field label="Sigla / Logo (2 letras)" hint="Fallback se não tiver imagem">
                      <input
                        value={orc.empresa.logo_text}
                        onChange={(e) => updateEmpresa("logo_text", e.target.value.slice(0,2).toUpperCase())}
                        maxLength={2}
                        placeholder="GS"
                        style={{ ...INPUT, textAlign: "center", fontSize: 18, fontWeight: 900, letterSpacing: 2 }}
                      />
                    </Field>
                    <Field label="Nome / Razão Social da Empresa">
                      <input
                        value={orc.empresa.nome}
                        onChange={(e) => updateEmpresa("nome", e.target.value)}
                        placeholder="Ex: GAMA Studio Ltda."
                        style={INPUT}
                      />
                    </Field>
                    <Field label="CNPJ" hint="XX.XXX.XXX/XXXX-XX">
                      <input
                        value={orc.empresa.cnpj}
                        onChange={(e) => updateEmpresa("cnpj", maskCNPJ(e.target.value))}
                        placeholder="00.000.000/0001-00"
                        maxLength={18}
                        style={INPUT}
                      />
                    </Field>
                    <Field label="Telefone" hint="+55 (DDD) 9 XXXX-XXXX">
                      <input
                        value={orc.empresa.telefone}
                        onChange={(e) => updateEmpresa("telefone", maskPhone(e.target.value))}
                        placeholder="+55 (11) 9 0000-0000"
                        maxLength={20}
                        style={INPUT}
                      />
                    </Field>
                    <Field label="E-mail">
                      <input
                        value={orc.empresa.email}
                        onChange={(e) => updateEmpresa("email", e.target.value)}
                        placeholder="contato@suaempresa.com.br"
                        type="email"
                        style={INPUT}
                      />
                    </Field>
                    <Field label="@Instagram (opcional)">
                      <input
                        value={orc.empresa.instagram || ""}
                        onChange={(e) => updateEmpresa("instagram", e.target.value)}
                        placeholder="@gamaestudio"
                        style={INPUT}
                      />
                    </Field>
                    <Field label="Endereço Completo" col={2}>
                      <input
                        value={orc.empresa.endereco}
                        onChange={(e) => updateEmpresa("endereco", e.target.value)}
                        placeholder="Av. Paulista, 1000, São Paulo – SP, 01310-100"
                        style={INPUT}
                      />
                    </Field>
                  </Grid2>

                  {/* Mini preview do header */}
                  <div style={{ marginTop: 24, padding: 18, background: "#0a0a0a", borderRadius: 10, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 9, background: orc.empresa.logo_url ? "transparent" : "#88ce11", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#0a0a0a", flexShrink: 0, overflow: "hidden" }}>
                      {orc.empresa.logo_url
                        ? <img src={orc.empresa.logo_url} alt="logo" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 9 }} />
                        : (orc.empresa.logo_text || "?")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{orc.empresa.nome || "Nome da empresa"}</div>
                      <div style={{ fontSize: 11, color: "#71717a", marginTop: 2, lineHeight: 1.7 }}>
                        {orc.empresa.cnpj && <>{orc.empresa.cnpj} · </>}{orc.empresa.telefone || "Telefone"}<br />
                        {orc.empresa.email || "E-mail"}
                        {orc.empresa.instagram && <span style={{ color: "#88ce11" }}> · {orc.empresa.instagram.startsWith("@") ? orc.empresa.instagram : "@" + orc.empresa.instagram}</span>}
                      </div>
                    </div>
                  </div>
                </PhaseWrapper>
              )}

              {/* ── FASE 3: Dados do Cliente ───────────────────────────────── */}
              {phase === 3 && (
                <PhaseWrapper title="Dados do Cliente" icon="👤" desc="Informações do cliente ou empresa contratante.">
                  <Grid2>
                    <Field label="Nome / Razão Social" col={2}>
                      <input
                        value={orc.cliente.nome}
                        onChange={(e) => updateCliente("nome", e.target.value)}
                        placeholder="Ex: Tech Solutions Ltda. ou João da Silva"
                        style={INPUT}
                      />
                    </Field>
                    <Field label="CPF / CNPJ" hint="Detecta automaticamente">
                      <input
                        value={orc.cliente.cpf_cnpj}
                        onChange={(e) => updateCliente("cpf_cnpj", maskDocumento(e.target.value))}
                        placeholder="000.000.000-00 ou 00.000.000/0001-00"
                        maxLength={18}
                        style={INPUT}
                      />
                    </Field>
                    <Field label="Telefone / Contato" hint="+55 (DDD) 9 XXXX-XXXX">
                      <input
                        value={orc.cliente.contato}
                        onChange={(e) => updateCliente("contato", maskPhone(e.target.value))}
                        placeholder="+55 (11) 9 0000-0000"
                        maxLength={20}
                        style={INPUT}
                      />
                    </Field>
                    <Field label="E-mail" col={2}>
                      <input
                        value={orc.cliente.email}
                        onChange={(e) => updateCliente("email", e.target.value)}
                        placeholder="financeiro@empresa.com.br"
                        type="email"
                        style={INPUT}
                      />
                    </Field>
                    <Field label="@Instagram (opcional)" hint="Substitui CNPJ se não houver">
                      <input
                        value={orc.cliente.instagram || ""}
                        onChange={(e) => updateCliente("instagram", e.target.value)}
                        placeholder="@cliente"
                        style={INPUT}
                      />
                    </Field>
                    <Field label="Endereço Completo" col={2}>
                      <input
                        value={orc.cliente.endereco}
                        onChange={(e) => updateCliente("endereco", e.target.value)}
                        placeholder="Rua, número, cidade – UF, CEP"
                        style={INPUT}
                      />
                    </Field>
                  </Grid2>
                </PhaseWrapper>
              )}

              {/* ── FASE 4: Itens ─────────────────────────────────────────── */}
              {phase === 4 && (
                <PhaseWrapper title="Itens do Orçamento" icon="📦" desc="Adicione produtos ou serviços. Clique no campo de descrição para sugestões do catálogo.">

                  {/* Table header */}
                  {orc.itens.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 120px 120px 36px", gap: 8, padding: "0 4px 4px", marginBottom: 4 }}>
                      {["Descrição / Serviço","Qtd.","Preço Unit. (R$)","Total",""].map((h) => (
                        <div key={h} style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{h}</div>
                      ))}
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {orc.itens.map((item, idx) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        index={idx}
                        catalog={catalog}
                        onUpdate={(key, val) => updateItem(item.id, key, val)}
                        onFillCatalog={(cat) => fillFromCatalog(item.id, cat)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </div>

                  <button onClick={addItem} style={{ width: "100%", padding: "11px", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-green)", background: "var(--primary-dim)", color: "var(--primary)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    + Adicionar Item
                  </button>

                  {/* Desconto */}
                  {orc.itens.length > 0 && (
                    <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, color: "var(--text-2)", flex: 1 }}>Desconto geral (%)</span>
                      <input
                        type="number" min="0" max="100" step="1"
                        value={orc.desconto_percentual}
                        onChange={(e) => update("desconto_percentual", Number(e.target.value))}
                        style={{ ...INPUT, width: 80, textAlign: "center" }}
                      />
                      {orc.desconto_percentual > 0 && (
                        <span style={{ fontSize: 13, color: "var(--error)", fontWeight: 600 }}>
                          − {fmt(desconto)}
                        </span>
                      )}
                    </div>
                  )}
                </PhaseWrapper>
              )}

              {/* ── FASE 5: Termos ────────────────────────────────────────── */}
              {phase === 5 && (
                <PhaseWrapper title="Termos e Garantia" icon="📝" desc="Condições que aparecerão no rodapé do orçamento.">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field label="Termos e Condições de Pagamento / Entrega">
                      <textarea
                        value={orc.termos}
                        onChange={(e) => update("termos", e.target.value)}
                        rows={5}
                        placeholder={`Exemplos:\n— Prazo de entrega: 30 dias úteis após aprovação.\n— Pagamento: 50% de entrada + 50% na entrega.\n— Preços válidos pelo período indicado no orçamento.`}
                        style={{ ...INPUT, resize: "vertical", lineHeight: 1.6 }}
                      />
                    </Field>
                    <Field label="Garantia">
                      <textarea
                        value={orc.garantia}
                        onChange={(e) => update("garantia", e.target.value)}
                        rows={3}
                        placeholder="Ex: Garantia de 90 dias para bugs e ajustes. Inclui suporte por e-mail."
                        style={{ ...INPUT, resize: "vertical", lineHeight: 1.6 }}
                      />
                    </Field>
                  </div>
                </PhaseWrapper>
              )}

              {/* Navigation buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                <button
                  onClick={() => setPhase((p) => Math.max(1, p - 1))}
                  disabled={phase === 1}
                  style={{ padding: "9px 22px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: phase === 1 ? "var(--text-3)" : "var(--text)", fontSize: 13, fontWeight: 600, opacity: phase === 1 ? 0.4 : 1, cursor: phase === 1 ? "default" : "pointer" }}
                >
                  ← Fase anterior
                </button>
                <button
                  onClick={() => phase < 5 ? setPhase((p) => p + 1) : handleSave()}
                  style={{ padding: "9px 22px", borderRadius: "var(--radius-sm)", border: "none", background: phase === 5 ? "var(--primary)" : "var(--surface-3)", color: phase === 5 ? "#0a0a0a" : "var(--text)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  {phase === 5 ? "💾 Salvar Orçamento" : "Próxima fase →"}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: sticky sidebar ─────────────────────────────────────── */}
          <div style={{ width: 320, borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>Resumo ao vivo</div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflow: "auto", padding: "18px 18px 0" }}>

              {/* Phase indicator */}
              <div style={{ marginBottom: 16 }}>
                {PHASES.map((p) => (
                  <button key={p.id} onClick={() => setPhase(p.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "none", background: phase === p.id ? "var(--primary-dim)" : "transparent", marginBottom: 2, cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: phase === p.id ? "var(--primary)" : "var(--surface-3)", color: phase === p.id ? "#0a0a0a" : "var(--text-3)", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {p.id}
                    </div>
                    <span style={{ fontSize: 12, color: phase === p.id ? "var(--primary)" : "var(--text-3)", fontWeight: phase === p.id ? 700 : 400 }}>{p.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />

              {/* Totals */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Valores</div>
                <TotalRow label="Subtotal" value={fmt(subtotal)} />
                {desconto > 0 && <TotalRow label={`Desconto ${orc.desconto_percentual}%`} value={`− ${fmt(desconto)}`} red />}
                <div style={{ marginTop: 8, padding: "10px 14px", background: "#0a0a0a", borderRadius: 8, border: "2px solid var(--primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase" }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)" }}>{fmt(total)}</span>
                </div>
              </div>

              {/* Items list */}
              {orc.itens.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Itens ({orc.itens.length})</div>
                  {orc.itens.map((it, i) => (
                    <div key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}>
                        {i + 1}. {it.descricao || <em style={{ color: "var(--text-3)" }}>Sem descrição</em>}
                      </span>
                      <span style={{ color: "var(--text)", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{fmt(it.total)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cliente/Validade */}
              {(orc.cliente.nome || orc.datas.validade) && (
                <div style={{ fontSize: 12, marginBottom: 14 }}>
                  {orc.cliente.nome && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Cliente</div>
                      <div style={{ fontWeight: 600 }}>{orc.cliente.nome}</div>
                    </div>
                  )}
                  {orc.datas.validade && (
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Válido até</div>
                      <div style={{ fontWeight: 600 }}>{orc.datas.validade}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STICKY SAVE BUTTON — always visible */}
            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
              <button onClick={handleSave} style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#0a0a0a", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>
                {saved ? "✓ Salvo!" : "💾 Salvar Orçamento"}
              </button>
              {!isNew && (
                <a href={`/${orc.id}/preview`} style={{ display: "block", marginTop: 8, padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-green)", background: "var(--primary-dim)", color: "var(--primary)", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
                  🖨 Exportar PDF
                </a>
              )}
              {saved && isNew && <div style={{ fontSize: 11, color: "var(--success)", textAlign: "center", marginTop: 6 }}>Redirecionando...</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ItemRow with autocomplete ──────────────────────────────────────────────────

function ItemRow({ item, index, catalog, onUpdate, onFillCatalog, onRemove }: {
  item: OrcamentoItem;
  index: number;
  catalog: CatalogItem[];
  onUpdate: (key: keyof OrcamentoItem, val: string | number) => void;
  onFillCatalog: (cat: CatalogItem) => void;
  onRemove: () => void;
}) {
  const [showAC, setShowAC] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = catalog.filter((c) =>
    item.descricao.length >= 1 &&
    (c.nome.toLowerCase().includes(item.descricao.toLowerCase()) ||
     c.categoria.toLowerCase().includes(item.descricao.toLowerCase()))
  ).slice(0, 6);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowAC(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 120px 120px 36px", gap: 8, alignItems: "center" }}>
      {/* Description with autocomplete */}
      <div ref={ref} style={{ position: "relative" }}>
        <input
          value={item.descricao}
          onChange={(e) => { onUpdate("descricao", e.target.value); setShowAC(true); }}
          onFocus={() => setShowAC(true)}
          placeholder={`Item ${index + 1} — digite ou escolha do catálogo`}
          style={INPUT}
        />
        {showAC && suggestions.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--surface-3)", border: "1px solid var(--border-green)", borderRadius: "var(--radius-sm)", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", marginTop: 2 }}>
            {suggestions.map((cat) => (
              <button key={cat.id} onMouseDown={() => { onFillCatalog(cat); setShowAC(false); }}
                style={{ width: "100%", padding: "10px 14px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-dim)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{cat.nome}</div>
                  {cat.descricao && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{cat.descricao}</div>}
                  {cat.categoria && <div style={{ fontSize: 10, color: "var(--primary)", marginTop: 1 }}>{cat.categoria}</div>}
                </div>
                <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 13, flexShrink: 0, marginLeft: 12 }}>{fmt(cat.preco)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input type="number" min="0" value={item.quantidade} onChange={(e) => onUpdate("quantidade", Number(e.target.value))} style={{ ...INPUT, textAlign: "center" }} />
      <input type="number" min="0" step="0.01" value={item.preco_unitario} onChange={(e) => onUpdate("preco_unitario", Number(e.target.value))} placeholder="0,00" style={{ ...INPUT, textAlign: "right" }} />

      <div style={{ ...INPUT, display: "flex", alignItems: "center", justifyContent: "flex-end", fontWeight: 700, color: "var(--primary)", background: "var(--surface-3)", border: "1px solid transparent", pointerEvents: "none" }}>
        {fmt(item.total)}
      </div>

      <button onClick={onRemove} title="Remover" style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function PhaseWrapper({ title, icon, desc, children }: { title: string; icon: string; desc?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{title}</h2>
        </div>
        {desc && <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

function Field({ label, hint, children, col }: { label: string; hint?: string; children: React.ReactNode; col?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: col ? `span ${col}` : undefined }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
        {hint && <span style={{ fontSize: 10, color: "var(--text-3)", opacity: 0.7 }}>— {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function TotalRow({ label, value, red }: { label: string; value: string; red?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}>
      <span style={{ color: "var(--text-2)" }}>{label}</span>
      <span style={{ fontWeight: 600, color: red ? "var(--error)" : "var(--text)" }}>{value}</span>
    </div>
  );
}

const INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text)", fontSize: 13,
  outline: "none",
};
