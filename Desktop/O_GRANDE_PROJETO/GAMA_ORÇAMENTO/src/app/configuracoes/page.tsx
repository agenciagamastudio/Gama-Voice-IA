"use client";

import Link from "next/link";

export default function ConfiguracoesPage() {
  const configItems = [
    {
      id: "profissionais",
      title: "Profissionais",
      description: "Gerencie profissionais, hora-custo e capacidade",
      icon: "👤",
      href: "/configuracoes/profissionais",
    },
    {
      id: "overhead",
      title: "Custos Fixos (Overhead)",
      description: "Configure custos mensais de infraestrutura e software",
      icon: "💰",
      href: "/configuracoes/overhead",
    },
    {
      id: "entregaveis",
      title: "Catálogo de Entregáveis",
      description: "Configure tipos de serviço com tempo padrão e preço floor",
      icon: "📦",
      href: "/configuracoes/entregaveis",
    },
    {
      id: "rate-card",
      title: "Rate Card",
      description: "Visualize a tabela de preços calculada automaticamente",
      icon: "📊",
      href: "/configuracoes/rate-card",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[bg-bg] via-[bg-surface] to-[bg-surface-2] relative overflow-hidden">
      {/* Volumetric background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(136,206,17,0.15)] to-transparent rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-[rgba(136,206,17,0.1)] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-gama-border backdrop-blur-md bg-gama-surface/40">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gama-primary to-[primary-light] bg-clip-text text-transparent">
              ⚙️ Configurações
            </h1>
            <p className="text-gama-text-secondary mt-2">
              Configure os parâmetros de precificação do seu negócio
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Config Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {configItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <div className="glass glass-card p-8 border border-gama-border rounded-lg hover:border-gama-primary/50 hover:bg-gama-primary/5 transition-all active:scale-95 cursor-pointer h-full group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl">{item.icon}</span>
                    <span className="px-3 py-1 rounded text-xs font-semibold bg-[rgba(136,206,17,0.1)] text-gama-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Acessar
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gama-text-secondary text-sm leading-relaxed">{item.description}</p>
                  <div className="mt-6 pt-4 border-t border-gama-border">
                    <div className="text-gama-primary text-sm font-medium flex items-center gap-2">
                      →
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Acessar
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Info/Tip Section */}
          <div className="glass glass-card p-8 border border-gama-primary/30 bg-gama-primary/5 rounded-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">💡</span>
              <div>
                <h2 className="text-lg font-bold text-gama-primary mb-2">Dica Importante</h2>
                <p className="text-gama-text-secondary text-sm leading-relaxed">
                  Os valores de Rate Card são calculados automaticamente a partir dos dados de profissionais,
                  overhead e margem-alvo. Qualquer alteração aqui será refletida imediatamente nos orçamentos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
