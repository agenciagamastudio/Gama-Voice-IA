# GAMA Copa API — Integração de Seleção de Time

## Overview

A API GAMA Copa agora suporta seleção de time. O usuário pode selecionar um dos 16 times da Copa 2026 e ver:
- Próximos jogos do time
- Placar da partida em tempo real
- Progressão no chaveamento (grupos + fases knockout)
- Gerar post automaticamente para Instagram

## Endpoints

### 1. SELECT TEAM (POST)

**Endpoint:** `POST /api/select-team`

**Propósito:** Selecionar um time e retornar dados iniciais

**Corpo da Requisição:**
```json
{
  "teamCode": "BRA"
}
```

**Validação:**
- `teamCode` é obrigatório
- Deve ser um dos 16 times válidos (lista abaixo)
- Case-insensitive (BRA, bra, Bra funcionam)

**Resposta (200 OK):**
```json
{
  "selectedTeam": "BRA",
  "teamName": "Brasil",
  "timestamp": "2026-07-05T20:30:45.123Z",
  "message": "Time Brasil selecionado com sucesso",
  "upcomingMatches": [
    {
      "home": "BRA",
      "away": "NOR",
      "hs": 1,
      "as": 2,
      "status": "encerrado",
      "minute": null,
      "displayMinute": null,
      "venue": "Estádio Único",
      "ko": "2026-07-05T20:00:00Z"
    }
  ],
  "totalMatches": 4
}
```

**Resposta (400 Bad Request):**
```json
{
  "error": "Time \"XYZ\" inválido",
  "message": "Use um dos 16 times da Copa 2026",
  "validTeams": ["BRA", "NOR", "MEX", ...],
  "example": "BRA, NOR, MEX, ENG, ARG, EGI, SUI, COL, MAR, CAN, FRA, PAR, POR, ESP, USA, BEL"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/select-team \
  -H "Content-Type: application/json" \
  -d '{"teamCode":"BRA"}'
```

---

### 2. SCOREBOARD (GET)

**Endpoint:** `GET /api/scoreboard`

**Propósito:** Retornar todos os jogos (ou filtrar por time)

**Query Parameters:**
- `team` (opcional): Código do time (ex: `?team=BRA`)

**Resposta (sem filtro):**
```json
{
  "matches": [
    {
      "home": "BRA",
      "away": "NOR",
      "hs": 1,
      "as": 2,
      "status": "encerrado",
      "minute": null,
      "displayMinute": null,
      "displayTimeWithSeconds": null,
      "timeElapsed": null,
      "events": [],
      "venue": "Estádio Único",
      "ko": "2026-07-05T20:00:00Z",
      "currentTime": "2026-07-05T20:45:30.456Z"
    }
  ],
  "cached": true,
  "selectedTeam": null,
  "teamName": null,
  "totalMatches": 12,
  "timestamp": 1688594730456
}
```

**Resposta (com filtro ?team=BRA):**
```json
{
  "matches": [
    {
      "home": "BRA",
      "away": "NOR",
      "hs": 1,
      "as": 2,
      ...
    }
  ],
  "cached": true,
  "selectedTeam": "BRA",
  "teamName": "Brasil",
  "totalMatches": 4,
  "timestamp": 1688594730456
}
```

**Exemplo cURL:**
```bash
# Todos os jogos
curl http://localhost:3000/api/scoreboard

# Apenas jogos do Brasil
curl http://localhost:3000/api/scoreboard?team=BRA

# Apenas jogos da Argentina
curl http://localhost:3000/api/scoreboard?team=ARG
```

**Caching:**
- Respostas são cacheadas por 30 segundos
- Campo `cached: true` indica que dados foram do cache
- Campo `stale: true` indica que ESPN está indisponível

---

### 3. BRACKET (GET)

**Endpoint:** `GET /api/bracket`

**Propósito:** Retornar estrutura do torneio com opção de highlight

**Query Parameters:**
- `team` (opcional): Código do time para highlight (ex: `?team=BRA`)

**Resposta (sem filtro):**
```json
{
  "tournament": {
    "groups": [
      {
        "id": "A",
        "name": "Grupo A",
        "teams": ["BRA", "NOR", "MEX", "CAN"],
        "matches": [...],
        "classified": ["NOR", "MEX"]
      }
    ],
    "knockout": {
      "round16": [...],
      "quarterfinals": [...],
      "semifinals": [...],
      "final": [...]
    }
  },
  "selectedTeam": null,
  "teamName": null,
  "timestamp": 1688594730456
}
```

**Resposta (com filtro ?team=BRA):**
```json
{
  "tournament": {
    "groups": [
      {
        "id": "A",
        "name": "Grupo A",
        "teams": [
          {"code": "BRA", "name": "Brasil", "isSelected": true},
          {"code": "NOR", "name": "Noruega", "isSelected": false},
          ...
        ]
      }
    ],
    "knockout": {
      "round16": [
        {
          "id": "r16-1",
          "home": "NOR",
          "away": "MEX",
          "hs": null,
          "as": null,
          "homeIsSelected": false,
          "awayIsSelected": false
        }
      ]
    }
  },
  "selectedTeam": "BRA",
  "teamName": "Brasil",
  "timestamp": 1688594730456
}
```

