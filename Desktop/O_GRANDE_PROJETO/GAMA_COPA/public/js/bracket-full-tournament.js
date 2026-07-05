/**
 * GAMA Copa Center — Full Tournament Bracket & History
 * Grupos + Oitavas + Quartas + Semis + Final com sincronização ao vivo
 */

let BRACKET_DATA = null;
let CURRENT_BRACKET_PHASE = 'groups';

/**
 * Busca dados completos do torneio
 */
async function loadBracketData() {
  try {
    const res = await fetch('/api/bracket');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    BRACKET_DATA = data.tournament;
    console.log('📊 Dados do torneio carregados:', BRACKET_DATA);
    return BRACKET_DATA;
  } catch (error) {
    console.error('Erro ao carregar dados do torneio:', error);
    return null;
  }
}

/**
 * Renderiza tabela de grupos
 */
function renderGroups() {
  if (!BRACKET_DATA || !BRACKET_DATA.groups) return '';

  const groupsHtml = BRACKET_DATA.groups.map(group => {
    // Calcular tabela do grupo (vitórias, empates, derrotas, gols, saldo, pts)
    const standings = calculateGroupStandings(group);

    const matchesHtml = group.matches.map(match => {
      const homeCode = match.home;
      const awayCode = match.away;
      const homeTeam = NAMES[homeCode] || homeCode;
      const awayTeam = NAMES[awayCode] || awayCode;

      let statusBadge = '';
      let scoreCell = '–';

      if (match.status === 'encerrado' && match.hs !== null && match.as !== null) {
        scoreCell = `${match.hs}–${match.as}`;
        statusBadge = '<span style="font-size:9px;color:var(--ink-faint)">✓</span>';
      } else if (match.status === 'ao_vivo') {
        scoreCell = `${match.hs !== null ? match.hs : '–'}–${match.as !== null ? match.as : '–'}`;
        statusBadge = '<span style="font-size:10px;color:var(--red);font-weight:700">●</span>';
      } else {
        const matchDate = new Date(match.ko);
        const timeStr = `${String(matchDate.getUTCDate()).padStart(2, '0')}/${String(matchDate.getUTCMonth() + 1).padStart(2, '0')}`;
        scoreCell = timeStr;
        statusBadge = '';
      }

      return `
        <tr style="border-bottom:1px solid var(--line-2);font-size:11px">
          <td style="padding:6px 4px">
            <div class="team-cell">
              <div class="team-badge-sm ${homeCode === 'BRA' ? 'br' : ''}">${homeCode}</div>
              <span class="team-name">${homeTeam}</span>
            </div>
          </td>
          <td style="text-align:center;padding:6px 4px;font-family:var(--mono);font-weight:600">${scoreCell}</td>
          <td style="text-align:center;padding:6px 4px">
            <div class="team-cell" style="justify-content:flex-end">
              <span class="team-name">${awayTeam}</span>
              <div class="team-badge-sm ${awayCode === 'BRA' ? 'br' : ''}">${awayCode}</div>
            </div>
          </td>
          <td style="text-align:center;padding:6px 4px">${statusBadge}</td>
        </tr>
      `;
    }).join('');

    const standingsHtml = standings.map(team => {
      const isBR = team.code === 'BRA';
      const isClassified = group.classified.includes(team.code);
      const isEliminated = !isClassified && Object.keys(standings).length > 2; // Simplificado

      return `
        <tr style="border-bottom:1px solid var(--line-2)">
          <td style="padding:8px 4px">
            <div class="team-cell ${isClassified ? 'classified' : isEliminated ? 'eliminated' : ''}">
              <div class="team-badge-sm ${isBR ? 'br' : ''} ${isClassified ? 'winner' : ''}">${team.code}</div>
              <span class="team-name">${NAMES[team.code] || team.code}</span>
            </div>
          </td>
          <td class="stat-cell">${team.played}</td>
          <td class="stat-cell">${team.won}</td>
          <td class="stat-cell">${team.drawn}</td>
          <td class="stat-cell">${team.lost}</td>
          <td class="stat-cell">${team.gf}:${team.ga}</td>
          <td class="stat-cell" style="color:var(--lime);font-weight:600">${team.points}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="group-card">
        <div class="group-header">Grupo ${group.id} · ${group.name}</div>

        <div style="margin-bottom:16px">
          <table class="group-table" style="font-size:10px;margin-bottom:12px">
            <thead>
              <tr style="border-bottom:1px solid var(--line)">
                <th>Time</th>
                <th style="width:30px">J</th>
                <th style="width:30px">V</th>
                <th style="width:30px">E</th>
                <th style="width:30px">D</th>
                <th style="width:40px">SG</th>
                <th style="width:30px">Pts</th>
              </tr>
            </thead>
            <tbody>
              ${standingsHtml}
            </tbody>
          </table>
        </div>

        <div style="font-size:10px;color:var(--ink-faint);font-family:var(--mono);margin-bottom:10px;letter-spacing:.5px;text-transform:uppercase">Jogos do grupo</div>
        <table class="group-table" style="font-size:9px">
          <tbody>
            ${matchesHtml}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  const container = document.getElementById('groupsSlot');
  if (container) {
    container.innerHTML = groupsHtml;
  }
}

/**
 * Calcular standings de um grupo
 */
function calculateGroupStandings(group) {
  const standings = {};

  group.teams.forEach(team => {
    standings[team] = {
      code: team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0
    };
  });

  group.matches.forEach(match => {
    if (match.status === 'encerrado' && match.hs !== null && match.as !== null) {
      const home = standings[match.home];
      const away = standings[match.away];

      home.played++;
      away.played++;
      home.gf += match.hs;
      home.ga += match.as;
      away.gf += match.as;
      away.ga += match.hs;

      if (match.hs > match.as) {
        home.won++;
        home.points += 3;
        away.lost++;
      } else if (match.as > match.hs) {
        away.won++;
        away.points += 3;
        home.lost++;
      } else {
        home.drawn++;
        home.points += 1;
        away.drawn++;
        away.points += 1;
      }
    }
  });

  // Ordenar por pontos, diferença de gols, gols marcados
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gf - b.ga !== a.gf - a.ga) return (b.gf - b.ga) - (a.gf - a.ga);
    return b.gf - a.gf;
  });
}

/**
 * Renderiza fase de knockout (oitavas, quartas, semis, final)
 */
function renderKnockoutPhase(phase) {
  if (!BRACKET_DATA || !BRACKET_DATA.knockout) return '';

  let matches = [];
  let phaseName = '';

  if (phase === 'round16') {
    matches = BRACKET_DATA.knockout.round16;
    phaseName = 'Oitavas de Final';
  } else if (phase === 'quarters') {
    matches = BRACKET_DATA.knockout.quarterfinals;
    phaseName = 'Quartas de Final';
  } else if (phase === 'semis') {
    matches = BRACKET_DATA.knockout.semifinals;
    phaseName = 'Semifinais';
  } else if (phase === 'final') {
    matches = BRACKET_DATA.knockout.final;
    phaseName = 'Final';
  }

  const matchesHtml = matches.map(match => {
    const homeCode = match.home || '?';
    const awayCode = match.away || '?';

    const homeTeam = homeCode === '?' ? 'A definir' : (NAMES[homeCode] || homeCode);
    const awayTeam = awayCode === '?' ? 'A definir' : (NAMES[awayCode] || awayCode);

    const isBrHome = match.home === 'BRA';
    const isBrAway = match.away === 'BRA';
    const isBrMatch = isBrHome || isBrAway;

    let homeClass = '';
    let awayClass = '';
    let cardClass = '';

    if (match.status === 'encerrado' && match.hs !== null && match.as !== null) {
      cardClass = 'finished';
      if (match.hs > match.as) {
        homeClass = 'winner';
        awayClass = 'eliminated';
      } else if (match.as > match.hs) {
        awayClass = 'winner';
        homeClass = 'eliminated';
      }
    }

    const scoreHtml = match.hs !== null && match.as !== null
      ? `<div class="ko-vs">${match.hs}–${match.as}</div>`
      : `<div class="ko-vs">vs</div>`;

    return `
      <div class="ko-match ${isBrMatch ? 'br' : ''} ${cardClass}">
        <div class="ko-match-teams">
          <div class="ko-team ${homeClass}">
            <div class="ko-team-info">
              <div class="ko-team-badge ${isBrHome ? 'br' : ''}">${homeCode}</div>
              <span class="ko-team-name">${homeTeam}</span>
            </div>
            ${match.hs !== null ? `<div class="ko-team-score">${match.hs}</div>` : '<div class="ko-team-score pending">–</div>'}
          </div>
          ${scoreHtml}
          <div class="ko-team ${awayClass}">
            <div class="ko-team-info">
              <div class="ko-team-badge ${isBrAway ? 'br' : ''}">${awayCode}</div>
              <span class="ko-team-name">${awayTeam}</span>
            </div>
            ${match.as !== null ? `<div class="ko-team-score">${match.as}</div>` : '<div class="ko-team-score pending">–</div>'}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div>
      <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;color:var(--ink)">${phaseName}</h3>
      <div class="bracket-round">
        <div class="bracket-column">
          ${matchesHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * Muda a fase exibida no bracket
 */
function switchBracketPhase(phase) {
  // Ocultar todas as fases
  document.querySelectorAll('.bracket-phase').forEach(el => {
    el.style.display = 'none';
  });

  // Atualizar tabs
  document.querySelectorAll('.bracket-tab').forEach(btn => {
    btn.classList.remove('active');
  });

  // Exibir fase selecionada
  CURRENT_BRACKET_PHASE = phase;
  const phaseEl = document.getElementById(`bracketPhase-${phase}`);
  if (phaseEl) {
    phaseEl.style.display = 'block';
  }

  // Marcar tab como ativo
  event.target.classList.add('active');

  // Renderizar conteúdo se necessário
  if (phase === 'groups') {
    renderGroups();
  } else if (phase === 'round16') {
    const html = renderKnockoutPhase('round16');
    const container = document.getElementById('boardSlot-r16');
    if (container) {
      container.innerHTML = html;
    }
  } else if (phase === 'quarters') {
    const html = renderKnockoutPhase('quarters');
    const container = document.getElementById('quarterslot');
    if (container) {
      container.innerHTML = html;
    }
  } else if (phase === 'semis') {
    const html = renderKnockoutPhase('semis');
    const container = document.getElementById('semisslot');
    if (container) {
      container.innerHTML = html;
    }
  } else if (phase === 'final') {
    const html = renderKnockoutPhase('final');
    const container = document.getElementById('finalslot');
    if (container) {
      container.innerHTML = html;
    }
  }
}

/**
 * Sincronizar dados ao vivo com bracket
 */
function mergeBracketWithLiveData(liveMatches) {
  if (!liveMatches || !BRACKET_DATA) return;

  liveMatches.forEach(liveMatch => {
    // Procurar nos grupos
    BRACKET_DATA.groups.forEach(group => {
      group.matches.forEach(match => {
        if (match.home === liveMatch.home && match.away === liveMatch.away) {
          match.hs = liveMatch.hs;
          match.as = liveMatch.as;
          match.status = liveMatch.status;
          match.minute = liveMatch.minute;
          match.timeElapsed = liveMatch.timeElapsed;
          match.addedTime = liveMatch.addedTime;
        }
      });
    });

    // Procurar nos knockouts
    Object.keys(BRACKET_DATA.knockout).forEach(round => {
      BRACKET_DATA.knockout[round].forEach(match => {
        if (match.home === liveMatch.home && match.away === liveMatch.away) {
          match.hs = liveMatch.hs;
          match.as = liveMatch.as;
          match.status = liveMatch.status;
        }
      });
    });
  });

  // Re-renderizar fase atual
  if (CURRENT_BRACKET_PHASE === 'groups') {
    renderGroups();
  }
}

/**
 * Inicializar bracket ao carregar página
 */
async function initBracket() {
  console.log('📊 Inicializando bracket...');
  await loadBracketData();
  renderGroups();
}

/**
 * Hook para atualizar bracket quando dados ao vivo chegam
 */
function updateBracketWithLiveData(liveMatches) {
  mergeBracketWithLiveData(liveMatches);

  // Re-renderizar fase atual
  if (CURRENT_BRACKET_PHASE === 'groups') {
    renderGroups();
  }
}

// Iniciar ao carregar o arquivo
initBracket();
