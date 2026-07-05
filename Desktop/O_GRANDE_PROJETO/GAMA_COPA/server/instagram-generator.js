/**
 * Instagram Post Generator for Copa Center
 * Gera copy, hashtags, e imagem SVG do placar
 */

// Insights históricos por matchup
const HISTORICAL_INSIGHTS = {
  'BRA-NOR': 'Tabu de quase 40 anos: o Brasil NUNCA venceu a Noruega em Copas.',
  'BRA-MEX': 'Brasil venceu México nas últimas 3 oitavas (2014, 2018, 2022).',
  'BRA-ENG': 'Clássico europeu: Brasil vs Inglaterra sempre é uma final em miniatura.',
  'BRA-ARG': 'O Clássico Americano. O Brasil é favorito histórico.',
  'BRA-FRA': 'França é campeã e favorita. Brasil busca a reabilitação.',
  'BRA-ESP': 'Espanha dominou em 2010, mas Brasil reclama revancha.',
  'BRA-USA': 'O Brasil nunca perdeu para os EUA em Copas.',
  'BRA-BEL': 'Bélgica é top-10, Brasil é favorito nesse confronto.',
  'BRA-POR': 'Portugal sempre briga forte, mas Brasil tem histórico positivo.',
  'BRA-SUI': 'Suíça é forte defensivamente, mas Brasil é ofensivo demais.',
  'BRA-COL': 'Colombia é sempre complicada na altitude, mas Brasil leva vantagem.',
  'BRA-CAN': 'Canadá venceu recentemente na Copa Ouro, Brasil busca revanche.',
  'BRA-MAR': 'Marrocos chegou às semis em 2022, mas Brasil é favorito.',
  'BRA-EGI': 'Egito é fácil para o Brasil, que é experiente nesses duelos.'
};

// Hashtags padrão por contexto
const DEFAULT_HASHTAGS = [
  'CopaDoMundo2026',
  'Brasil',
  'Futebol',
  'VamosBrasil',
  'OHexa',
  'FootballCopa'
];

/**
 * Gerar copy automático para Instagram
 * @param {Object} match - {homeTeam, awayTeam, homeScore, awayScore, minute, addedTime, insight}
 * @returns {string} - Copy formatado com emojis e quebras
 */
export function generateCopy(match) {
  const {
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    minute,
    addedTime,
    insight
  } = match;

  const teamNames = {
    BRA: '🇧🇷 BRASIL',
    NOR: '🇳🇴 NORUEGA',
    MEX: '🇲🇽 MÉXICO',
    ENG: '🇬🇧 INGLATERRA',
    ARG: '🇦🇷 ARGENTINA',
    EGI: '🇪🇬 EGITO',
    SUI: '🇨🇭 SUÍÇA',
    COL: '🇨🇴 COLÔMBIA',
    MAR: '🇲🇦 MARROCOS',
    CAN: '🇨🇦 CANADÁ',
    FRA: '🇫🇷 FRANÇA',
    PAR: '🇵🇾 PARAGUAI',
    POR: '🇵🇹 PORTUGAL',
    ESP: '🇪🇸 ESPANHA',
    USA: '🇺🇸 ESTADOS UNIDOS',
    BEL: '🇧🇪 BÉLGICA'
  };

  const homeFlag = teamNames[homeTeam] || homeTeam;
  const awayFlag = teamNames[awayTeam] || awayTeam;

  const scoreDisplay = homeScore !== null && awayScore !== null
    ? `${homeScore} x ${awayScore}`
    : 'Em breve';

  const timeDisplay = minute
    ? `${minute}'${addedTime ? `+${addedTime}` : ''}`
    : 'Pré-jogo';

  const insightText = insight
    ? `\n\n⚽ ${insight}\n`
    : '\n';

  const copy = `${homeFlag} x ${awayFlag}
Placar: ${scoreDisplay} | ${timeDisplay}
${insightText}
Só a vitória mantém vivo o sonho do hexa! 💛💙

#CopaDoMundo2026 #Brasil #Futebol #VamosBrasil`;

  return copy;
}

/**
 * Buscar insight histórico para o jogo
 * @param {string} homeTeam - Código do time
 * @param {string} awayTeam - Código do time
 * @returns {string|null} - Insight ou null
 */
export function getInsight(homeTeam, awayTeam) {
  // Se Brasil está envolvido
  if (homeTeam === 'BRA') {
    return HISTORICAL_INSIGHTS[`BRA-${awayTeam}`] || null;
  }
  if (awayTeam === 'BRA') {
    return HISTORICAL_INSIGHTS[`BRA-${homeTeam}`] || null;
  }
  return null;
}

/**
 * Gerar SVG do placar para usar como imagem
 * @param {Object} match - {homeTeam, awayTeam, homeScore, awayScore, minute, addedTime}
 * @returns {string} - SVG como string
 */
