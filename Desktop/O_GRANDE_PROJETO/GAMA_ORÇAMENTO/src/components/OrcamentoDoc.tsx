"use client";

import type { Orcamento } from "@/types/orcamento";
import { fmt } from "@/lib/utils";

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  Aprovado:  { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
  Pendente:  { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" },
  Rejeitado: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
  Rascunho:  { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" },
};

// Visibility-based approach: the only reliable cross-browser method when
// the print root is nested deep inside the page (not a direct body child).
const PRINT_CSS = `
@media print {
  body * { visibility: hidden; }
  #orcamento-print-root,
  #orcamento-print-root * { visibility: visible; }
  #orcamento-print-root {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    max-width: none;
    margin: 0;
    border-radius: 0 !important;
    box-shadow: none !important;
    overflow: visible !important;
  }
  @page { size: A4 portrait; margin: 15mm 18mm; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
  .no-print { display: none !important; }
  #orcamento-print-root { height: fit-content; page-break-after: avoid; }
}
`;

function ig(handle?: string) {
  if (!handle) return null;
  return handle.startsWith("@") ? handle : "@" + handle;
}

export default function OrcamentoDoc({ orc }: { orc: Orcamento }) {
  const subtotal = orc.itens.reduce((s, i) => s + i.total, 0);
  const desconto = orc.desconto_percentual > 0 ? subtotal * (orc.desconto_percentual / 100) : 0;
  const total = subtotal - desconto;

  const s = STATUS_STYLE[orc.status] ?? STATUS_STYLE.Rascunho;
  const empresaIG = ig(orc.empresa.instagram);
  const clienteIG = ig(orc.cliente.instagram);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div
        id="orcamento-print-root"
        style={{
          fontFamily: "'Segoe UI', -apple-system, sans-serif",
          fontSize: 13,
          color: "#111",
          background: "#fff",
          maxWidth: 794,
          margin: "0 auto",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0a0a0a,#1a1a1a)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {/* Logo: PNG se tiver, senão sigla */}
            {orc.empresa.logo_url
              ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={orc.empresa.logo_url} alt="logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
              )
              : (
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#88ce11", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#0a0a0a", flexShrink: 0 }}>
                  {orc.empresa.logo_text || orc.empresa.nome[0]}
                </div>
              )
            }
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{orc.empresa.nome}</div>
              <div style={{ fontSize: 9, color: "#a1a1aa", marginTop: 2, lineHeight: 1.6 }}>
                {orc.empresa.cnpj && <>CNPJ: {orc.empresa.cnpj}<br /></>}
                {orc.empresa.endereco}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#71717a", textTransform: "uppercase", letterSpacing: 0.8 }}>Orçamento</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>#{orc.numero}</div>
            <div style={{ display: "inline-block", marginTop: 8, padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, ...s }}>{orc.status}</div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#a1a1aa", lineHeight: 1.8 }}>
              {orc.empresa.telefone && <>{orc.empresa.telefone}<br /></>}
              {orc.empresa.email && <>{orc.empresa.email}<br /></>}
              {empresaIG && <span style={{ color: "#88ce11" }}>{empresaIG}</span>}
            </div>
          </div>
        </div>

        {/* Dates bar */}
        <div style={{ background: "#f8f8f8", borderBottom: "1px solid #e5e7eb", padding: "8px 24px", display: "flex", gap: 36 }}>
          <span style={{ fontSize: 11 }}><span style={{ color: "#9ca3af", marginRight: 6, textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>Emissão:</span><strong>{orc.datas.emissao}</strong></span>
          <span style={{ fontSize: 11 }}><span style={{ color: "#9ca3af", marginRight: 6, textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>Válido até:</span><strong>{orc.datas.validade}</strong></span>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px" }}>
          {/* Cliente */}
          <SectionLabel>Dados do Cliente</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
            <Field label="Nome / Razão Social" value={orc.cliente.nome} />
            {orc.cliente.cpf_cnpj
              ? <Field label="CPF / CNPJ" value={orc.cliente.cpf_cnpj} />
              : clienteIG
                ? <Field label="Instagram" value={clienteIG} />
                : <Field label="CPF / CNPJ" value="—" />
            }
            <Field label="Contato" value={orc.cliente.contato} />
            {orc.cliente.cpf_cnpj && clienteIG && <Field label="Instagram" value={clienteIG} />}
            {orc.cliente.email && <Field label="E-mail" value={orc.cliente.email} />}
            {orc.cliente.endereco && (
              <Field
                label="Endereço"
                value={orc.cliente.endereco}
                span={
                  orc.cliente.cpf_cnpj && clienteIG && orc.cliente.email ? 2
                  : orc.cliente.email ? 2
                  : 3
                }
              />
            )}
          </div>

          {/* Itens */}
          <SectionLabel>Itens do Orçamento</SectionLabel>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
            <thead>
              <tr>
                {["#","Descrição","Qtd.","Preço Unit.","Total"].map((h, i) => (
                  <th key={h} style={{ padding: "7px 10px", background: "#111", color: "#fff", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.6, textAlign: i >= 2 ? "right" : i === 0 ? "center" : "left", borderBottom: "2px solid #88ce11", whiteSpace: "nowrap", ...(i===0?{width:32}:{}), ...(i===1?{width:"50%"}:{}) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orc.itens.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 10px", textAlign: "center", color: "#9ca3af", fontSize: 11 }}>{i + 1}</td>
                  <td style={{ padding: "8px 10px" }}>{item.descricao}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "#374151" }}>{item.quantidade}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "#374151" }}>{fmt(item.preco_unitario)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600 }}>{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totais */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <div style={{ minWidth: 270 }}>
              <TotalRow label="Subtotal" value={fmt(subtotal)} />
              {desconto > 0 && <TotalRow label={`Desconto (${orc.desconto_percentual}%)`} value={`− ${fmt(desconto)}`} red />}
              <div style={{ marginTop: 8, padding: "11px 16px", background: "#0a0a0a", borderRadius: 10, border: "2px solid #88ce11", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#a1a1aa", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Total</span>
                <span style={{ color: "#88ce11", fontSize: 20, fontWeight: 900 }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Termos */}
          {(orc.termos || orc.garantia) && (
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {orc.termos && <InfoBox title="Termos e Condições" text={orc.termos} />}
              {orc.garantia && <InfoBox title="Garantia" text={orc.garantia} />}
            </div>
          )}

          {/* Assinaturas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 0 }}>
            <Signature label={orc.empresa.nome} role="Fornecedor" />
            <Signature label={orc.cliente.nome || "Cliente"} role="Cliente" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#f3f4f6", borderTop: "1px solid #e5e7eb", padding: "8px 20px", display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#9ca3af" }}>
          <span>{orc.empresa.nome}{empresaIG ? ` · ${empresaIG}` : orc.empresa.cnpj ? ` · ${orc.empresa.cnpj}` : ""}</span>
          <span>Orçamento #{orc.numero} · Emitido em {orc.datas.emissao}</span>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, fontWeight: 700, color: "#88ce11", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
      <div style={{ width: 3, height: 10, background: "#88ce11", borderRadius: 2 }} />
      {children}
    </div>
  );
}

function Field({ label, value, span }: { label: string; value: string; span?: number }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 12 }}>{value || "—"}</div>
    </div>
  );
}

function TotalRow({ label, value, red }: { label: string; value: string; red?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px", fontSize: 12, color: "#6b7280" }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, color: red ? "#e11d48" : undefined }}>{value}</span>
    </div>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{title}</div>
      <p style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5, margin: 0 }}>{text}</p>
    </div>
  );
}

function Signature({ label, role }: { label: string; role: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ height: 32, borderBottom: "1.5px solid #d1d5db", marginBottom: 3 }} />
      <div style={{ fontWeight: 600, fontSize: 11, color: "#374151" }}>{label}</div>
      <div style={{ fontSize: 9, color: "#9ca3af" }}>{role}</div>
    </div>
  );
}
