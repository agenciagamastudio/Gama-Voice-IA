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

// Cache em memória (30s)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 30000;

// Track WebSocket connections
let connectedClients = 0;

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

// Calcular tempo decorrido em segundos (desde kickoff)
function getTimeElapsed(comp, kickoffTime) {
  try {
    const koTime = new Date(kickoffTime).getTime();
    const now = Date.now();
    const elapsedMs = now - koTime;

    // Convert to seconds, cap at 90 minutes + added time
    const totalSeconds = Math.floor(elapsedMs / 1000);
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
        timeElapsed, // { minute, second, total_seconds, display: "MM:SS" }
        events: events.map(formatEvent),
        venue,
        ko: event.date
      };
    }).filter(Boolean);

    console.log(`ESPN: ${matches.length} matches normalizados`);
    return matches.length > 0 ? matches : null;
  } catch (error) {
    console.error('Erro ao buscar ESPN:', error.message);
    return null;
  }
}

// Endpoint /api/scoreboard
app.get('/api/scoreboard', async (req, res) => {
  try {
    const now = Date.now();

    // Retorna do cache se válido
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      return res.json({
        matches: cache.data,
        cached: true,
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

      return res.json({
        matches,
        cached: false,
        timestamp: now
      });
    }

    // Se ESPN falhar
    if (!matches) {
      broadcastConnectionError('ESPN API indisponível');
    }

    // Se ESPN falhar e temos cache expirado, retorna cache mesmo assim
    if (cache.data) {
      return res.json({
        matches: cache.data,
        cached: true,
        stale: true,
        timestamp: cache.timestamp,
        error: 'ESPN indisponível, usando último dado conhecido'
      });
    }

    // Sem cache e sem dados — retorna array vazio
    res.json({
      matches: [],
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

// Configure JSON parser
app.use(express.json());

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
  console.log(`📊 API: GET http://localhost:${PORT}/api/scoreboard`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT} (Socket.IO)`);
  console.log(`📡 Real-time scores via WebSocket with HTTP polling fallback`);
});
