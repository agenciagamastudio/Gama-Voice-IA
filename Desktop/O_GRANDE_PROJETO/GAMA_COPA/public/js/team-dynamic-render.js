/**
 * Team Dynamic Render Manager
 * Coordena renderização dinâmica baseada no time selecionado
 * Integra-se com team-selection.js
 */

class TeamDynamicRender {
  constructor() {
    // Cores dos times - mapa de código para cores
    this.teamColors = {
      'BRA': { primary: '#FFD700', secondary: '#00A651', name: 'Brasil' },
      'ARG': { primary: '#87CEEB', secondary: '#FFFFFF', name: 'Argentina' },
      'FRA': { primary: '#002395', secondary: '#ED2939', name: 'França' },
      'ENG': { primary: '#FF0000', secondary: '#FFFFFF', name: 'Inglaterra' },
      'ESP': { primary: '#FFC400', secondary: '#AA151B', name: 'Espanha' },
      'ALE': { primary: '#000000', secondary: '#FFFFFF', name: 'Alemanha' },
      'BEL': { primary: '#000000', secondary: '#ED2939', name: 'Bélgica' },
      'POR': { primary: '#00673B', secondary: '#FFC200', name: 'Portugal' },
      'MEX': { primary: '#CE1126', secondary: '#FFFFFF', name: 'México' },
      'USA': { primary: '#002868', secondary: '#FF0000', name: 'Estados Unidos' },
      'CAN': { primary: '#FF0000', secondary: '#FFFFFF', name: 'Canadá' },
      'COL': { primary: '#FFC400', secondary: '#000000', name: 'Colômbia' },
      'MAR': { primary: '#C60C30', secondary: '#00A651', name: 'Marrocos' },
      'NOR': { primary: '#BA0C2F', secondary: '#FFFFFF', name: 'Noruega' },
      'SUI': { primary: '#FF0000', secondary: '#FFFFFF', name: 'Suíça' },
      'JAP': { primary: '#BC002D', secondary: '#FFFFFF', name: 'Japão' }
    };

    this.selectedTeam = null;
    this.allMatches = [];
    this.filteredMatches = [];

    // Escuta evento de seleção de time
    window.addEventListener('teamSelected', (event) => {
      this.onTeamSelected(event.detail.team);
    });

    // Inicializa com time já selecionado (se houver)
    if (window.teamSelectionModal) {
      const saved = window.teamSelectionModal.getSelectedTeam();
      if (saved) {
        this.selectedTeam = saved;
        this.updateAllComponents();
      }
    }
  }

  /**
   * Handle when team is selected
   */
  onTeamSelected(team) {
    console.log('[TeamDynamicRender] Team selected:', team.name);
    this.selectedTeam = team;
    this.updateAllComponents();
  }

  /**
   * Set all matches (called from main render)
   */
  setAllMatches(matches) {
    this.allMatches = matches || [];
    this.updateFilteredMatches();
  }

  /**
   * Update filtered matches based on selected team
   */
  updateFilteredMatches() {
    if (!this.selectedTeam) {
      this.filteredMatches = this.allMatches;
      return;
    }

    const teamCode = this.selectedTeam.code;
    this.filteredMatches = this.allMatches.filter(match => {
      // Normalizar códigos de time
      const homeTeamCode = this.normalizeTeamCode(match.home);
      const awayTeamCode = this.normalizeTeamCode(match.away);
      return homeTeamCode === teamCode || awayTeamCode === teamCode;
    });

    console.log(`[TeamDynamicRender] Filtered ${this.filteredMatches.length} matches for ${teamCode}`);
  }

  /**
   * Normalize team codes (handle both full names and codes)
   */
  normalizeTeamCode(teamIdentifier) {
    if (!teamIdentifier) return null;

    // Se já é código de 3 letras
    if (teamIdentifier.length === 3 && teamIdentifier === teamIdentifier.toUpperCase()) {
      return teamIdentifier;
    }

    // Map de nomes completos para códigos
    const nameMap = {
      'Brasil': 'BRA',
      'Argentina': 'ARG',
      'França': 'FRA',
      'England': 'ENG',
      'England': 'ENG',
      'Espanha': 'ESP',
      'Alemanha': 'ALE',
      'Bélgica': 'BEL',
      'Portugal': 'POR',
      'México': 'MEX',
      'Estados Unidos': 'USA',
      'USA': 'USA',
      'Canadá': 'CAN',
      'Colômbia': 'COL',
      'Marrocos': 'MAR',
      'Noruega': 'NOR',
      'Suíça': 'SUI',
      'Japão': 'JAP'
    };

    return nameMap[teamIdentifier] || null;
  }

