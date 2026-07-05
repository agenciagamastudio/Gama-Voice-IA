import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { getGameCode } from './teamMap.js';
import { generateInstagramPost } from './instagram-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

const PORT = 3000;

// Configure JSON parser IMMEDIATELY (must be before endpoints)
app.use(express.json());

// Cache em memória (30s)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 30000;

// Track WebSocket connections
let connectedClients = 0;

// Mock game start time (fixo para toda a sessão - evita recálculos)
// Simula jogo que começou 45 minutos atrás
const MOCK_GAME_START = Date.now() - (45 * 60 * 1000);

// Código de 3 letras → nome interno
const GAMANAMES = {
  BRA: 'Brasil',
  NOR: 'Noruega',
  MEX: 'México',
  ENG: 'Inglaterra',
  ARG: 'Argentina',
  EGI: 'Egito',
  SUI: 'Suíça',
  COL: 'Colômbia',
  MAR: 'Marrocos',
  CAN: 'Canadá',
  FRA: 'França',
  PAR: 'Paraguai',
  POR: 'Portugal',
  ESP: 'Espanha',
  USA: 'Estados Unidos',
  BEL: 'Bélgica'
};

// Lista válida de times (16 da Copa 2026)
const VALID_TEAMS = Object.keys(GAMANAMES);

// Sessão de usuário em memória (teamCode selecionado)
// Em produção, usar sessões com cookie/JWT
let currentSelectedTeam = null;

// Mapear status ESPN para status GAMA
function getStatus(comp) {
  if (!comp.status) return 'agendado';

  const statusType = comp.status.type?.name || '';
  const statusState = comp.status.type?.state || '';
  const completed = comp.status.type?.completed || false;

  // ESPN uses status.type.state: 'in' for live matches
  if (statusState === 'in') return 'ao_vivo';

  // Fallback: check status name patterns (if ESPN format changes)
  if (statusType.includes('LIVE') || statusType.includes('FIRST_HALF') || statusType.includes('SECOND_HALF') || statusType.includes('HALFTIME')) {
    if (statusState !== 'post') return 'ao_vivo';
  }

  // Check for completed/final status
  if (completed || statusType.includes('FINAL') || statusType.includes('COMPLETED') || statusState === 'post') {
    return 'encerrado';
  }

  // Check for scheduled/pre status
  if (statusType.includes('SCHEDULED') || statusType.includes('PRE') || statusState === 'pre') {
    return 'agendado';
  }

  return 'agendado';
}

