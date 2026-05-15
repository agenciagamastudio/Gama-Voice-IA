const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const fmt = (v: number) => currencyFormatter.format(v);

export const fmtObj = {
  currency: (v: number) => currencyFormatter.format(v),
  number: (v: number) => new Intl.NumberFormat("pt-BR").format(v),
  percent: (v: number) => `${v.toFixed(2)}%`,
};

export const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

export const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

export const genId = () => Math.random().toString(36).slice(2,10);

export const genNumero = (count: number) =>
  `${new Date().getFullYear()}-${String(count + 1).padStart(4,"0")}`;

// ── Máscaras ─────────────────────────────────────────────────────────────────

export const maskPhone = (v: string): string => {
  const n = v.replace(/\D/g,"").slice(0,13);
  if (!n) return "";
  if (n.length <= 2)  return `+${n}`;
  if (n.length <= 4)  return `+${n.slice(0,2)} (${n.slice(2)}`;
  if (n.length <= 5)  return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4)}`;
  if (n.length <= 9)  return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4,5)} ${n.slice(5)}`;
  return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4,5)} ${n.slice(5,9)}-${n.slice(9)}`;
};

export const maskCNPJ = (v: string): string => {
  const n = v.replace(/\D/g,"").slice(0,14);
  if (n.length <= 2)  return n;
  if (n.length <= 5)  return `${n.slice(0,2)}.${n.slice(2)}`;
  if (n.length <= 8)  return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5)}`;
  if (n.length <= 12) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8)}`;
  return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12)}`;
};

export const maskCPF = (v: string): string => {
  const n = v.replace(/\D/g,"").slice(0,11);
  if (n.length <= 3)  return n;
  if (n.length <= 6)  return `${n.slice(0,3)}.${n.slice(3)}`;
  if (n.length <= 9)  return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`;
  return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}`;
};

// Detecta automaticamente CPF (≤11 dígitos) ou CNPJ
export const maskDocumento = (v: string): string => {
  const n = v.replace(/\D/g,"");
  return n.length <= 11 ? maskCPF(v) : maskCNPJ(v);
};