  /**
   * Get next match for selected team
   */
  getNextMatch() {
    if (!this.filteredMatches || this.filteredMatches.length === 0) {
      return null;
    }

    // Filtrar por matches futuros ou em progresso
    const now = new Date();
    const upcomingMatches = this.filteredMatches.filter(match => {
      if (!match.date) return true; // Incluir se não tem data
      const matchDate = new Date(match.date);
      return matchDate >= now;
    });

    // Retornar o primeiro match futuro
    if (upcomingMatches.length > 0) {
      return upcomingMatches[0];
    }

    // Se não houver futuro, retornar o último
    return this.filteredMatches[this.filteredMatches.length - 1];
  }

  /**
   * Get team colors for currently selected team
   */
  getTeamColors() {
    if (!this.selectedTeam) {
      return { primary: '#88CE11', secondary: '#0d0d0d', name: 'GAMA' };
    }

    return this.teamColors[this.selectedTeam.code] ||
           { primary: '#88CE11', secondary: '#0d0d0d', name: this.selectedTeam.name };
  }

  /**
   * Update all UI components
   */
  updateAllComponents() {
    this.updateHeroSection();
    this.updateMatchCardStyles();
    this.updateBracketHighlight();
    this.updateTimelineFilter();
    this.notifyInstagramGenerator();
  }

  /**
   * Update hero section with next match
   */
  updateHeroSection() {
    const nextMatch = this.getNextMatch();
    const heroSection = document.querySelector('.hero');

    if (!heroSection) return;

    if (nextMatch) {
      // Atualizar dados do hero
      const matchRow = heroSection.querySelector('.matchrow');
      if (matchRow) {
        // Times
        const teams = matchRow.querySelectorAll('.team');
        if (teams[0]) {
          teams[0].querySelector('.tn').textContent = nextMatch.home;
        }
        if (teams[1]) {
          teams[1].querySelector('.tn').textContent = nextMatch.away;
        }

        // Placar
        const score = matchRow.querySelector('.score');
        if (score) {
          const homeScore = nextMatch.hs !== undefined ? nextMatch.hs : '-';
          const awayScore = nextMatch.as !== undefined ? nextMatch.as : '-';
          score.querySelector('.x').textContent = ` ${homeScore} × ${awayScore} `;
        }
      }

      // Atualizar highlights
      if (this.selectedTeam) {
        const teamDivs = heroSection.querySelectorAll('.team');
        teamDivs.forEach((div, idx) => {
          const teamName = idx === 0 ? nextMatch.home : nextMatch.away;
          const isMyTeam = this.normalizeTeamCode(teamName) === this.selectedTeam.code;
          if (isMyTeam) {
            div.classList.add('br'); // Classe que já existe no CSS
          } else {
            div.classList.remove('br');
          }
        });
      }
    }

    // Atualizar título intro
    const introH1 = document.querySelector('.intro h1');
    if (introH1 && this.selectedTeam) {
      introH1.innerHTML = `O caminho do <em>${this.selectedTeam.name}</em> até o ${this.selectedTeam.code === 'BRA' ? 'hexa' : 'título'}`;
    }
  }

  /**
   * Update match card styles para destacar time selecionado
   */
  updateMatchCardStyles() {
    if (!this.selectedTeam) return;

    const matchCards = document.querySelectorAll('.mcard');
    matchCards.forEach(card => {
      const cardText = card.textContent;
      const teamCode = this.selectedTeam.code;

      // Verificar se o time selecionado está neste card
      const hasMyTeam = cardText.includes(teamCode);

      if (hasMyTeam) {
        card.classList.add('my-team');
        card.style.borderColor = 'var(--lime)';
        card.style.backgroundColor = 'rgba(136, 206, 17, 0.06)';
      } else {
        card.classList.remove('my-team');
        card.style.borderColor = '';
        card.style.backgroundColor = '';
      }
    });
  }

  /**
   * Update bracket to highlight selected team's path
   */
  updateBracketHighlight() {
    if (!this.selectedTeam || !window.highlightTeamPath) {
      return;
    }

    // Chamar função do bracket se existir
    try {
      window.highlightTeamPath(this.selectedTeam.code);
    } catch (e) {
      console.log('[TeamDynamicRender] Bracket highlight not available yet');
    }
  }

