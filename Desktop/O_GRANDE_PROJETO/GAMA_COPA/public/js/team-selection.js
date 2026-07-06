/**
 * Team Selection Modal for GAMA Copa Center 2026
 * Allows users to select their favorite team and persist choice
 * Feature: Oitavas de final - 16 times
 */

class TeamSelectionModal {
  constructor() {
    // Copa 2026 Oitavas de Final - 16 times principais (do contexto atual)
    this.teams = [
      // Favoritos Brasil
      { code: 'BRA', name: 'Brasil', flag: '🇧🇷', group: 'Oitavas' },
      { code: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'Oitavas' },
      { code: 'FRA', name: 'França', flag: '🇫🇷', group: 'Oitavas' },
      { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'Oitavas' },

      // Europeus
      { code: 'ESP', name: 'Espanha', flag: '🇪🇸', group: 'Oitavas' },
      { code: 'ALE', name: 'Alemanha', flag: '🇩🇪', group: 'Oitavas' },
      { code: 'BEL', name: 'Bélgica', flag: '🇧🇪', group: 'Oitavas' },
      { code: 'POR', name: 'Portugal', flag: '🇵🇹', group: 'Oitavas' },

      // Americanos
      { code: 'MEX', name: 'México', flag: '🇲🇽', group: 'Oitavas' },
      { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', group: 'Oitavas' },
      { code: 'CAN', name: 'Canadá', flag: '🇨🇦', group: 'Oitavas' },
      { code: 'COL', name: 'Colômbia', flag: '🇨🇴', group: 'Oitavas' },

      // Africanos e Asiáticos
      { code: 'MAR', name: 'Marrocos', flag: '🇲🇦', group: 'Oitavas' },
      { code: 'NOR', name: 'Noruega', flag: '🇳🇴', group: 'Oitavas' },
      { code: 'SUI', name: 'Suíça', flag: '🇨🇭', group: 'Oitavas' },
      { code: 'JAP', name: 'Japão', flag: '🇯🇵', group: 'Oitavas' }
    ];

    this.selectedTeam = this.loadSelection();
    this.filteredTeams = [...this.teams];
  }

  /**
   * Load selected team from localStorage
   */
  loadSelection() {
    const stored = localStorage.getItem('gamaCopaTeamSelection');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error loading team selection:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Save selection to localStorage
   */
  saveSelection(team) {
    localStorage.setItem('gamaCopaTeamSelection', JSON.stringify(team));
    this.selectedTeam = team;
  }

  /**
   * Clear selection from localStorage
   */
  clearSelection() {
    localStorage.removeItem('gamaCopaTeamSelection');
    this.selectedTeam = null;
  }

  /**
   * Create and inject modal HTML into page
   */
  render() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'teamSelectionModal';
    modalContainer.className = 'team-selection-modal';

    // Build all teams list (single group for oitavas)
    let teamsHtml = `
      <div class="team-group">
        <div class="group-label">16 Times · Oitavas de Final</div>
        <div class="team-list">
          ${this.teams.map(team => `
            <button
              class="team-item ${this.selectedTeam && this.selectedTeam.code === team.code ? 'selected' : ''}"
              data-code="${team.code}"
              title="${team.name}"
              onclick="teamSelectionModal.selectTeam('${team.code}'); event.stopPropagation();"
            >
              <span class="team-flag">${team.flag}</span>
              <span class="team-name">${team.name}</span>
              <span class="team-code">${team.code}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    modalContainer.innerHTML = `
      <div class="team-selection-overlay" onclick="teamSelectionModal.close()"></div>
      <div class="team-selection-content">
        <div class="team-selection-header">
          <h2>🏆 Escolha seu time favorito</h2>
          <p>Acompanhe o desempenho em tempo real ao longo da Copa 2026</p>
          <div class="team-selection-search">
            <input
              type="text"
              id="teamSearchInput"
              class="team-search-input"
              placeholder="Buscar time (ex: Brasil, Espanha)..."
              onkeyup="teamSelectionModal.filterTeams(this.value)"
              autofocus
            />
          </div>
        </div>

        <div class="team-selection-list" id="teamList">
          ${teamsHtml}
        </div>

        <div class="team-selection-footer">
          <button
            class="btn-continue-without"
            onclick="teamSelectionModal.continueWithoutSelection(); event.stopPropagation();"
          >
            Continuar sem escolher
          </button>
          ${this.selectedTeam ? `
            <button
              class="btn-clear-selection"
              onclick="teamSelectionModal.clearAndClose(); event.stopPropagation();"
            >
              ✕ Limpar
            </button>
          ` : ''}
          <button
            class="btn-close"
            onclick="teamSelectionModal.close(); event.stopPropagation();"
          >
            ✓ Fechar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalContainer);
    this.modal = modalContainer;

    // Focus search input
    setTimeout(() => {
      const input = document.getElementById('teamSearchInput');
      if (input) input.focus();
    }, 100);
  }

  /**
   * Group teams by group
   */
  groupTeamsByGroup() {
    const grouped = {};
    this.teams.forEach(team => {
      if (!grouped[team.group]) {
        grouped[team.group] = [];
      }
      grouped[team.group].push(team);
    });
    return grouped;
  }

  /**
   * Filter teams by search input
   */
  filterTeams(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    const teamList = document.getElementById('teamList');

    if (!searchTerm) {
      // Show all teams
      let teamsHtml = `
        <div class="team-group">
          <div class="group-label">16 Times · Oitavas de Final</div>
          <div class="team-list">
            ${this.teams.map(team => `
              <button
                class="team-item ${this.selectedTeam && this.selectedTeam.code === team.code ? 'selected' : ''}"
                data-code="${team.code}"
                title="${team.name}"
                onclick="teamSelectionModal.selectTeam('${team.code}'); event.stopPropagation();"
              >
                <span class="team-flag">${team.flag}</span>
                <span class="team-name">${team.name}</span>
                <span class="team-code">${team.code}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      teamList.innerHTML = teamsHtml;
      return;
    }

    // Filter teams by name or code
    const filtered = this.teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm) ||
      team.code.toLowerCase().includes(searchTerm)
    );

    let teamsHtml = '';
    if (filtered.length === 0) {
      teamsHtml = '<div class="no-results">Nenhum time encontrado. Tente outro nome ou código.</div>';
    } else {
      teamsHtml = `
        <div class="team-group">
          <div class="group-label">${filtered.length} Time${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}</div>
          <div class="team-list">
            ${filtered.map(team => `
              <button
                class="team-item ${this.selectedTeam && this.selectedTeam.code === team.code ? 'selected' : ''}"
                data-code="${team.code}"
                title="${team.name}"
                onclick="teamSelectionModal.selectTeam('${team.code}'); event.stopPropagation();"
              >
                <span class="team-flag">${team.flag}</span>
                <span class="team-name">${team.name}</span>
                <span class="team-code">${team.code}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    teamList.innerHTML = teamsHtml;
  }

  /**
   * Select a team with visual feedback
   */
  selectTeam(teamCode) {
    const team = this.teams.find(t => t.code === teamCode);
    if (team) {
      // Save selection
      this.saveSelection(team);

      // Update visual display
      this.updateSelection();

      // Show confirmation
      this.showSelectionFeedback(team);

      // Auto-close after selection
      setTimeout(() => {
        if (this.modal) {
          this.close();
        }
      }, 800);

      console.log(`Team selected: ${team.name} (${team.code}) ✓`);

      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('teamSelected', {
        detail: { team: team, timestamp: new Date() }
      }));
    }
  }

  /**
   * Show selection feedback with visual effect
   */
  showSelectionFeedback(team) {
    // Find and highlight the selected button
    const selectedBtn = document.querySelector(`[data-code="${team.code}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
      // Add a small animation effect
      selectedBtn.style.transform = 'scale(1.05)';
      setTimeout(() => {
        selectedBtn.style.transform = '';
      }, 300);
    }
  }

  /**
   * Update selection display
   */
  updateSelection() {
    // Update all team item buttons
    const teamItems = document.querySelectorAll('.team-item');
    teamItems.forEach(item => {
      const code = item.getAttribute('data-code');
      if (this.selectedTeam && this.selectedTeam.code === code) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // Update the header button with selected team
    this.updateHeaderButton();
  }

  /**
   * Update header button with selected team info
   */
  updateHeaderButton() {
    const btn = document.getElementById('btnTeamSelector');
    if (btn && this.selectedTeam) {
      btn.innerHTML = `<span>${this.selectedTeam.flag}</span> ${this.selectedTeam.code}`;
      btn.title = `Time selecionado: ${this.selectedTeam.name}`;
    }
  }

  /**
   * Continue without selection (show suggestion)
   */
  continueWithoutSelection() {
    // Default to Brasil as suggestion
    const brasilTeam = this.teams.find(t => t.code === 'BRA');
    if (brasilTeam) {
      // Show a suggestion notification
      this.showSuggestion(brasilTeam);
      setTimeout(() => this.close(), 2000);
    }
  }

  /**
   * Show suggestion notification
   */
  showSuggestion(team) {
    const suggestion = document.createElement('div');
    suggestion.className = 'team-suggestion';
    suggestion.innerHTML = `
      <span class="suggestion-icon">💡</span>
      <span class="suggestion-text">Sugestão: ${team.flag} ${team.name}</span>
    `;
    document.body.appendChild(suggestion);

    setTimeout(() => {
      suggestion.classList.add('fade-out');
      setTimeout(() => suggestion.remove(), 500);
    }, 1500);
  }

  /**
   * Clear selection and close
   */
  clearAndClose() {
    this.clearSelection();
    this.updateSelection();
    this.close();
  }

  /**
   * Open modal
   */
  open() {
    if (!this.modal) {
      this.render();
    } else {
      this.modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close modal
   */
  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      document.body.style.overflow = '';
    }
  }

  /**
   * Get selected team
   */
  getSelectedTeam() {
    return this.selectedTeam;
  }

  /**
   * Check if team is selected
   */
  isTeamSelected(teamCode) {
    return this.selectedTeam && this.selectedTeam.code === teamCode;
  }
}

// Global instance
let teamSelectionModal = null;

/**
 * Initialize team selection modal
 */
function initTeamSelectionModal() {
  if (!teamSelectionModal) {
    teamSelectionModal = new TeamSelectionModal();

    // Create trigger button for header
    const headerTopBar = document.querySelector('.top .syncbox');
    if (headerTopBar) {
      const teamButton = document.createElement('button');
      teamButton.id = 'btnTeamSelector';
      teamButton.className = 'btn-team-selector';

      // Set initial text based on stored selection
      if (teamSelectionModal.selectedTeam) {
        teamButton.innerHTML = `<span>${teamSelectionModal.selectedTeam.flag}</span> ${teamSelectionModal.selectedTeam.code}`;
        teamButton.title = `Time selecionado: ${teamSelectionModal.selectedTeam.name}`;
      } else {
        teamButton.innerHTML = '🏆 Meu time';
        teamButton.title = 'Clique para escolher seu time favorito';
      }

      teamButton.onclick = (e) => {
        e.stopPropagation();
        teamSelectionModal.open();
      };

      headerTopBar.insertBefore(teamButton, headerTopBar.firstChild);
    }

    // Log initialization
    console.log('Team Selection Modal initialized ✓');
    console.log(`Currently selected team: ${teamSelectionModal.selectedTeam ? teamSelectionModal.selectedTeam.name : 'None'}`);
  }
}

/**
 * Public API to get selected team
 */
function getSelectedTeam() {
  if (teamSelectionModal) {
    return teamSelectionModal.getSelectedTeam();
  }
  return null;
}

/**
 * Public API to open team selector
 */
function openTeamSelector() {
  if (teamSelectionModal) {
    teamSelectionModal.open();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTeamSelectionModal);
} else {
  // DOM already loaded
  setTimeout(initTeamSelectionModal, 100);
}