// Extrair minuto e acréscimo do match
function getMinute(comp) {
  // Check if match is in progress (ESPN uses state: 'in' for live)
  if (comp.status?.type?.state === 'in' || comp.status?.type?.name?.includes('HALF')) {
    const timeStr = comp.status.displayClock?.match(/(\d+)\'/);
    return timeStr ? parseInt(timeStr[1]) : null;
  }
  return null;
}

// Extrair acréscimo (added time) do match
function getAddedTime(comp) {
  // Display clock format: "45'+3'" means minute 45 with 3 minutes added
  const displayClock = comp.status?.displayClock || '';
  const match = displayClock.match(/(\d+)'\+(\d+)'/);
  if (match) {
    return {
      minute: parseInt(match[1]),
      added: parseInt(match[2]),
      display: `${match[1]}+${match[2]}'`
    };
  }
  return null;
}

// Calcular tempo decorrido em segundos (com mock para Copa 2026 futura)
function getTimeElapsed(comp, kickoffTime) {
  try {
    const koTime = new Date(kickoffTime).getTime();
    const now = Date.now();
    const elapsedMs = now - koTime;

    // Se jogo ainda não começou (futuro), usar MOCK_GAME_START fixo
    // Isso garante que o contador seja consistente e incremente 1s por segundo real
    let totalSeconds;

    if (elapsedMs < 0) {
      // Jogo futuro: usar MOCK_GAME_START fixo (definido na inicialização do servidor)
      totalSeconds = Math.floor((now - MOCK_GAME_START) / 1000);
    } else {
      // Jogo já começou: usar tempo real
      totalSeconds = Math.floor(elapsedMs / 1000);
    }

    const minute = Math.floor(totalSeconds / 60);
    const second = totalSeconds % 60;

    return {
      minute,
      second,
      total_seconds: totalSeconds,
      display: `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
    };
  } catch (error) {
    return null;
  }
}

// Gerar eventos mock para jogos ao vivo (ESPN não tem play-by-play em Copa 2026)
function generateMockEvents(homeTeam, awayTeam, minute) {
  if (!minute || minute < 5) return [];

  // Base de eventos realistas
  const allEvents = [
    { minute: 8, type: 'goal', team: 'home', player: 'Neymar', description: 'GOOOOL do Brasil!' },
    { minute: 12, type: 'yellow_card', team: 'away', player: 'Haaland', description: 'Cartão amarelo' },
    { minute: 22, type: 'goal', team: 'away', player: 'Ødegaard', description: 'GOOOOL da Noruega!' },
    { minute: 28, type: 'substitution', team: 'home', player: 'Vinícius → Rodrygo', description: 'Substituição' },
    { minute: 35, type: 'yellow_card', team: 'home', player: 'Rodrygo', description: 'Cartão amarelo' },
    { minute: 38, type: 'foul', team: 'away', player: 'Sørloth', description: 'Falta cometida' },
    { minute: 42, type: 'yellow_card', team: 'away', player: 'Ajer', description: 'Cartão amarelo' },
    { minute: 45, type: 'foul', team: 'home', player: 'Cafu', description: 'Falta cometida' },
  ];

  // Retornar apenas eventos que já aconteceram (antes do minuto atual)
  return allEvents.filter(e => e.minute <= minute).slice(-5); // Últimos 5 eventos
}

// Formatar evento para exibição
function formatEvent(event) {
  let emoji = '⚽';
  if (event.type === 'yellow_card') emoji = '🟨';
  if (event.type === 'substitution') emoji = '🔄';
  if (event.type === 'foul') emoji = '⚠️';

  return {
    minute: event.minute,
    type: event.type,
    team: event.team,
    player: event.player,
    description: event.description,
    emoji
  };
}

// Validar teamCode (16 times válidos)
function isValidTeamCode(teamCode) {
  return VALID_TEAMS.includes(teamCode?.toUpperCase());
}

// Filtrar jogos de um time (home ou away)
function filterMatchesByTeam(matches, teamCode) {
  if (!teamCode) return matches;
  return matches.filter(m => m.home === teamCode || m.away === teamCode);
}

// Adicionar flag de seleção ao bracket
function addTeamHighlightToBracket(tournament, teamCode) {
  if (!teamCode) return tournament;

  const highlighted = JSON.parse(JSON.stringify(tournament)); // Deep copy

  // Highlight nos grupos
  highlighted.groups = highlighted.groups.map(group => ({
    ...group,
    teams: group.teams.map(team => ({
      code: team,
      name: GAMANAMES[team],
      isSelected: team === teamCode
    }))
  }));

  // Highlight nas fases knockout
  Object.keys(highlighted.knockout).forEach(phase => {
    highlighted.knockout[phase] = highlighted.knockout[phase].map(match => ({
      ...match,
      homeIsSelected: match.home === teamCode,
      awayIsSelected: match.away === teamCode
    }));
  });

  return highlighted;
}

// ============================================================================
// WEBSOCKET SETUP
// ============================================================================

io.on('connection', (socket) => {
  connectedClients++;
  console.log(`🔗 WebSocket client connected (total: ${connectedClients})`);

  // Send current data immediately on connect
  if (cache.data) {
    socket.emit('score:initial', {
      matches: cache.data,
      timestamp: cache.timestamp,
      cached: true,
      source: 'websocket'
    });
  }

  // Broadcast connection status
  io.emit('connection:status', {
    clients: connectedClients,
    status: 'connected',
    timestamp: Date.now()
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`🔌 WebSocket client disconnected (total: ${connectedClients})`);

    io.emit('connection:status', {
      clients: connectedClients,
      status: 'disconnected',
      timestamp: Date.now()
    });
  });

  // Ping for latency measurement (optional)
  socket.on('ping', (data) => {
    socket.emit('pong', {
      timestamp: Date.now(),
      clientTimestamp: data.timestamp,
      latency: Date.now() - data.timestamp
    });
  });
});

/**
 * Broadcast score update to all connected WebSocket clients
 */
function broadcastScoreUpdate(matches) {
  if (!matches || matches.length === 0) return;

  io.emit('score:update', {
    matches,
    timestamp: Date.now(),
    source: 'websocket',
    clientCount: connectedClients
  });

  console.log(`📡 Broadcasted update to ${connectedClients} clients`);
}

/**
 * Broadcast connection error to all connected clients
 */
function broadcastConnectionError(errorMessage) {
  io.emit('connection:error', {
    error: errorMessage,
    timestamp: Date.now(),
    clientCount: connectedClients,
    fallbackMode: 'polling'
  });

  console.log(`⚠️ Broadcasted error to ${connectedClients} clients`);
}

// Buscar e normalizar dados da ESPN
async function fetchEspnScoreboard() {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    if (!response.ok) throw new Error(`ESPN API retornou ${response.status}`);

    const data = await response.json();
    const events = data.events || [];

    console.log(`ESPN: ${events.length} eventos encontrados`);

    // Normalizar para nosso formato
    const matches = events.map(event => {
      const comp = event.competitions?.[0];
      if (!comp) return null;

      const homeTeam = comp.competitors?.find(c => c.homeAway === 'home');
      const awayTeam = comp.competitors?.find(c => c.homeAway === 'away');

      if (!homeTeam || !awayTeam) return null;

      const homeCode = getGameCode(homeTeam.team.name);
      const awayCode = getGameCode(awayTeam.team.name);

      // Se algum código não foi encontrado, loga e pula
      if (!homeCode || !awayCode) {
        console.log(`Skipping: ${homeTeam.team.name} vs ${awayTeam.team.name}`);
        return null;
      }

      const homeScore = homeTeam.score !== undefined ? parseInt(homeTeam.score) : null;
      const awayScore = awayTeam.score !== undefined ? parseInt(awayTeam.score) : null;

      const venue = comp.venue?.fullName || 'Não definido';
      const status = getStatus(comp);
      const minute = getMinute(comp);
      const addedTime = getAddedTime(comp);
      const timeElapsed = status === 'ao_vivo' ? getTimeElapsed(comp, event.date) : null;
      const events = status === 'ao_vivo' ? generateMockEvents(homeCode, awayCode, minute) : [];

      return {
        home: homeCode,
        away: awayCode,
        hs: homeScore,
        as: awayScore,
        status,
        minute,
        addedTime,
        displayMinute: addedTime?.display || (minute ? `${minute}'` : null),
        displayTimeWithSeconds: (addedTime && timeElapsed) ? `${addedTime.display}:${String(timeElapsed.second).padStart(2, '0')}` : (timeElapsed?.display || null),
        timeElapsed, // { minute, second, total_seconds, display: "MM:SS" }
        events: events.map(formatEvent),
        venue,
        ko: event.date,
        currentTime: new Date().toISOString() // Add current server time for clock sync
      };
    }).filter(Boolean);

    console.log(`ESPN: ${matches.length} matches normalizados`);
    return matches.length > 0 ? matches : null;
  } catch (error) {
    console.error('Erro ao buscar ESPN:', error.message);
    return null;
  }
}