**Exemplo cURL:**
```bash
# Estrutura completa do torneio
curl http://localhost:3000/api/bracket

# Com Brasil destacado
curl http://localhost:3000/api/bracket?team=BRA

# Com Argentina destacada
curl http://localhost:3000/api/bracket?team=ARG
```

**Flags de Highlight:**
- Nos grupos: `teams` agora contém objeto com `isSelected: true/false`
- Nas fases knockout: `homeIsSelected` e `awayIsSelected` indicam se time está na partida

---

### 4. INSTAGRAM POST (POST)

**Endpoint:** `POST /api/generate-instagram-post`

**Propósito:** Gerar post automático para Instagram (sem relação com seleção, já existente)

**Corpo da Requisição:**
```json
{
  "homeTeam": "BRA",
  "awayTeam": "NOR",
  "homeScore": 1,
  "awayScore": 2,
  "minute": 45,
  "addedTime": "45+3"
}
```

**Resposta:**
```json
{
  "svg": "<svg>...</svg>",
  "text": "Brasil 1 x 2 Noruega",
  "hashtags": "#GamaCopa #Copa2026 #Brasil"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/generate-instagram-post \
  -H "Content-Type: application/json" \
  -d '{
    "homeTeam": "BRA",
    "awayTeam": "NOR",
    "homeScore": 1,
    "awayScore": 2,
    "minute": 45,
    "addedTime": "45+3"
  }'
```

---

## Times Válidos (16 da Copa 2026)

| Código | País | Código | País |
|--------|------|--------|------|
| `BRA` | Brasil | `POR` | Portugal |
| `NOR` | Noruega | `ESP` | Espanha |
| `MEX` | México | `USA` | Estados Unidos |
| `ENG` | Inglaterra | `BEL` | Bélgica |
| `ARG` | Argentina | `FRA` | França |
| `EGI` | Egito | `PAR` | Paraguai |
| `SUI` | Suíça | `COL` | Colômbia |
| `CAN` | Canadá | `MAR` | Marrocos |

---

## Autenticação

❌ **Sem autenticação.** Todos os endpoints são públicos.

---

## Rate Limiting

❌ **Sem rate limiting.** Sistema de cache (30s) evita abuso.

---

## Error Handling

### Erro 400 — Bad Request
```json
{
  "error": "Campo \"teamCode\" é obrigatório",
  "validTeams": ["BRA", "NOR", ...]
}
```

### Erro 400 — Time Inválido
```json
{
  "error": "Time \"XYZ\" inválido",
  "message": "Use um dos 16 times da Copa 2026",
  "validTeams": ["BRA", "NOR", ...],
  "example": "BRA, NOR, MEX, ..."
}
```

### Erro 500 — Server Error
```json
{
  "error": "Erro ao selecionar time",
  "message": "Mensagem de erro específica"
}
```

---

## WebSocket (Real-time)

O servidor também oferece atualizações em tempo real via Socket.IO:

```javascript
const socket = io('http://localhost:3000');

// Conectar
socket.on('connection:status', (data) => {
  console.log('Clientes conectados:', data.clients);
});

// Receber atualizações de scores
socket.on('score:update', (data) => {
  console.log('Scores atualizados:', data.matches);
});

// Receber dados iniciais
socket.on('score:initial', (data) => {
  console.log('Dados iniciais:', data.matches);
});
```

---

## Fluxo Recomendado (Frontend)

```javascript
// 1. Usuário seleciona time
const selectTeam = async (teamCode) => {
  const response = await fetch('/api/select-team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamCode })
  });
  const data = await response.json();
  console.log('Time selecionado:', data.teamName);
  return data;
};

// 2. Buscar próximos jogos do time
const getTeamMatches = async (teamCode) => {
  const response = await fetch(`/api/scoreboard?team=${teamCode}`);
  const data = await response.json();
  console.log('Próximos jogos:', data.matches);
  return data;
};

// 3. Buscar chaveamento com time destacado
const getBracket = async (teamCode) => {
  const response = await fetch(`/api/bracket?team=${teamCode}`);
  const data = await response.json();
  console.log('Chaveamento com destaque:', data.tournament);
  return data;
};

// 4. Gerar post Instagram quando time marca
const generatePost = async (match) => {
  const response = await fetch('/api/generate-instagram-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      homeTeam: match.home,
      awayTeam: match.away,
      homeScore: match.hs,
      awayScore: match.as,
      minute: match.minute,
      addedTime: match.addedTime?.display
    })
  });
  const post = await response.json();
  console.log('Post gerado:', post.text);
  return post;
};
```

---

## Status: ✅ PRODUCTION READY

- ✅ Endpoints funcionais
- ✅ Validação de times
- ✅ Filtro por time no scoreboard
- ✅ Highlight de time no bracket
- ✅ Error handling completo
- ✅ Documentação com curl examples
