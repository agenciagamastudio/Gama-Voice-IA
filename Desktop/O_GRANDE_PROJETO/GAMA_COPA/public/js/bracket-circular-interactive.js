/**
 * GAMA Copa Center — Interactive Circular Bracket Visualization
 * Visualização redonda + interativa com modal de detalhes
 */

class CircularBracket {
  constructor(containerId = 'bracketCircularSlot') {
    this.container = document.getElementById(containerId);
    this.svgNS = 'http://www.w3.org/2000/svg';
    this.selectedMatch = null;

    // Parâmetros visuais (estrutura do SVG antigo bonito)
    this.CX = 360;
    this.CY = 360;
    this.RINGS = [
      { n: 16, r: 310, off: 0,     nr: 24, fs: 11 },  // Anel 0: Grupos (16 times)
      { n: 8,  r: 225, off: 11.25, nr: 26, fs: 12 },  // Anel 1: R16 vencedores (8)
      { n: 4,  r: 145, off: 33.75, nr: 28, fs: 12 },  // Anel 2: QF vencedores (4)
      { n: 2,  r: 80,  off: 78.75, nr: 30, fs: 13 }   // Anel 3: Final (2 semifinalistas)
    ];
  }

  /**
   * Renderizar usando o visual ANTIGO BONITO (RINGS + SVG ternário)
   * com dados NOVOS (grupos + knockouts da API)
   */
  async render(bracketData, selectedTeam = 'BRA') {
    if (!bracketData) return;

    const svg = this.renderBracketSVG(bracketData, selectedTeam);
    this.container.innerHTML = '';
    this.container.appendChild(svg);
  }

