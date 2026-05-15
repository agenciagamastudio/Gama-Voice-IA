import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAMA Orçamento",
  description: "Studio de criação e gestão de orçamentos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