// ============================================================================
// BRACKET DATA (Grupos + Fases)
// ============================================================================

// Estrutura completa do torneio (Copa 2026 formato 12 grupos)
const TOURNAMENT_DATA = {
  groups: [
    {
      id: 'A',
      name: 'Grupo A',
      teams: ['BRA', 'NOR', 'MEX', 'CAN'],
      matches: [
        { home: 'BRA', away: 'NOR', hs: 1, as: 2, status: 'encerrado', ko: '2026-07-05T20:00:00Z' },
        { home: 'MEX', away: 'CAN', hs: 3, as: 0, status: 'encerrado', ko: '2026-07-05T22:00:00Z' },
        { home: 'BRA', away: 'MEX', hs: null, as: null, status: 'agendado', ko: '2026-07-10T20:00:00Z' },
        { home: 'NOR', away: 'CAN', hs: null, as: null, status: 'agendado', ko: '2026-07-10T22:00:00Z' },
        { home: 'NOR', away: 'MEX', hs: null, as: null, status: 'agendado', ko: '2026-07-15T20:00:00Z' },
        { home: 'CAN', away: 'BRA', hs: null, as: null, status: 'agendado', ko: '2026-07-15T22:00:00Z' }
      ],
      classified: ['NOR', 'MEX'] // Noruega e México avançam (para demo)
    },
    {
      id: 'B',
      name: 'Grupo B',
      teams: ['ARG', 'EGI', 'SUI', 'PAR'],
      matches: [
        { home: 'ARG', away: 'EGI', hs: 2, as: 1, status: 'encerrado', ko: '2026-07-07T16:00:00Z' },
        { home: 'SUI', away: 'PAR', hs: 0, as: 0, status: 'encerrado', ko: '2026-07-07T18:00:00Z' },
        { home: 'ARG', away: 'SUI', hs: null, as: null, status: 'agendado', ko: '2026-07-12T16:00:00Z' },
        { home: 'EGI', away: 'PAR', hs: null, as: null, status: 'agendado', ko: '2026-07-12T18:00:00Z' },
        { home: 'EGI', away: 'SUI', hs: null, as: null, status: 'agendado', ko: '2026-07-17T16:00:00Z' },
        { home: 'PAR', away: 'ARG', hs: null, as: null, status: 'agendado', ko: '2026-07-17T18:00:00Z' }
      ],
      classified: ['ARG', 'SUI'] // Argentina e Suíça avançam (para demo)
    }
    // Nota: Simplificado a 2 grupos para demo. Copa 2026 tem 12 grupos de 4 times
  ],
  knockout: {
    round16: [
      // Slots serão preenchidos conforme times classificam
      { id: 'r16-1', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'r16-2', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'r16-3', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'r16-4', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'r16-5', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'r16-6', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'r16-7', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'r16-8', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null }
    ],
    quarterfinals: [
      { id: 'qf-1', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'qf-2', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'qf-3', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'qf-4', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null }
    ],
    semifinals: [
      { id: 'sf-1', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null },
      { id: 'sf-2', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null }
    ],
    final: [
      { id: 'final-1', home: null, away: null, hs: null, as: null, status: 'agendado', winner: null }
    ]
  }
};

