/**
 * GAMA Copa Center — Interactive Circular Bracket Visualization
 * Visualização redonda + interativa com modal de detalhes
 */

class CircularBracket {
  constructor(containerId = 'bracketCircularSlot') {
    this.container = document.getElementById(containerId);
    this.svgNS = 'http://www.w3.org/2000/svg';
    this.selectedMatch = null;
  }

  /**
   * Renderizar bracket circular completo
   */
  async render(bracketData) {
    if (!bracketData) return;

    const svg = this.createSVG(1000, 1000);

    // Layers
    const bgLayer = this.createGroup(svg, 'bg-layer');
    const connectionLayer = this.createGroup(svg, 'conn-layer');
    const teamLayer = this.createGroup(svg, 'team-layer');
    const interactionLayer = this.createGroup(svg, 'interaction-layer');

    // Background
    this.drawBackground(bgLayer, 500, 500);

    // Render groups em anel externo
    this.drawGroupsRing(teamLayer, connectionLayer, bracketData.groups, 500, 500, 420);

    // Render knockout phases (inward)
    if (bracketData.knockout) {
      this.drawKnockoutRings(teamLayer, connectionLayer, bracketData.knockout, 500, 500);
    }

    // Add SVG ao container
    this.container.innerHTML = '';
    this.container.appendChild(svg);
  }

