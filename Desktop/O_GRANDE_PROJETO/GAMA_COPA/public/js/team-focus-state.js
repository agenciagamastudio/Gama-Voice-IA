/**
 * GAMA Copa Center — Team Focus State Manager
 * Quando um time é selecionado, TODA a plataforma muda seu foco
 * Hero, cards, destaque, bracket — tudo para aquele time
 */

class TeamFocusState {
  constructor() {
    this.selectedTeam = this.loadSelection() || 'BRA'; // Default Brasil
    this.listeners = [];
    this.init();
  }

  /**
   * Carregar seleção do localStorage
   */
  loadSelection() {
    try {
      const stored = localStorage.getItem('gamaCopaTeamSelection');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.code || 'BRA';
      }
    } catch (e) {
      console.error('Erro ao carregar seleção:', e);
    }
    return 'BRA';
  }

  /**
   * Salvar seleção no localStorage
   */
  saveSelection(teamCode) {
    try {
      localStorage.setItem('gamaCopaTeamSelection', JSON.stringify({ code: teamCode }));
    } catch (e) {
      console.error('Erro ao salvar seleção:', e);
    }
  }

  /**
   * Registrar listener para mudanças
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notificar todos os listeners
   */
  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.selectedTeam);
      } catch (e) {
        console.error('Erro em listener:', e);
      }
    });
  }

  /**
   * Selecionar novo time e atualizar toda a plataforma
   */
  selectTeam(teamCode) {
    if (!teamCode || teamCode === this.selectedTeam) return;

    this.selectedTeam = teamCode;
    this.saveSelection(teamCode);

    console.log(`🎯 Team Focus changed to: ${NAMES[teamCode] || teamCode}`);

    // Atualizar TUDO
    this.notifyListeners();
    this.updateHero();
    this.updateCards();
    this.updateBracket();
    this.updatePathVisualizer();
  }

  /**
   * Filtrar match para o time selecionado
   */
  matchesForTeam() {
    return MATCHES.filter(m => m.home === this.selectedTeam || m.away === this.selectedTeam);
  }

  /**
   * Encontrar o match destaque para o time
   */
  getHeroMatch() {
    // Prioridade: match do time que está marcado como featured, ou o primeiro match do time
    let heroMatch = MATCHES.find(m => (m.home === this.selectedTeam || m.away === this.selectedTeam) && m.feat);
    if (!heroMatch) {
      heroMatch = MATCHES.find(m => m.home === this.selectedTeam || m.away === this.selectedTeam);
    }
    return heroMatch;
  }

  /**
   * Update Hero section
   */
  updateHero() {
    const match = this.getHeroMatch();
    if (!match) {
      document.getElementById('heroSlot').innerHTML = `
        <div class="hero" style="padding: 40px 28px; text-align: center; opacity: 0.6">
          <div style="font-size: 14px; color: var(--ink-dim)">
            ${NAMES[this.selectedTeam] || this.selectedTeam} não tem partidas nesta fase
          </div>
        </div>
      `;
      return;
    }

    // Reutilizar a função renderHero mas com o match deste time
    const originalFeat = MATCHES.find(m => m.feat);
    MATCHES.forEach(m => m.feat = false);
    match.feat = true;

    renderHero();

    // Restaurar estado original
    MATCHES.forEach(m => m.feat = false);
    if (originalFeat) originalFeat.feat = true;
  }

  /**
   * Update Cards section (filtrar para este time)
   */
  updateCards() {
    const teamMatches = this.matchesForTeam();

    if (teamMatches.length === 0) {
      document.getElementById('todaySlot').innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--ink-dim); background: var(--panel); border-radius: 4px">
          ${NAMES[this.selectedTeam] || this.selectedTeam} não tem partidas programadas
        </div>
      `;
      return;
    }

    document.getElementById('todaySlot').innerHTML = teamMatches.map(matchCard).join('');
  }

  /**
   * Update All section (mostrar todas, mas com o time selecionado em destaque)
   */
  updateAllCards() {
    document.getElementById('allSlot').innerHTML = MATCHES.map(m => {
      const isBr = m.home === this.selectedTeam || m.away === this.selectedTeam;
      // Reutilizar matchCard mas forçar destaque deste time
      const html = matchCard(m);
      if (isBr) {
        return html.replace(/class="mcard/, 'class="mcard br');
      }
      return html;
    }).join('');
  }

  /**
   * Update Bracket (mostrar caminho do time selecionado)
   */
  updateBracket() {
    if (brazilPathVisualizer) {
      brazilPathVisualizer.selectedTeam = this.selectedTeam;
      brazilPathVisualizer.updateWithNewData(BRACKET_DATA);
    }
  }

  /**
   * Update Path Visualizer label
   */
  updatePathVisualizer() {
    const label = document.querySelector('.intro h1');
    if (label) {
      const teamName = NAMES[this.selectedTeam] || this.selectedTeam;
      label.innerHTML = `O caminho de <em>${teamName}</em> até o hexa`;
    }

    const bracketLabel = document.querySelector('section:has(#bracketCircularSlot) .slabel');
    if (bracketLabel) {
      const teamName = NAMES[this.selectedTeam] || this.selectedTeam;
      bracketLabel.innerHTML = `<b>${teamName}</b> · visualização circular interativa`;
    }
  }

  /**
   * Inicializar (chamado ao carregar)
   */
  init() {
    // Aplicar seleção carregada do localStorage
    this.updateHero();
    this.updateCards();
    this.updateAllCards();
    this.updatePathVisualizer();
  }

  /**
   * Obter time atual
   */
  getSelectedTeam() {
    return this.selectedTeam;
  }

  /**
   * Obter nome do time
   */
  getSelectedTeamName() {
    return NAMES[this.selectedTeam] || this.selectedTeam;
  }
}

// Instância global
let teamFocusState = null;

/**
 * Inicializar Team Focus State
 */
function initTeamFocusState() {
  if (teamFocusState) return;

  teamFocusState = new TeamFocusState();

  // Hook para quando team selection modal fecha
  window.onTeamSelectedForTeamFocus = (teamCode) => {
    if (teamFocusState) {
      teamFocusState.selectTeam(teamCode);
    }
  };

  console.log('✅ Team Focus State initialized');
}

/**
 * Hook global para mudança de time
 */
window.focusTeam = function(teamCode) {
  if (teamFocusState) {
    teamFocusState.selectTeam(teamCode);
  }
};

/**
 * Inicializar quando página carrega
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initTeamFocusState, 100);
});

/**
 * Listener para evento de seleção de time
 */
window.addEventListener('teamSelected', (event) => {
  const team = event.detail?.team;
  if (team && teamFocusState) {
    teamFocusState.selectTeam(team.code);
    console.log(`📺 Platform focus changed to: ${team.name}`);
  }
});