  /**
   * Renderizar SVG no estilo antigo (visual BONITO ternário em RINGS)
   */
  renderBracketSVG(bracketData, selectedTeam = 'BRA') {
    const svg = document.createElementNS(this.svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 720 720');
    svg.setAttribute('xmlns', this.svgNS);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Chaveamento da Copa');

    // Defs com gradiente radial
    const defs = document.createElementNS(this.svgNS, 'defs');
    const gradient = document.createElementNS(this.svgNS, 'radialGradient');
    gradient.setAttribute('id', 'g');
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
    gradient.setAttribute('r', '50%');

    const stop1 = document.createElementNS(this.svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#88CE11');
    stop1.setAttribute('stop-opacity', '0.11');
    gradient.appendChild(stop1);

    const stop2 = document.createElementNS(this.svgNS, 'stop');
    stop2.setAttribute('offset', '60%');
    stop2.setAttribute('stop-color', '#88CE11');
    stop2.setAttribute('stop-opacity', '0.02');
    gradient.appendChild(stop2);

    const stop3 = document.createElementNS(this.svgNS, 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#88CE11');
    stop3.setAttribute('stop-opacity', '0');
    gradient.appendChild(stop3);

    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Círculo de fundo gradiente
    const bgCircle = document.createElementNS(this.svgNS, 'circle');
    bgCircle.setAttribute('cx', this.CX);
    bgCircle.setAttribute('cy', this.CY);
    bgCircle.setAttribute('r', '330');
    bgCircle.setAttribute('fill', 'url(#g)');
    svg.appendChild(bgCircle);

    // Extrair labels dos times de cada anel
    const ringLabels = this.extractRingLabels(bracketData);

    // Órbitas de guia
    this.RINGS.forEach(ring => {
      const orbit = document.createElementNS(this.svgNS, 'circle');
      orbit.setAttribute('class', 'orbit');
      orbit.setAttribute('cx', this.CX);
      orbit.setAttribute('cy', this.CY);
      orbit.setAttribute('r', ring.r);
      svg.appendChild(orbit);
    });

    // Conexões entre anéis (sem Brasil)
    const connGroup = document.createElementNS(this.svgNS, 'g');
    // Conexões de Brasil
    const connBrGroup = document.createElementNS(this.svgNS, 'g');

    this.drawConnections(connGroup, connBrGroup, ringLabels);
    svg.appendChild(connGroup);
    svg.appendChild(connBrGroup);

    // Nós (times)
    const nodeGroup = document.createElementNS(this.svgNS, 'g');
    this.drawNodes(nodeGroup, ringLabels, selectedTeam);
    svg.appendChild(nodeGroup);

    // Taça no centro
    this.drawTrophy(svg);

    return svg;
  }

  /**
   * Extrair labels dos times por anel
   * Anel 0: 16 times dos grupos
   * Anel 1: 8 vencedores de R16
   * Anel 2: 4 vencedores de QF
   * Anel 3: 2 finalistas
   */
  extractRingLabels(bracketData) {
    const labels = [[], [], [], []];

    // Anel 0: 16 times (grupos)
    if (bracketData.groups) {
      bracketData.groups.forEach(group => {
        group.teams.forEach(team => {
          labels[0].push(team);
        });
      });
    }

    // Anel 1: 8 vencedores de R16
    if (bracketData.knockout?.round16) {
      for (let i = 0; i < 8; i++) {
        const match = bracketData.knockout.round16[i];
        labels[1].push(
          (match && match.hs !== null && match.as !== null)
            ? (match.hs > match.as ? match.home : match.away)
            : null
        );
      }
    }

    // Anel 2: 4 vencedores de QF
    if (bracketData.knockout?.quarterfinals) {
      for (let i = 0; i < 4; i++) {
        const match = bracketData.knockout.quarterfinals[i];
        labels[2].push(
          (match && match.hs !== null && match.as !== null)
            ? (match.hs > match.as ? match.home : match.away)
            : null
        );
      }
    }

    // Anel 3: 2 finalistas
    if (bracketData.knockout?.semifinals?.[0]) {
      const sf1 = bracketData.knockout.semifinals[0];
      labels[3].push(
        (sf1 && sf1.hs !== null && sf1.as !== null)
          ? (sf1.hs > sf1.as ? sf1.home : sf1.away)
          : null
      );
    }
    if (bracketData.knockout?.semifinals?.[1]) {
      const sf2 = bracketData.knockout.semifinals[1];
      labels[3].push(
        (sf2 && sf2.hs !== null && sf2.as !== null)
          ? (sf2.hs > sf2.as ? sf2.home : sf2.away)
          : null
      );
    }

    return labels;
  }

  /**
   * Calcular ponto em um anel
   */
  pt(r, deg) {
    const a = (deg - 90) * Math.PI / 180;
    return [
      (this.CX + r * Math.cos(a)).toFixed(2),
      (this.CY + r * Math.sin(a)).toFixed(2)
    ];
  }

  /**
   * Calcular ângulo de um item em um anel
   */
  ang(ringIdx, itemIdx) {
    return this.RINGS[ringIdx].off + itemIdx * (360 / this.RINGS[ringIdx].n);
  }

  /**
   * Desenhar conexões em arco entre anéis
   */
  drawConnections(connGroup, connBrGroup, labels) {
    // Conexões entre anéis k-1 e k
    for (let k = 1; k < this.RINGS.length; k++) {
      for (let p = 0; p < this.RINGS[k].n; p++) {
        const ang0 = this.ang(k - 1, 2 * p);
        const ang1 = this.ang(k - 1, 2 * p + 1);
        const path = this.elbowPath(
          this.RINGS[k - 1].r,
          this.RINGS[k].r,
          ang0,
          ang1
        );

        const line = document.createElementNS(this.svgNS, 'path');
        line.setAttribute('d', path);

        // Item 0 é sempre Brasil
        if (p === 0) {
          line.setAttribute('class', 'conn br');
          connBrGroup.appendChild(line);
        } else {
          line.setAttribute('class', 'conn');
          connGroup.appendChild(line);
        }
      }
    }

    // Conexão final para a taça
    const f0 = this.pt(this.RINGS[3].r, this.ang(3, 0));
    const f1 = this.pt(this.RINGS[3].r, this.ang(3, 1));

    const lineFinal1 = document.createElementNS(this.svgNS, 'path');
    lineFinal1.setAttribute('class', 'conn br');
    lineFinal1.setAttribute('d', `M${f0[0]} ${f0[1]}L${this.CX} ${this.CY}`);
    connBrGroup.appendChild(lineFinal1);

    const lineFinal2 = document.createElementNS(this.svgNS, 'path');
    lineFinal2.setAttribute('class', 'conn');
    lineFinal2.setAttribute('d', `M${f1[0]} ${f1[1]}L${this.CX} ${this.CY}`);
    connGroup.appendChild(lineFinal2);
  }

  /**
   * Calcular path elbow (arco + linhas)
   */
  elbowPath(Rc, Rp, a0, a1) {
    const Ra = Rp + (Rc - Rp) * 0.5;
    const ap = (a0 + a1) / 2;

    const c0 = this.pt(Rc, a0);
    const c1 = this.pt(Rc, a1);
    const e0 = this.pt(Ra, a0);
    const e1 = this.pt(Ra, a1);
    const em = this.pt(Ra, ap);
    const pp = this.pt(Rp, ap);

    return `M${c0[0]} ${c0[1]}L${e0[0]} ${e0[1]}A${Ra} ${Ra} 0 0 1 ${e1[0]} ${e1[1]}` +
           `M${c1[0]} ${c1[1]}L${e1[0]} ${e1[1]}M${em[0]} ${em[1]}L${pp[0]} ${pp[1]}`;
  }

  /**
   * Desenhar nós (círculos com times)
   */
  drawNodes(nodeGroup, labels, selectedTeam = 'BRA') {
    for (let k = 0; k < this.RINGS.length; k++) {
      for (let i = 0; i < this.RINGS[k].n; i++) {
        const pos = this.pt(this.RINGS[k].r, this.ang(k, i));
        const code = labels[k][i];
        const onBr = (i === 0);

        let cls, label, title;
        if (code) {
          cls = (code === selectedTeam) ? 'nd br' : (onBr ? 'nd br' : 'nd');
          label = code;
          title = NAMES[code] || code;
        } else {
          cls = onBr ? 'nd brtbd' : 'nd tbd';
          label = '?';
          title = 'A definir';
        }

        const g = document.createElementNS(this.svgNS, 'g');
        g.setAttribute('class', cls);

        const titleEl = document.createElementNS(this.svgNS, 'title');
        titleEl.textContent = title;
        g.appendChild(titleEl);

        const circle = document.createElementNS(this.svgNS, 'circle');
        circle.setAttribute('cx', pos[0]);
        circle.setAttribute('cy', pos[1]);
        circle.setAttribute('r', this.RINGS[k].nr);
        g.appendChild(circle);

        const text = document.createElementNS(this.svgNS, 'text');
        text.setAttribute('x', pos[0]);
        text.setAttribute('y', pos[1]);
        text.setAttribute('font-size', this.RINGS[k].fs);
        text.textContent = label;
        g.appendChild(text);

        nodeGroup.appendChild(g);
      }
    }
  }

  /**
   * Desenhar taça no centro
   */
  drawTrophy(svg) {
    const g = document.createElementNS(this.svgNS, 'g');
    g.setAttribute('class', 'champ');

    const title = document.createElementNS(this.svgNS, 'title');
    title.textContent = 'Campeão (a definir)';
    g.appendChild(title);

    const circle = document.createElementNS(this.svgNS, 'circle');
    circle.setAttribute('cx', this.CX);
    circle.setAttribute('cy', this.CY);
    circle.setAttribute('r', '42');
    g.appendChild(circle);

    const tro = document.createElementNS(this.svgNS, 'g');
    tro.setAttribute('class', 'tro');
    tro.setAttribute('transform', `translate(${this.CX},${this.CY})`);

    const path1 = document.createElementNS(this.svgNS, 'path');
    path1.setAttribute('d', 'M-12,-15 L12,-15 C12,-3 6,4 0,4 C-6,4 -12,-3 -12,-15 Z');
    tro.appendChild(path1);

    const path2 = document.createElementNS(this.svgNS, 'path');
    path2.setAttribute('d', 'M-12,-13 C-20,-13 -20,-1 -11,-4');
    path2.setAttribute('fill', 'none');
    path2.setAttribute('stroke', '#0d0d0d');
    path2.setAttribute('stroke-width', '2.4');
    tro.appendChild(path2);

    const path3 = document.createElementNS(this.svgNS, 'path');
    path3.setAttribute('d', 'M12,-13 C20,-13 20,-1 11,-4');
    path3.setAttribute('fill', 'none');
    path3.setAttribute('stroke', '#0d0d0d');
    path3.setAttribute('stroke-width', '2.4');
    tro.appendChild(path3);

    const rect1 = document.createElementNS(this.svgNS, 'rect');
    rect1.setAttribute('x', '-2');
    rect1.setAttribute('y', '4');
    rect1.setAttribute('width', '4');
    rect1.setAttribute('height', '6');
    tro.appendChild(rect1);

    const path4 = document.createElementNS(this.svgNS, 'path');
    path4.setAttribute('d', 'M-8,15 L8,15 L6,9 L-6,9 Z');
    tro.appendChild(path4);

    const rect2 = document.createElementNS(this.svgNS, 'rect');
    rect2.setAttribute('x', '-10');
    rect2.setAttribute('y', '15.5');
    rect2.setAttribute('width', '20');
    rect2.setAttribute('height', '2.4');
    tro.appendChild(rect2);

    g.appendChild(tro);
    svg.appendChild(g);
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

  // Re-renderizar bracket com time selecionado (via GamaBracket)
  if (typeof updateBracketData === 'function' && BRACKET_DATA) {
    updateBracketData(BRACKET_DATA);
  }
}

/**
 * Inicializar bracket circular
 */
async function initCircularBracket(selectedTeam = 'BRA') {
  if (!BRACKET_DATA) {
    await loadBracketData();
  }

  // Inicializar APENAS GamaBracket (nova implementação dinâmica — remove CircularBracket antigo)
  if (typeof initGamaBracket === 'function') {
    const teamSelection = document.querySelector('[data-selected-team]');
    const selectedTeamCode = teamSelection ? teamSelection.getAttribute('data-selected-team') : 'BRA';
    initGamaBracket(BRACKET_DATA, selectedTeamCode);
    console.log('✅ GamaBracket inicializado com dados');
  }
}

// Hook para atualizar bracket quando dados ao vivo chegam
window.updateBracketWithLiveData = function(liveMatches) {
  mergeBracketWithLiveData(liveMatches);
};

// Iniciar ao carregar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initCircularBracket, 500);
});
