"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="container py-8">
        <p className="text-center">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/orcamentos">
          <Button variant="ghost">← Voltar</Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Salvar como Template</h1>
      </div>

      {mostrarNudge && similares > 0 && (
        <Card className="mb-8 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-base">💡 Sugestão Inteligente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-100">
              Você já criou {similares} orçamento(s) com essa mesma estrutura de itens.
              Recomendo esperar até ter pelo menos 5 orçamentos similares antes de salvar como template.
              Isso garante um padrão mais consolidado.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Template</CardTitle>
          <CardDescription>Dê um nome e descrição para este padrão de orçamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Template</label>
            <input
              type="text"
              placeholder="Ex: Pacote Social Media Básico"
              value={nomTemplate}
              onChange={(e) => setNomTemplate(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
            <textarea
              placeholder="Descreva quando este template é usado..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 h-24"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
            <p className="text-sm font-medium mb-2">Itens que serão salvos:</p>
            <ul className="space-y-1 text-sm">
              {orcamento.itens.map((item: any, idx: number) => (
                <li key={idx}>
                  • {item.nome} (qtd: {item.quantidade})
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSalvarTemplate} disabled={!nomTemplate.trim()}>
              Salvar Template
            </Button>
            <Link href="/orcamentos" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