export function generateScoreSvg(match) {
  const {
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    minute,
    addedTime
  } = match;

  // Nomes dos times em português
  const teamNames = {
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

  // Emojis de bandeiras
  const flags = {
    BRA: '🇧🇷',
    NOR: '🇳🇴',
    MEX: '🇲🇽',
    ENG: '🇬🇧',
    ARG: '🇦🇷',
    EGI: '🇪🇬',
    SUI: '🇨🇭',
    COL: '🇨🇴',
    MAR: '🇲🇦',
    CAN: '🇨🇦',
    FRA: '🇫🇷',
    PAR: '🇵🇾',
    POR: '🇵🇹',
    ESP: '🇪🇸',
    USA: '🇺🇸',
    BEL: '🇧🇪'
  };

  const homeTeamName = teamNames[homeTeam] || homeTeam;
  const awayTeamName = teamNames[awayTeam] || awayTeam;
  const homeFlag = flags[homeTeam] || '';
  const awayFlag = flags[awayTeam] || '';

  const scoreDisplay = homeScore !== null && awayScore !== null
    ? `${homeScore}     ${awayScore}`
    : 'vs';

  const timeDisplay = minute
    ? `${minute}'${addedTime ? `+${addedTime}` : ''}`
    : '';

  // SVG Canvas: 1200x600 (16:9 ratio)
  const svg = `<svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d0d0d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#88CE11;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6fa30f;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="600" fill="url(#bgGradient)"/>

  <!-- Decorative circles (radial glow) -->
  <circle cx="600" cy="300" r="400" fill="none" stroke="#88CE11" opacity="0.08" stroke-width="2"/>
  <circle cx="600" cy="300" r="350" fill="none" stroke="#88CE11" opacity="0.05" stroke-width="2"/>

  <!-- Header band -->
  <rect x="0" y="0" width="1200" height="80" fill="rgba(136, 206, 17, 0.1)" stroke="#88CE11" stroke-width="2"/>

  <!-- Title -->
  <text x="600" y="45" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#88CE11" text-anchor="middle">
    COPA DO MUNDO 2026
  </text>

  <!-- Main match container -->
  <g id="matchContainer">
    <!-- Teams and scores -->
    <g id="homeTeam">
      <!-- Flag emoji (using text) -->
      <text x="200" y="180" font-size="80" text-anchor="middle">${homeFlag}</text>
      <!-- Team name -->
      <text x="200" y="260" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#f2f2f2" text-anchor="middle">
        ${homeTeamName}
      </text>
    </g>

    <!-- Center score box -->
    <g id="scoreBox">
      <!-- Score background -->
      <rect x="400" y="180" width="400" height="180" fill="rgba(136, 206, 17, 0.15)" stroke="url(#limeGradient)" stroke-width="3" rx="8"/>

      <!-- Score display -->
      <text x="600" y="300" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="#88CE11" text-anchor="middle">
        ${scoreDisplay}
      </text>

      <!-- Time display -->
      <text x="600" y="370" font-family="monospace" font-size="28" fill="#e0563b" text-anchor="middle" font-weight="bold">
        ${timeDisplay}
      </text>
    </g>

    <!-- Away team -->
    <g id="awayTeam">
      <!-- Flag emoji -->
      <text x="1000" y="180" font-size="80" text-anchor="middle">${awayFlag}</text>
      <!-- Team name -->
      <text x="1000" y="260" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#f2f2f2" text-anchor="middle">
        ${awayTeamName}
      </text>
    </g>
  </g>

  <!-- Footer brand -->
  <g id="footer">
    <rect x="0" y="520" width="1200" height="80" fill="rgba(0, 0, 0, 0.3)"/>
    <text x="60" y="570" font-family="monospace" font-size="16" fill="#88CE11" font-weight="bold">
      GAMA COPA CENTER
    </text>
    <text x="1140" y="570" font-family="monospace" font-size="14" fill="#a0a0a0" text-anchor="end">
      @agencia.gamastudio
    </text>
  </g>
</svg>`;

  return svg;
}

/**
 * Endpoint handler para POST /api/generate-instagram-post
 * @param {Object} req.body - {homeTeam, awayTeam, homeScore, awayScore, minute, addedTime}
 * @returns {Object} - {copy, imageUrl, hashtags, characterCount, canPost}
 */
export function generateInstagramPost(matchData) {
  const { homeTeam, awayTeam, homeScore, awayScore, minute, addedTime } = matchData;

  // Validar input
  if (!homeTeam || !awayTeam) {
    throw new Error('Times não fornecidos');
  }

  // Buscar insight
  const insight = getInsight(homeTeam, awayTeam);

  // Gerar copy
  const copy = generateCopy({
    homeTeam,
    awayTeam,
    homeScore: homeScore ?? null,
    awayScore: awayScore ?? null,
    minute: minute ?? null,
    addedTime: addedTime ?? null,
    insight
  });

  // Gerar SVG
  const imageUrl = generateScoreSvg({
    homeTeam,
    awayTeam,
    homeScore: homeScore ?? null,
    awayScore: awayScore ?? null,
    minute: minute ?? null,
    addedTime: addedTime ?? null
  });

  // Hashtags
  const hashtags = DEFAULT_HASHTAGS;

  // Contar caracteres (Instagram limit é 2200)
  const characterCount = copy.length;
  const canPost = characterCount <= 2200;

  return {
    copy,
    imageUrl,
    hashtags,
    characterCount,
    canPost,
    instagramUrl: `https://www.instagram.com/compose/?caption=${encodeURIComponent(copy)}`
  };
}
