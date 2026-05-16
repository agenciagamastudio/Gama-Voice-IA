"use client";

import type { Orcamento } from "@/types/orcamento";
import { fmtObj } from "@/lib/utils";
import styles from "./BudgetTemplate.module.css";

interface BudgetTemplateProps {
  orcamento: Orcamento;
  onPrint?: () => void;
}

export default function BudgetTemplate({ orcamento, onPrint }: BudgetTemplateProps) {
  const total = orcamento.precoPraticado;

  const statusColor: Record<string, string> = {
    Aprovado: "#10b981",
    Pendente: "#f59e0b",
    Rejeitado: "#ef4444",
    Rascunho: "#6b7280",
  };

  return (
    <div className={styles.container}>
      {/* Header com botões de ação (não aparece no print) */}
      <div className={styles.noprint}>
        <button onClick={() => window.print()} className={styles.printBtn}>
          Exportar para PDF
        </button>
        <button onClick={() => window.close()} className={styles.closeBtn}>
          Fechar
        </button>
      </div>

      {/* Documento Principal */}
      <div id="budget-export-root" className={styles.document}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.company}>
            <h1 className={styles.companyName}>{orcamento.empresa.nome}</h1>
            <p className={styles.companyInfo}>{orcamento.empresa.cnpj}</p>
            <p className={styles.companyInfo}>{orcamento.empresa.telefone}</p>
            <p className={styles.companyInfo}>{orcamento.empresa.email}</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.docNumber}>
              <p className={styles.label}>ORÇAMENTO</p>
              <p className={styles.number}>{orcamento.numero}</p>
            </div>
            <div
              className={styles.status}
              style={{ backgroundColor: statusColor[orcamento.status] }}
            >
              {orcamento.status}
            </div>
          </div>
        </header>

        <hr className={styles.divider} />

        {/* Cliente */}
        <section className={styles.clientSection}>
          <div className={styles.sectionTitle}>CLIENTE</div>
          <div className={styles.clientGrid}>
            <div>
              <p className={styles.label}>Nome</p>
              <p className={styles.value}>{orcamento.cliente.nome}</p>
            </div>
            <div>
              <p className={styles.label}>CPF/CNPJ</p>
              <p className={styles.value}>{orcamento.cliente.cpf_cnpj}</p>
            </div>
            <div>
              <p className={styles.label}>Contato</p>
              <p className={styles.value}>{orcamento.cliente.contato}</p>
            </div>
            <div>
              <p className={styles.label}>Email</p>
              <p className={styles.value}>{orcamento.cliente.email}</p>
            </div>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Tabela de Itens */}
        <section className={styles.itemsSection}>
          <div className={styles.sectionTitle}>ITENS DO ORÇAMENTO</div>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th className={styles.colItem}>ITEM</th>
                <th className={styles.colQty}>QTD</th>
                <th className={styles.colTotal}>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {orcamento.itens.map((item) => (
                <tr key={item.id}>
                  <td className={styles.colItem}>{item.nome}</td>
                  <td className={styles.colQty}>{item.quantidade}</td>
                  <td className={styles.colTotal}>{fmtObj.currency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr className={styles.divider} />

        {/* Totais */}
        <section className={styles.totalsSection}>
          <div className={styles.totalRow}>
            <span>PREÇO FLOOR (MÍNIMO)</span>
            <span className={styles.secondary}>{fmtObj.currency(orcamento.precoFloor)}</span>
          </div>

          <div className={styles.totalRow + " " + styles.grand}>
            <span>VALOR TOTAL A COBRAR</span>
            <span>{fmtObj.currency(orcamento.precoPraticado)}</span>
          </div>

          <div className={styles.totalRow}>
            <span>MARGEM SOBRE PISO</span>
            <span className={styles.secondary}>
              {((orcamento.precoPraticado - orcamento.precoFloor) / orcamento.precoFloor * 100).toFixed(1)}%
            </span>
          </div>
        </section>

        <hr className={styles.divider} />

        {/* Datas e Termos */}
        <section className={styles.footerSection}>
          <div className={styles.datesGrid}>
            <div>
              <p className={styles.label}>DATA DE EMISSÃO</p>
              <p className={styles.value}>{orcamento.datas.emissao}</p>
            </div>
            <div>
              <p className={styles.label}>VALIDADE</p>
              <p className={styles.value}>{orcamento.datas.validade}</p>
            </div>
          </div>

          {orcamento.garantia && (
            <div className={styles.termsBox}>
              <p className={styles.label}>GARANTIA E CONDIÇÕES</p>
              <p className={styles.terms}>{orcamento.garantia}</p>
            </div>
          )}

          {orcamento.termos && (
            <div className={styles.termsBox}>
              <p className={styles.label}>TERMOS E CONDIÇÕES</p>
              <p className={styles.terms}>{orcamento.termos}</p>
            </div>
          )}
        </section>

        {/* Assinatura */}
        <section className={styles.signatureSection}>
          <div className={styles.signatureLine}>
            ___________________________________________________________
          </div>
          <p className={styles.signatureLabel}>Assinatura</p>
        </section>
      </div>
    </div>
  );
}
