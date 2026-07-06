/**
 * GAMA Copa Center — Brazil Path Visualization & Interactivity
 * Mostra o caminho do Brasil até o hexa com destaque visual completo
 * + Seleção de time com highlight automático no bracket
 */

class BrazilPathVisualizer {
  constructor(bracketInstance) {
    this.bracket = bracketInstance;
    this.selectedTeam = 'BRA'; // Brasil selecionado por padrão
    this.brazilPath = [];
    this.setupInteractivity();
  }

  /**
   * Extrair o caminho do Brasil através do torneio
   */
  extractBrazilPath(bracketData) {
    const path = [];

    if (!bracketData) return path;

    // Fase 1: Grupos (Anel 0)
    if (bracketData.groups) {
      const groupWithBra = bracketData.groups.find(g =>
        g.teams && g.teams.includes('BRA')
      );
      if (groupWithBra) {
        path.push({
          stage: 'Grupos',
          team: 'BRA',
          opponent: null,
          match: null,
          description: `Grupo ${groupWithBra.id}`
        });
      }
    }

    // Fase 2: R16 Oitavas (Anel 1)
    if (bracketData.knockout?.round16) {
      for (let i = 0; i < bracketData.knockout.round16.length; i++) {
        const m = bracketData.knockout.round16[i];
        if (m && (m.home === 'BRA' || m.away === 'BRA')) {
          const opponent = m.home === 'BRA' ? m.away : m.home;
          const won = m.hs !== null && m.as !== null &&
            ((m.home === 'BRA' && m.hs > m.as) || (m.away === 'BRA' && m.as > m.hs));

          path.push({
            stage: 'Oitavas',
            team: 'BRA',
            opponent: opponent,
            match: m,
            score: m.hs !== null ? `${m.hs}–${m.as}` : 'vs',
            won: won,
            description: `vs ${NAMES[opponent] || opponent}`
          });
          break;
        }
      }
    }

    // Fase 3: QF Quartas (Anel 2)
    if (bracketData.knockout?.quarterfinals) {
      for (let i = 0; i < bracketData.knockout.quarterfinals.length; i++) {
        const m = bracketData.knockout.quarterfinals[i];
        if (m && (m.home === 'BRA' || m.away === 'BRA')) {
          const opponent = m.home === 'BRA' ? m.away : m.home;
          const won = m.hs !== null && m.as !== null &&
            ((m.home === 'BRA' && m.hs > m.as) || (m.away === 'BRA' && m.as > m.hs));

          path.push({
            stage: 'Quartas',
            team: 'BRA',
            opponent: opponent,
            match: m,
            score: m.hs !== null ? `${m.hs}–${m.as}` : 'vs',
            won: won,
            description: `vs ${NAMES[opponent] || opponent}`
          });
          break;
        }
      }
    }

    // Fase 4: SF Semifinais (Anel 3)
    if (bracketData.knockout?.semifinals) {
      for (let i = 0; i < bracketData.knockout.semifinals.length; i++) {
        const m = bracketData.knockout.semifinals[i];
        if (m && (m.home === 'BRA' || m.away === 'BRA')) {
          const opponent = m.home === 'BRA' ? m.away : m.home;
          const won = m.hs !== null && m.as !== null &&
            ((m.home === 'BRA' && m.hs > m.as) || (m.away === 'BRA' && m.as > m.hs));

          path.push({
            stage: 'Semifinal',
            team: 'BRA',
            opponent: opponent,
            match: m,
            score: m.hs !== null ? `${m.hs}–${m.as}` : 'vs',
            won: won,
            description: `vs ${NAMES[opponent] || opponent}`
          });
          break;
        }
      }
    }

    // Fase 5: Final (Centro)
    if (bracketData.knockout?.final && bracketData.knockout.final.length > 0) {
      const m = bracketData.knockout.final[0];
      if (m && (m.home === 'BRA' || m.away === 'BRA')) {
        const opponent = m.home === 'BRA' ? m.away : m.home;
        const won = m.hs !== null && m.as !== null &&
          ((m.home === 'BRA' && m.hs > m.as) || (m.away === 'BRA' && m.as > m.hs));

        path.push({
          stage: 'Final',
          team: 'BRA',
          opponent: opponent,
          match: m,
          score: m.hs !== null ? `${m.hs}–${m.as}` : 'vs',
          won: won,
          description: won ? '🏆 CAMPEÃO!' : `vs ${NAMES[opponent] || opponent}`
        });
      }
    }

    this.brazilPath = path;
    return path;
  }

