// Mapeamento ESPN → códigos internos GAMA (3 letras)
// Captura aliases comuns: nomes completos, abreviações, variações
// IMPORTANTE: ESPN usa titlecase (Brazil, Norway, etc) — normalizeTeamName() faz toLowerCase()

export const espnToGama = {
  // América do Sul
  brazil: 'BRA',
  brasil: 'BRA',
  'bra': 'BRA',
  argentina: 'ARG',
  'arg': 'ARG',
  uruguay: 'URU',
  'uru': 'URU',
  paraguay: 'PAR',
  'par': 'PAR',
  paraguay: 'PAR',
  'col': 'COL',
  colombia: 'COL',

  // Europa Ocidental
  france: 'FRA',
  frança: 'FRA',
  'fra': 'FRA',
  germany: 'ALE',
  alemanha: 'ALE',
  'ale': 'ALE',
  'esp': 'ESP',
  spain: 'ESP',
  espanha: 'ESP',
  portugal: 'POR',
  'por': 'POR',
  belgium: 'BEL',
  bélgica: 'BEL',
  'bel': 'BEL',
  netherlands: 'HOL',
  holanda: 'HOL',
  'hol': 'HOL',
  switzerland: 'SUI',
  suíça: 'SUI',
  'sui': 'SUI',

  // Europa Setentrional
  norway: 'NOR',
  noruega: 'NOR',
  'nor': 'NOR',
  england: 'ENG',
  inglaterra: 'ENG',
  'eng': 'ENG',
  scotland: 'ESC',
  escócia: 'ESC',
  'esc': 'ESC',
  'wales': 'PAI',
  'pai': 'PAI',
  'denmark': 'DIN',
  'din': 'DIN',

  // Europa Oriental
  'poland': 'POL',
  'polônia': 'POL',
  'pol': 'POL',
  'czechia': 'RTC',
  'república tcheca': 'RTC',
  'rtc': 'RTC',
  'hungary': 'HUN',
  'hungria': 'HUN',
  'hun': 'HUN',
  'romania': 'ROM',
  'romênia': 'ROM',
  'rom': 'ROM',
  'serbia': 'SER',
  'sérvia': 'SER',
  'ser': 'SER',
  'croatia': 'CRO',
  'croácia': 'CRO',
  'cro': 'CRO',
  'ukraine': 'UCR',
  'ucrânia': 'UCR',
  'ucr': 'UCR',

  // Ásia
  japan: 'JAP',
  japão: 'JAP',
  'jap': 'JAP',
  'korea': 'COR',
  'coreia': 'COR',
  'cor': 'COR',
  'saudi arabia': 'ARA',
  'arábia saudita': 'ARA',
  'ara': 'ARA',
  'iran': 'IRA',
  'irã': 'IRA',
  'ira': 'IRA',
  'iraq': 'IRA',
  'uae': 'EAU',
  'emirados árabes': 'EAU',
  'eau': 'EAU',
  'australia': 'AUS',
  'austrália': 'AUS',
  'aus': 'AUS',

  // Afrika
  egypt: 'EGI',
  egito: 'EGI',
  'egi': 'EGI',
  morocco: 'MAR',
  marrocos: 'MAR',
  'mar': 'MAR',
  'senegal': 'SEN',
  'sen': 'SEN',
  'ghana': 'GAN',
  'gan': 'GAN',
  'nigeria': 'NIG',
  'nig': 'NIG',
  'cameroon': 'CAM',
  'camarões': 'CAM',
  'cam': 'CAM',
  'côte d\'ivoire': 'CID',
  'costa do marfim': 'CID',
  'cid': 'CID',
  'south africa': 'AFS',
  'áfrica do sul': 'AFS',
  'afs': 'AFS',
  'algeria': 'ARG',
  'argélia': 'ARG',
  'tunisia': 'TUN',
  'tunísia': 'TUN',
  'tun': 'TUN',

  // América do Norte
  'united states': 'USA',
  'estados unidos': 'USA',
  'usa': 'USA',
  'us': 'USA',
  'mexico': 'MEX',
  'méxico': 'MEX',
  'mex': 'MEX',
  'canada': 'CAN',
  'canadá': 'CAN',
  'can': 'CAN',
  'costa rica': 'CRC',
  'crc': 'CRC',
  'honduras': 'HON',
  'hon': 'HON',
  'jamaica': 'JAM',
  'jam': 'JAM',
  'panama': 'PAN',
  'panamá': 'PAN',
  'pan': 'PAN',

  // América Central e do Sul (outros)
  'peru': 'PER',
  'per': 'PER',
  'ecuador': 'ECU',
  'ecu': 'ECU',
  'venezuela': 'VEN',
  'ven': 'VEN',
  'chile': 'CHI',
  'chi': 'CHI',
  'bolivia': 'BOL',
  'bolívia': 'BOL',
  'bol': 'BOL',

  // Oceania (extra)
  'new zealand': 'NZL',
  'nova zelândia': 'NZL',
  'nzl': 'NZL',
  'fiji': 'FIJ',
  'fij': 'FIJ'
};

export function normalizeTeamName(name) {
  if (!name) return null;
  return name.toLowerCase().trim();
}

export function getGameCode(espnName) {
  const norm = normalizeTeamName(espnName);
  const code = espnToGama[norm];
  if (!code) {
    console.warn(`Team not found: "${espnName}" (normalized: "${norm}")`);
  }
  return code || null;
}
