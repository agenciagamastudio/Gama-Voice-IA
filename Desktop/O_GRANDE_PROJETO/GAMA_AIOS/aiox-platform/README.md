# AIOX Mission Control — Plataforma

Evolução do `aiox-guia-interativo.html` para uma plataforma web com IA embutida, alimentada pela documentação do ecossistema SynkraAI/AIOX (aiox-core, aiox-squads, aiox-dashboard).

## Rodar

```bash
npm install
cp .env.example .env    # preencha ANTHROPIC_API_KEY ou GROQ_API_KEY
npm run ingest          # indexa .aiox-core + ~/squads (local-first)
npm run dev             # web em http://localhost:5180 · API em :8787
```

Sem chave de API, a plataforma funciona em modo guia (tudo menos chat/roteador IA).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | server (tsx watch :8787) + web (vite :5180) |
| `npm run ingest` | gera `data/index.json` a partir de `~/.aiox-core` e `~/squads` |
| `npm run ingest:remote` | idem + docs do GitHub SynkraAI |
| `npm run build` && `npm start` | build de produção servido pelo Express |

## IA embutida

- **Assistente (aba 09)** — chat RAG sobre a documentação indexada, com fontes.
- **Roteador inteligente (aba 01)** — missão em linguagem natural → workflow + trilha + comandos reais (validados contra o catálogo).
- **Gerador de prompt** — botão "⚡ gerar prompt pronto" cria o texto pra colar no Claude Code.

Provider configurável via `.env` (`AI_PROVIDER=anthropic|groq`).

## Estrutura

- `web/` — Vite + React 19 + TS, design GAMA V3 portado 1:1 (`base.css` = tokens do guia original)
- `server/` — Express: `/api/content`, `/api/search`, `/api/chat` (SSE), `/api/route`, `/api/generate-command`
- `data/seed.json` — dados curados extraídos do guia (fallback offline); `data/index.json` — gerado pela ingestão