  /**
   * Renderizar path do Brasil visualmente no DOM (card com timeline)
   */
  renderBrazilPathCard(bracketData) {
    this.extractBrazilPath(bracketData);

    const container = document.createElement('div');
    container.id = 'brazil-path-container';
    container.style.cssText = `
      background: linear-gradient(135deg, rgba(136, 206, 17, 0.08) 0%, rgba(13, 13, 13, 0.5) 100%);
      border: 1px solid rgba(136, 206, 17, 0.35);
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
      font-family: 'Archivo', sans-serif;
    `;

    let html = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">
        <span style="font-size: 24px">🇧🇷</span>
        <div>
          <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #f2f2f2">O caminho do Brasil até o Hexa</h3>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #a0a0a0">Status da jornada na Copa 2026</p>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; overflow-x: auto; padding: 12px 0; scrollbar-width: thin">
    `;

    const stages = ['Grupos', 'Oitavas', 'Quartas', 'Semifinal', 'Final'];

    stages.forEach((stage, idx) => {
      const pathItem = this.brazilPath.find(p => p.stage === stage);
      const status = pathItem ? (pathItem.won ? '✓' : (pathItem.match?.hs === null ? '○' : '✗')) : '○';
      const statusColor = pathItem?.won ? '#88CE11' : (pathItem?.match?.hs === null ? '#a0a0a0' : '#e0563b');
      const bgColor = pathItem?.won ? 'rgba(136, 206, 17, 0.15)' : 'rgba(13, 13, 13, 0.5)';

      html += `
        <div style="
          flex: 0 0 auto;
          background: ${bgColor};
          border: 1px solid ${statusColor}33;
          border-radius: 4px;
          padding: 12px 14px;
          text-align: center;
          min-width: 100px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='${statusColor}'; this.style.background='${statusColor}15'" onmouseout="this.style.borderColor='${statusColor}33'; this.style.background='${bgColor}'">
          <div style="font-size: 20px; margin-bottom: 6px">${status}</div>
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: ${statusColor}; margin-bottom: 4px">${stage}</div>
          ${pathItem && pathItem.opponent ? `
            <div style="font-size: 10px; color: #a0a0a0">${NAMES[pathItem.opponent] || pathItem.opponent}</div>
            ${pathItem.score ? `<div style="font-size: 12px; font-weight: 700; color: #f2f2f2; margin-top: 4px">${pathItem.score}</div>` : ''}
          ` : '<div style="font-size: 10px; color: #6a6a6a">A definir</div>'}
        </div>
      `;

      // Arrow entre stages (exceto no último)
      if (idx < stages.length - 1) {
        html += `<div style="font-size: 16px; color: #a0a0a0; padding: 0 8px">→</div>`;
      }
    });

    html += `</div>`;

    // Summary
    if (this.brazilPath.length > 0) {
      const currentStage = this.brazilPath[this.brazilPath.length - 1];
      let summary = '';
      if (currentStage.stage === 'Final' && currentStage.won) {
        summary = '🏆 BRASIL É CAMPEÃO! Conquistou o HEXA!';
      } else if (currentStage.stage === 'Final' && !currentStage.won) {
        summary = 'Final disputada - Resultado pendente';
      } else if (currentStage.won === false) {
        summary = `Brasil foi eliminado nas ${currentStage.stage}`;
      } else if (currentStage.won === true) {
        const nextIdx = stages.indexOf(currentStage.stage) + 1;
        summary = nextIdx < stages.length ? `Próxima fase: ${stages[nextIdx]}` : 'Na final!';
      } else {
        summary = `Aguardando ${currentStage.stage}...`;
      }

      html += `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(136, 206, 17, 0.2); font-size: 12px; color: #f2f2f2; font-weight: 500">
          <span style="color: #88CE11">→</span> ${summary}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
    return container;
  }

