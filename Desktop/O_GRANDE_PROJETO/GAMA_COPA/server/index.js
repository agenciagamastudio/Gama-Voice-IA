import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getGameCode } from './teamMap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Cache em memória (30s)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 30000;

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
  const displayClock = comp.status.displayClock || '';

  if (statusType.includes('LIVE')) return 'ao_vivo';
  if (statusType.includes('FINAL') || statusType.includes('COMPLETED')) return 'encerrado';
  if (statusType.includes('SCHEDULED') || statusType.includes('PRE')) return 'agendado';

  return 'agendado';
}

// Extrair minuto do match
function getMinute(comp) {
  if (comp.status?.type?.name?.includes('LIVE')) {
    const timeStr = comp.status.displayClock?.match(/(\d+)\'/);
    return timeStr ? parseInt(timeStr[1]) : null;
  }
  return null;
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

      return {
        home: homeCode,
        away: awayCode,
        hs: homeScore,
        as: awayScore,
        status,
        minute,
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
      return res.json({
        matches,
        cached: false,
        timestamp: now
      });
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

// Serve arquivos estáticos (HTML, CSS, JS)
app.use(express.static(join(__dirname, '../public')));

// Fallback: serve index.html para rotas não encontradas (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🟢 GAMA Copa Center rodando em http://localhost:${PORT}`);
  console.log(`📊 API: GET http://localhost:${PORT}/api/scoreboard`);
});
