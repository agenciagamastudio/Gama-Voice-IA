# GAMA Copa Center 2026

Plataforma de acompanhamento em tempo real da Copa do Mundo FIFA 2026. Dados reais da ESPN, UI moderna com indicador de sincronização, chaveamento interativo.

## Início Rápido

```bash
npm install
npm start
```

Abre automaticamente em `http://localhost:3000`.

## Arquitetura

- **Backend**: Node.js + Express (`server/index.js`)
  - `GET /api/scoreboard` — busca ESPN, normaliza dados, retorna JSON
  - Cache 30s em memória
  - Serve arquivos estáticos (`public/`)

- **Frontend**: HTML + CSS + Vanilla JS (`public/index.html`)
  - Hero match: Brasil × Noruega (destaque)
  - Grid de oitavas (hoje + todas)
  - Chaveamento SVG interativo
  - Polling automático 2min + botão manual

- **Mapeamento**: ESPN → códigos GAMA (`server/teamMap.js`)
  - Aliases múltiplas (nome completo, abreviação, variações)
  - 32 seleções catalogadas

## Dados

Fonte: `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`
- Público (sem API key)
- Atualizado em tempo real
- Inclui placares, minuto, venue, status

## Status do Indicador

| Cor | Significado |
|-----|------------|
| 🟢 Pulsando | Sincronizado agora |
| 🔴 Fixo | Usando último dado conhecido (ESPN indisponível) |
| ⚫ Parado | Iniciando… |

## Próximos Passos

- WebSocket para atualizações ultra-realtime
- Estatísticas player (passes, gols, cartões)
- Previsões IA
- Dark/Light theme toggle
- PWA (offline-first)
- Notificações push

## Desenvolvimento

```bash
npm run dev   # Watch mode
npm test      # (ainda não tem testes)
```

## Créditos

Design: GAMA Studio | Dados: ESPN | Transmissão: CazéTV