  /**
   * Configurar interatividade do bracket (hover, click)
   */
  setupInteractivity() {
    // Isso será chamado após o bracket ser renderizado
    // Adiciona event listeners aos nós do SVG
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        this.attachNodeInteractivity();
      }, 600);
    });
  }

  /**
   * Anexar listeners aos nós do bracket SVG
   */
  attachNodeInteractivity() {
    const svg = document.querySelector('#bracketCircularSlot svg');
    if (!svg) return;

    const nodes = svg.querySelectorAll('.nd, .nd.br, .nd.tbd, .nd.brtbd');

    nodes.forEach(node => {
      node.style.cursor = 'pointer';
      node.style.transition = 'all 0.2s ease';

      node.addEventListener('mouseenter', (e) => {
        node.style.filter = 'drop-shadow(0 0 8px rgba(136, 206, 17, 0.5))';
      });

      node.addEventListener('mouseleave', (e) => {
        node.style.filter = 'none';
      });

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const circle = node.querySelector('circle');
        const text = node.querySelector('text');
        const title = node.querySelector('title');

        if (circle && text && title) {
          const teamCode = text.textContent;
          const teamName = title.textContent;

          if (teamCode !== '?') {
            this.showTeamDetail(teamCode, teamName);
          }
        }
      });
    });
  }

  /**
   * Mostrar detalhes do time (modal)
   */
  showTeamDetail(teamCode, teamName) {
    const modal = document.createElement('div');
    modal.id = 'team-detail-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.88);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      font-family: 'Archivo', sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #161616;
      border: 1px solid #88CE11;
      border-radius: 6px;
      padding: 28px;
      max-width: 400px;
      color: #f2f2f2;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    `;

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
        <h2 style="margin: 0; font-size: 20px; font-weight: 700">${teamName}</h2>
        <button onclick="document.getElementById('team-detail-modal').remove()" style="background: none; border: none; color: #88CE11; font-size: 24px; cursor: pointer; padding: 0">&times;</button>
      </div>

      <div style="background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 4px; padding: 16px; margin-bottom: 16px">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(136, 206, 17, 0.1); border: 2px solid #88CE11; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px">${teamCode}</div>
          <div>
            <div style="font-weight: 700; font-size: 14px">${teamName}</div>
            <div style="font-size: 11px; color: #a0a0a0; font-family: 'JetBrains Mono'">${teamCode}</div>
          </div>
        </div>
    `;

    // Se é Brasil, mostra o caminho
    if (teamCode === 'BRA') {
      html += `
        <div style="padding-top: 12px; border-top: 1px solid #2a2a2a; margin-top: 12px">
          <div style="font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #88CE11; font-weight: 700; margin-bottom: 8px">Caminho até o Hexa</div>
      `;

      this.brazilPath.forEach((p, i) => {
        const icon = p.won ? '✓' : (p.match?.hs === null ? '○' : '✗');
        html += `
          <div style="font-size: 11px; padding: 6px 0; display: flex; align-items: center; gap: 8px">
            <span style="color: ${p.won ? '#88CE11' : (p.match?.hs === null ? '#a0a0a0' : '#e0563b')}; font-weight: 700">${icon}</span>
            <span>${p.stage}</span>
            ${p.opponent ? `<span style="color: #a0a0a0">vs ${NAMES[p.opponent] || p.opponent}</span>` : ''}
            ${p.score ? `<span style="color: #88CE11; font-weight: 700; margin-left: auto">${p.score}</span>` : ''}
          </div>
        `;
      });

      html += '</div>';
    }

    html += `
      </div>
      <div style="text-align: center; font-size: 11px; color: #a0a0a0; margin-top: 16px">
        Clique fora para fechar
      </div>
    `;

    content.innerHTML = html;
    modal.appendChild(content);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Atualizar path quando novos dados chegam
   */
  updateWithNewData(bracketData) {
    // Remover card antigo se existir
    const oldCard = document.getElementById('brazil-path-container');
    if (oldCard) oldCard.remove();

    // Renderizar novo
    const pathCard = this.renderBrazilPathCard(bracketData);
    const heroSlot = document.getElementById('heroSlot');
    if (heroSlot) {
      heroSlot.parentElement.insertBefore(pathCard, heroSlot);
    } else {
      const bracketSlot = document.getElementById('bracketCircularSlot');
      if (bracketSlot) {
        bracketSlot.parentElement.insertBefore(pathCard, bracketSlot);
      }
    }

    // Re-attach interactivity
    this.attachNodeInteractivity();
  }
}

// Instância global
let brazilPathVisualizer = null;

/**
 * Inicializar Brazil Path Visualizer
 * Chamado após bracket circular ser renderizado
 */
window.initBrazilPathVisualizer = function(selectedTeam = 'BRA') {
  if (!circularBracket || !BRACKET_DATA) return;

  brazilPathVisualizer = new BrazilPathVisualizer(circularBracket);
  brazilPathVisualizer.selectedTeam = selectedTeam;

  // Renderizar path card ACIMA do bracket
  const pathCard = brazilPathVisualizer.renderBrazilPathCard(BRACKET_DATA);

  // Inserir acima do bracket circular
  const bracketSlot = document.getElementById('bracketCircularSlot');
  if (bracketSlot) {
    const section = bracketSlot.closest('section');
    if (section) {
      const wrap = section.querySelector('.wrap');
      if (wrap) {
        // Inserir após o label "Chaveamento..."
        const label = wrap.querySelector('.slabel');
        if (label) {
          label.insertAdjacentElement('afterend', pathCard);
        }
      }
    }
  }

  // Re-attach interactivity
  brazilPathVisualizer.attachNodeInteractivity();

  // Hook para mudança de seleção de time
  window.onTeamSelectedForHighlight = (teamCode) => {
    brazilPathVisualizer.selectedTeam = teamCode;
    brazilPathVisualizer.updateWithNewData(BRACKET_DATA);
  };

  console.log('✅ Brazil Path Visualizer initialized');
};

/**
 * Hook para atualizar quando dados ao vivo chegam
 */
window.updateBrazilPath = function(liveMatches) {
  if (brazilPathVisualizer && BRACKET_DATA) {
    brazilPathVisualizer.updateWithNewData(BRACKET_DATA);
  }
};

// Inicializar quando o documento está pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.initBrazilPathVisualizer(), 1000);
  });
} else {
  setTimeout(() => window.initBrazilPathVisualizer(), 1000);
}