  /**
   * Criar elemento SVG
   */
  createSVG(width, height) {
    const svg = document.createElementNS(this.svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
    return svg;
  }

  /**
   * Criar grupo SVG
   */
  createGroup(parent, id) {
    const group = document.createElementNS(this.svgNS, 'g');
    group.setAttribute('id', id);
    parent.appendChild(group);
    return group;
  }

  /**
   * Desenhar fundo com gradiente
   */
  drawBackground(layer, cx, cy) {
    // Círculo de fundo
    const bg = document.createElementNS(this.svgNS, 'circle');
    bg.setAttribute('cx', cx);
    bg.setAttribute('cy', cy);
    bg.setAttribute('r', 450);
    bg.setAttribute('fill', 'url(#bracketGradient)');
    bg.setAttribute('opacity', '0.3');
    layer.appendChild(bg);

    // Definir gradiente
    const defs = document.createElementNS(this.svgNS, 'defs');
    const gradient = document.createElementNS(this.svgNS, 'radialGradient');
    gradient.setAttribute('id', 'bracketGradient');
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
    gradient.setAttribute('r', '50%');

    const stop1 = document.createElementNS(this.svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#88CE11');
    stop1.setAttribute('stop-opacity', '0.2');
    gradient.appendChild(stop1);

    const stop2 = document.createElementNS(this.svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#88CE11');
    stop2.setAttribute('stop-opacity', '0');
    gradient.appendChild(stop2);

    defs.appendChild(gradient);
    layer.parentNode.insertBefore(defs, layer.parentNode.firstChild);
  }

  /**
   * Desenhar anel de grupos (anel externo)
   */
  drawGroupsRing(teamLayer, connLayer, groups, cx, cy, radius) {
    const teamsPerGroup = 4;
    const totalTeams = groups.length * teamsPerGroup;
    const anglePerTeam = 360 / totalTeams;

    let teamIndex = 0;
    groups.forEach((group, groupIdx) => {
      // Cor para cada grupo
      const groupColor = ['#88CE11', '#e0a83b', '#e0563b', '#6c5ce7'][groupIdx % 4];

      group.teams.forEach((team, teamIdx) => {
        const angle = teamIndex * anglePerTeam;
        const rad = (angle * Math.PI) / 180;

        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);

        // Encontrar match deste time
        const match = group.matches.find(m => m.home === team || m.away === team);

        // Desenhar nó do time
        this.drawTeamNode(teamLayer, team, x, y, 24, match, groupColor, group);

        teamIndex++;
      });
    });
  }

  /**
   * Desenhar nó de time (círculo com badge)
   */
  drawTeamNode(layer, team, x, y, radius, match, color, group) {
    const g = this.createGroup(layer, `team-${team}-${x}-${y}`);

    // Determinar cor baseado em status
    let fillColor = 'var(--panel)';
    let borderColor = 'var(--line-2)';
    let opacity = 1;

    if (group && group.classified && group.classified.includes(team)) {
      fillColor = color;
      borderColor = color;
    } else if (match && match.status === 'encerrado' && match.hs !== null && match.as !== null) {
      // Time eliminado ou ganhou
      opacity = 0.5;
      borderColor = 'var(--line)';
    }

    // Círculo background
    const circle = document.createElementNS(this.svgNS, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', fillColor === 'var(--panel)' ? '#161616' : fillColor);
    circle.setAttribute('stroke', borderColor === 'var(--lime)' ? '#88CE11' : borderColor);
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('opacity', opacity);
    circle.setAttribute('class', 'bracket-node');
    circle.style.cursor = 'pointer';
    circle.style.transition = 'all 0.3s ease';
    g.appendChild(circle);

    // Texto (código do time)
    const text = document.createElementNS(this.svgNS, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', '700');
    text.setAttribute('font-family', "'JetBrains Mono'");
    text.setAttribute('fill', fillColor === 'var(--panel)' ? '#a0a0a0' : '#0d0d0d');
    text.textContent = team;
    text.style.pointerEvents = 'none';
    g.appendChild(text);

    // Interação
    circle.addEventListener('mouseenter', () => {
      circle.setAttribute('r', radius * 1.3);
      circle.setAttribute('stroke-width', '3');
      this.showTeamTooltip(x, y, team, match, group);
    });

    circle.addEventListener('mouseleave', () => {
      circle.setAttribute('r', radius);
      circle.setAttribute('stroke-width', '2');
      this.hideTooltip();
    });

    circle.addEventListener('click', () => {
      this.showMatchModal(team, match, group);
    });
  }

  /**
   * Desenhar anéis de knockout (16 → 8 → 4 → 2 → 1)
   */
  drawKnockoutRings(teamLayer, connLayer, knockout, cx, cy) {
    const rings = [
      { data: knockout.round16, radius: 310, label: 'R16' },
      { data: knockout.quarterfinals, radius: 240, label: 'QF' },
      { data: knockout.semifinals, radius: 170, label: 'SF' },
      { data: knockout.final, radius: 100, label: 'Final' }
    ];

    rings.forEach(ring => {
      const anglePerMatch = 360 / ring.data.length;

      ring.data.forEach((match, idx) => {
        const angle = idx * anglePerMatch + anglePerMatch / 2;
        const rad = (angle * Math.PI) / 180;

        const x = cx + ring.radius * Math.cos(rad);
        const y = cy + ring.radius * Math.sin(rad);

        // Desenhar nó de match
        this.drawMatchNode(teamLayer, match, x, y, 20, ring.label);
      });
    });
  }

  /**
   * Desenhar nó de match (knockout)
   */
  drawMatchNode(layer, match, x, y, radius, label) {
    const g = this.createGroup(layer, `match-${match.id}`);

    // Determinar status
    let fillColor = '#161616';
    let strokeColor = 'var(--line-2)';
    let pattern = 'none';

    if (match.home && match.away) {
      if (match.status === 'encerrado' && match.hs !== null && match.as !== null) {
        // Match completado
        if (match.hs > match.as) {
          fillColor = match.home === 'BRA' ? '#88CE11' : '#0d0d0d';
          strokeColor = '#88CE11';
        } else if (match.as > match.hs) {
          fillColor = match.away === 'BRA' ? '#88CE11' : '#0d0d0d';
          strokeColor = '#88CE11';
        }
      } else if (match.status === 'ao_vivo') {
        strokeColor = '#e0563b';
      }
    } else {
      // A definir
      pattern = 'dashed';
      strokeColor = 'var(--lime)';
    }

    // Círculo
    const circle = document.createElementNS(this.svgNS, 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', fillColor);
    circle.setAttribute('stroke', strokeColor === 'var(--line-2)' ? '#333' : strokeColor === 'var(--lime)' ? '#88CE11' : strokeColor);
    circle.setAttribute('stroke-width', '1.5');
    circle.setAttribute('stroke-dasharray', pattern === 'dashed' ? '3,3' : 'none');
    circle.style.cursor = 'pointer';
    circle.style.transition = 'all 0.3s ease';
    g.appendChild(circle);

    // Score ou "?"
    const text = document.createElementNS(this.svgNS, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', '10');
    text.setAttribute('font-weight', '700');
    text.setAttribute('font-family', "'JetBrains Mono'");
    text.setAttribute('fill', '#a0a0a0');

    if (match.home && match.away && match.hs !== null && match.as !== null) {
      text.textContent = `${match.hs}–${match.as}`;
    } else {
      text.textContent = '?';
    }

    text.style.pointerEvents = 'none';
    g.appendChild(text);

    // Interação
    circle.addEventListener('mouseenter', () => {
      circle.setAttribute('r', radius * 1.4);
      this.showMatchTooltip(x, y, match, label);
    });

    circle.addEventListener('mouseleave', () => {
      circle.setAttribute('r', radius);
      this.hideTooltip();
    });

    circle.addEventListener('click', () => {
      this.showMatchModal(null, match, null, label);
    });
  }

  /**
   * Mostrar tooltip do time
   */
  showTeamTooltip(x, y, team, match, group) {
    const tooltip = document.createElement('div');
    tooltip.id = 'bracket-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(13, 13, 13, 0.95);
      border: 1px solid #88CE11;
      border-radius: 4px;
      padding: 12px;
      color: #f2f2f2;
      font-size: 12px;
      font-family: 'JetBrains Mono';
      pointer-events: none;
      z-index: 100;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      max-width: 180px;
      text-align: center;
    `;

    let html = `<div style="font-weight: 700; color: #88CE11; margin-bottom: 6px">${team}</div>`;
    html += `<div style="font-size: 11px; color: #a0a0a0">${NAMES[team] || team}</div>`;

    if (group && group.classified && group.classified.includes(team)) {
      html += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333; color: #88CE11; font-weight: 600">✓ Classificado</div>`;
    }

    if (match && match.status === 'encerrado') {
      html += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333; font-size: 11px">`;
      if ((match.home === team && match.hs > match.as) || (match.away === team && match.as > match.hs)) {
        html += `<span style="color: #88CE11">Vitória</span>`;
      } else {
        html += `<span style="color: #e0563b">Eliminado</span>`;
      }
      html += `</div>`;
    }

    tooltip.innerHTML = html;
    document.body.appendChild(tooltip);
  }

  /**
   * Mostrar tooltip do match
   */
  showMatchTooltip(x, y, match, label) {
    const tooltip = document.createElement('div');
    tooltip.id = 'bracket-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(13, 13, 13, 0.95);
      border: 1px solid #88CE11;
      border-radius: 4px;
      padding: 12px;
      color: #f2f2f2;
      font-size: 11px;
      font-family: 'JetBrains Mono';
      pointer-events: none;
      z-index: 100;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -100%);
      min-width: 180px;
    `;

    let html = `<div style="font-weight: 700; color: #88CE11; margin-bottom: 8px">${label}</div>`;

    if (match.home && match.away) {
      html += `<div style="display: flex; justify-content: space-between; gap: 8px; font-weight: 600">`;
      html += `<span>${match.home}</span>`;
      html += match.hs !== null ? `<span style="color: #88CE11">${match.hs}–${match.as}</span>` : `<span style="color: #a0a0a0">vs</span>`;
      html += `<span>${match.away}</span>`;
      html += `</div>`;

      if (match.status === 'encerrado' && match.hs !== null && match.as !== null) {
        const winner = match.hs > match.as ? match.home : match.away;
        html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #333; color: #88CE11">Vencedor: ${winner}</div>`;
      } else if (match.status === 'ao_vivo') {
        html += `<div style="margin-top: 8px; color: #e0563b; font-weight: 700">● Ao vivo</div>`;
      } else {
        html += `<div style="margin-top: 8px; color: #a0a0a0">Agendado</div>`;
      }
    } else {
      html += `<div style="color: #a0a0a0">A definir</div>`;
    }

    tooltip.innerHTML = html;
    document.body.appendChild(tooltip);
  }

  /**
   * Ocultar tooltip
   */
  hideTooltip() {
    const tooltip = document.getElementById('bracket-tooltip');
    if (tooltip) tooltip.remove();
  }

  /**
   * Mostrar modal com detalhes do match/time
   */
  showMatchModal(team, match, group, label) {
    const modal = document.createElement('div');
    modal.id = 'bracket-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      font-family: 'Archivo', sans-serif;
    `;

    let content = `
      <div style="background: #161616; border: 1px solid #88CE11; border-radius: 6px; padding: 24px; max-width: 400px; color: #f2f2f2; max-height: 80vh; overflow-y: auto">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
          <h2 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em">${label ? `${label} de Final` : `${team}`}</h2>
          <button onclick="document.getElementById('bracket-modal').remove()" style="background: none; border: none; color: #88CE11; font-size: 20px; cursor: pointer">&times;</button>
        </div>
    `;

    if (match) {
      content += `
        <div style="background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 4px; padding: 16px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <div style="text-align: center; flex: 1">
              <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px">${match.home || '?'}</div>
              <div style="font-size: 12px; color: #a0a0a0">${NAMES[match.home] || '—'}</div>
            </div>
            <div style="text-align: center; flex: 0 0 60px">
              ${match.hs !== null ? `<div style="font-weight: 900; font-size: 24px; color: #88CE11">${match.hs}–${match.as}</div>` : `<div style="color: #a0a0a0">vs</div>`}
            </div>
            <div style="text-align: center; flex: 1">
              <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px">${match.away || '?'}</div>
              <div style="font-size: 12px; color: #a0a0a0">${NAMES[match.away] || '—'}</div>
            </div>
          </div>

          <div style="padding-top: 12px; border-top: 1px solid #2a2a2a; text-align: center">
            <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #88CE11; font-weight: 600; font-family: 'JetBrains Mono'">Status</div>
            <div style="margin-top: 6px; font-size: 12px">
              ${match.status === 'encerrado' ? '✓ Finalizado' : match.status === 'ao_vivo' ? '● Ao vivo' : 'Agendado'}
            </div>
          </div>
        </div>
      `;
    } else if (group) {
      content += `
        <div style="background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 4px; padding: 16px">
          <div style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #88CE11; font-weight: 600; font-family: 'JetBrains Mono'; margin-bottom: 12px">Grupo ${group.id}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px">
            ${group.teams.map(t => `
              <div style="padding: 8px; background: ${t === team ? '#88CE11' : '#0d0d0d'}11; border: 1px solid ${t === team ? '#88CE11' : '#333'}; border-radius: 3px; text-align: center">
                <div style="font-weight: 700; color: ${t === team ? '#88CE11' : '#f2f2f2'}">${t}</div>
                <div style="font-size: 10px; color: #a0a0a0">${NAMES[t] || t}</div>
              </div>
            `).join('')}
          </div>
          ${group.classified && group.classified.includes(team) ? `
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2a2a2a; text-align: center; color: #88CE11; font-weight: 700">
              ✓ Classificado para Oitavas
            </div>
          ` : ''}
        </div>
      `;
    }

    content += `
      <div style="margin-top: 16px; text-align: center; font-size: 11px; color: #a0a0a0; font-family: 'JetBrains Mono'; letter-spacing: 0.5px">
        Clique em qualquer nó para ver detalhes
      </div>
      </div>
    `;

    modal.innerHTML = content;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }
}

// Instância global
let circularBracket = null;
let BRACKET_DATA = null;

/**
 * Buscar dados do bracket da API
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
 * Sincronizar bracket com dados ao vivo
 */
function mergeBracketWithLiveData(liveMatches) {
  if (!liveMatches || !BRACKET_DATA) return;

  liveMatches.forEach(liveMatch => {
    // Procurar nos grupos
    if (BRACKET_DATA.groups) {
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
    }

    // Procurar nos knockouts
    if (BRACKET_DATA.knockout) {
      Object.keys(BRACKET_DATA.knockout).forEach(round => {
        BRACKET_DATA.knockout[round].forEach(match => {
          if (match.home === liveMatch.home && match.away === liveMatch.away) {
            match.hs = liveMatch.hs;
            match.as = liveMatch.as;
            match.status = liveMatch.status;
          }
        });
      });
    }
  });

  // Re-renderizar bracket
  if (circularBracket && BRACKET_DATA) {
    circularBracket.render(BRACKET_DATA);
  }
}

/**
 * Inicializar bracket circular
 */
async function initCircularBracket() {
  if (!BRACKET_DATA) {
    await loadBracketData();
  }

  circularBracket = new CircularBracket('bracketCircularSlot');
  circularBracket.render(BRACKET_DATA);
  console.log('✅ Circular bracket renderizado com dados de ' + (BRACKET_DATA.groups?.length || 0) + ' grupos');
}

// Hook para atualizar bracket quando dados ao vivo chegam
window.updateBracketWithLiveData = function(liveMatches) {
  mergeBracketWithLiveData(liveMatches);
};

// Iniciar ao carregar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initCircularBracket, 500);
});