  /**
   * Filter timeline to show only events from selected team
   */
  updateTimelineFilter() {
    if (!this.selectedTeam) return;

    const timelineItems = document.querySelectorAll('[data-timeline-team]');
    timelineItems.forEach(item => {
      const teamCode = item.getAttribute('data-timeline-team');
      if (teamCode === this.selectedTeam.code) {
        item.style.display = '';
        item.classList.add('team-highlight');
      } else {
        item.style.display = 'none';
      }
    });
  }

  /**
   * Notify Instagram generator of team change
   */
  notifyInstagramGenerator() {
    const colors = this.getTeamColors();
    window.currentTeamColors = colors;

    // Dispatch event for Instagram modal
    window.dispatchEvent(new CustomEvent('teamColorsChanged', {
      detail: { colors: colors, team: this.selectedTeam }
    }));
  }

  /**
   * Get Instagram copy template for team
   */
  getInstagramCopyTemplate(homeTeam, awayTeam, homeScore, awayScore) {
    if (!this.selectedTeam) {
      return `${homeTeam} ${homeScore}×${awayScore} ${awayTeam}\n\n⚽ Copa 2026 · Ao Vivo\n#Copa2026`;
    }

    const myTeamCode = this.selectedTeam.code;
    const homeCode = this.normalizeTeamCode(homeTeam);
    const awayCode = this.normalizeTeamCode(awayTeam);

    let copy = '';
    if (homeCode === myTeamCode) {
      copy = `🇧🇷 ${homeTeam} ${homeScore}×${awayScore} ${awayTeam}\n\n`;
      copy += homeScore > awayScore ? '✅ VITÓRIA!\n' :
              homeScore === awayScore ? '🟡 EMPATE\n' :
              '❌ Derrota\n';
    } else if (awayCode === myTeamCode) {
      copy = `${homeTeam} ${homeScore}×${awayScore} ${awayTeam} 🇧🇷\n\n`;
      copy += awayScore > homeScore ? '✅ VITÓRIA!\n' :
              awayScore === homeScore ? '🟡 EMPATE\n' :
              '❌ Derrota\n';
    } else {
      copy = `${homeTeam} ${homeScore}×${awayScore} ${awayTeam}\n\n`;
    }

    copy += `⚽ Copa 2026 · Ao Vivo\n#Copa2026 #${myTeamCode}`;
    return copy;
  }

  /**
   * Get Instagram hashtags for team
   */
  getInstagramHashtags() {
    const baseTags = ['Copa2026', 'AoVivo', 'Football', 'Soccer'];

    if (this.selectedTeam) {
      const teamHashtag = this.selectedTeam.code;
      const teamName = this.selectedTeam.name.replace(/\s+/g, '');
      return [...baseTags, teamHashtag, teamName];
    }

    return baseTags;
  }

  /**
   * Filter matches for scoreboard display
   */
  getDisplayMatches() {
    if (!this.selectedTeam) {
      return this.allMatches;
    }
    return this.filteredMatches;
  }

  /**
   * Get stats for selected team
   */
  getTeamStats() {
    if (!this.filteredMatches || this.filteredMatches.length === 0) {
      return { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
    }

    const teamCode = this.selectedTeam.code;
    let stats = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };

    this.filteredMatches.forEach(match => {
      const homeCode = this.normalizeTeamCode(match.home);
      const awayCode = this.normalizeTeamCode(match.away);
      const hs = match.hs || 0;
      const as = match.as || 0;

      if (homeCode === teamCode) {
        stats.goalsFor += hs;
        stats.goalsAgainst += as;
        if (hs > as) stats.wins++;
        else if (hs === as) stats.draws++;
        else stats.losses++;
      } else if (awayCode === teamCode) {
        stats.goalsFor += as;
        stats.goalsAgainst += hs;
        if (as > hs) stats.wins++;
        else if (as === hs) stats.draws++;
        else stats.losses++;
      }
    });

    return stats;
  }
}

// Global instance
let teamDynamicRender = null;

/**
 * Initialize dynamic render manager
 */
function initTeamDynamicRender() {
  if (!teamDynamicRender) {
    teamDynamicRender = new TeamDynamicRender();
    console.log('[TeamDynamicRender] Initialized');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTeamDynamicRender);
} else {
  initTeamDynamicRender();
}

// Export for use
if (typeof window !== 'undefined') {
  window.TeamDynamicRender = TeamDynamicRender;
  window.teamDynamicRender = teamDynamicRender;
}