// Endpoint POST /api/select-team
// Corpo: { teamCode: "BRA" }
// Retorna: dados iniciais do time (próximos jogos, status)
app.post('/api/select-team', async (req, res) => {
  try {
    const { teamCode } = req.body;

    // Validar teamCode
    if (!teamCode) {
      return res.status(400).json({
        error: 'Campo "teamCode" é obrigatório',
        validTeams: VALID_TEAMS
      });
    }

    const upperCode = teamCode.toUpperCase();

    if (!isValidTeamCode(upperCode)) {
      return res.status(400).json({
        error: `Time "${teamCode}" inválido`,
        message: 'Use um dos 16 times da Copa 2026',
        validTeams: VALID_TEAMS,
        example: 'BRA, NOR, MEX, ENG, ARG, EGI, SUI, COL, MAR, CAN, FRA, PAR, POR, ESP, USA, BEL'
      });
    }

    // Salvar seleção em memória
    currentSelectedTeam = upperCode;

    // Retornar dados iniciais
    const initialData = {
      selectedTeam: upperCode,
      teamName: GAMANAMES[upperCode],
      timestamp: new Date().toISOString(),
      message: `Time ${GAMANAMES[upperCode]} selecionado com sucesso`
    };

    // Tentar buscar scores atuais para o time
    const allMatches = await fetchEspnScoreboard();
    if (allMatches) {
      const teamMatches = filterMatchesByTeam(allMatches, upperCode);
      initialData.upcomingMatches = teamMatches.slice(0, 3); // Próximos 3 jogos
      initialData.totalMatches = teamMatches.length;
    }

    res.status(200).json(initialData);
  } catch (error) {
    console.error('Erro em /api/select-team:', error);
    res.status(500).json({
      error: 'Erro ao selecionar time',
      message: error.message
    });
  }
});

