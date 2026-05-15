"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      id: "rate-card",
      title: "Rate Card",
      description: "Visualize a tabela de preços calculada automaticamente",
      icon: "📊",
      href: "/configuracoes/rate-card",
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure os parâmetros de precificação do seu negócio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configItems.map((item) => (
          <Link key={item.id} href={item.href}>
            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">{item.icon}</div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">💡 Dica</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Os valores de Rate Card são calculados automaticamente a partir dos dados de profissionais,
          overhead e margem-alvo. Qualquer alteração aqui será refletida imediatamente nos orçamentos.
        </p>
      </div>
    </div>
  );
}