// Endpoint /api/bracket
app.get('/api/bracket', async (req, res) => {
  try {
    const { team } = req.query;
    const upperTeam = team?.toUpperCase();

    // Validar teamCode se fornecido
    if (team && !isValidTeamCode(upperTeam)) {
      return res.status(400).json({
        error: `Time "${team}" inválido`,
        validTeams: VALID_TEAMS
      });
    }

    // Adicionar highlight se time foi selecionado
    const highlightedTournament = upperTeam
      ? addTeamHighlightToBracket(TOURNAMENT_DATA, upperTeam)
      : TOURNAMENT_DATA;

    res.json({
      tournament: highlightedTournament,
      selectedTeam: upperTeam || null,
      teamName: upperTeam ? GAMANAMES[upperTeam] : null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Erro ao retornar bracket:', error);
    res.status(500).json({
      error: 'Erro ao retornar dados do torneio',
      message: error.message
    });
  }
});

// Endpoint /api/scoreboard
app.get('/api/scoreboard', async (req, res) => {
  try {
    const now = Date.now();
    const { team } = req.query;
    const upperTeam = team?.toUpperCase();

    // Validar teamCode se fornecido
    if (team && !isValidTeamCode(upperTeam)) {
      return res.status(400).json({
        error: `Time "${team}" inválido`,
        validTeams: VALID_TEAMS,
        example: 'GET /api/scoreboard?team=BRA'
      });
    }

    // Retorna do cache se válido
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      const filtered = upperTeam
        ? filterMatchesByTeam(cache.data, upperTeam)
        : cache.data;

      return res.json({
        matches: filtered,
        cached: true,
        selectedTeam: upperTeam || null,
        teamName: upperTeam ? GAMANAMES[upperTeam] : null,
        totalMatches: filtered.length,
        timestamp: cache.timestamp
      });
    }

    // Busca novo
    const matches = await fetchEspnScoreboard();

    if (matches && matches.length > 0) {
      cache.data = matches;
      cache.timestamp = now;

      // Broadcast to WebSocket clients
      broadcastScoreUpdate(matches);

      const filtered = upperTeam
        ? filterMatchesByTeam(matches, upperTeam)
        : matches;

      return res.json({
        matches: filtered,
        cached: false,
        selectedTeam: upperTeam || null,
        teamName: upperTeam ? GAMANAMES[upperTeam] : null,
        totalMatches: filtered.length,
        timestamp: now
      });
    }

    // Se ESPN falhar
    if (!matches) {
      broadcastConnectionError('ESPN API indisponível');
    }

    // Se ESPN falhar e temos cache expirado, retorna cache mesmo assim
    if (cache.data) {
      const filtered = upperTeam
        ? filterMatchesByTeam(cache.data, upperTeam)
        : cache.data;

      return res.json({
        matches: filtered,
        cached: true,
        stale: true,
        selectedTeam: upperTeam || null,
        teamName: upperTeam ? GAMANAMES[upperTeam] : null,
        totalMatches: filtered.length,
        timestamp: cache.timestamp,
        error: 'ESPN indisponível, usando último dado conhecido'
      });
    }

    // Sem cache e sem dados — retorna array vazio
    res.json({
      matches: [],
      selectedTeam: upperTeam || null,
      teamName: upperTeam ? GAMANAMES[upperTeam] : null,
      error: 'Sem dados disponíveis'
    });
  } catch (error) {
    console.error('Erro no endpoint /api/scoreboard:', error);
    res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error.message
    });
  }
});

// Endpoint POST /api/generate-instagram-post
app.post('/api/generate-instagram-post', (req, res) => {
  try {
    const { homeTeam, awayTeam, homeScore, awayScore, minute, addedTime } = req.body;

    if (!homeTeam || !awayTeam) {
      return res.status(400).json({
        error: 'Times (homeTeam, awayTeam) são obrigatórios'
      });
    }

    const post = generateInstagramPost({
      homeTeam,
      awayTeam,
      homeScore: homeScore ?? null,
      awayScore: awayScore ?? null,
      minute: minute ?? null,
      addedTime: addedTime ?? null
    });

    res.json(post);
  } catch (error) {
    console.error('Erro ao gerar post Instagram:', error);
    res.status(500).json({
      error: 'Erro ao gerar post',
      message: error.message
    });
  }
});

// Serve arquivos estáticos (HTML, CSS, JS)
app.use(express.static(join(__dirname, '../public')));

// Fallback: serve index.html para rotas não encontradas (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

server.listen(PORT, () => {
  console.log(`🟢 GAMA Copa Center rodando em http://localhost:${PORT}`);
  console.log(`\n📊 API ENDPOINTS:\n`);
  console.log(`  1️⃣ SELECT TEAM (POST)`);
  console.log(`     curl -X POST http://localhost:${PORT}/api/select-team \\`);
  console.log(`       -H "Content-Type: application/json" \\`);
  console.log(`       -d '{"teamCode":"BRA"}'`);
  console.log(`     → Retorna dados iniciais do time (próximos jogos, status)\n`);
  console.log(`  2️⃣ SCOREBOARD (GET)`);
  console.log(`     curl http://localhost:${PORT}/api/scoreboard                  (todos jogos)`);
  console.log(`     curl http://localhost:${PORT}/api/scoreboard?team=BRA        (jogos do Brasil)\n`);
  console.log(`  3️⃣ BRACKET (GET)`);
  console.log(`     curl http://localhost:${PORT}/api/bracket                    (sem highlight)`);
  console.log(`     curl http://localhost:${PORT}/api/bracket?team=BRA          (com highlight Brasil)\n`);
  console.log(`  4️⃣ INSTAGRAM POST (POST)`);
  console.log(`     curl -X POST http://localhost:${PORT}/api/generate-instagram-post \\`);
  console.log(`       -H "Content-Type: application/json" \\`);
  console.log(`       -d '{"homeTeam":"BRA","awayTeam":"NOR","homeScore":1,"awayScore":2}'\n`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT} (Socket.IO)`);
  console.log(`📡 Real-time scores via WebSocket with HTTP polling fallback\n`);
  console.log(`✅ TIMES VÁLIDOS: ${VALID_TEAMS.join(', ')}\n`);
});
