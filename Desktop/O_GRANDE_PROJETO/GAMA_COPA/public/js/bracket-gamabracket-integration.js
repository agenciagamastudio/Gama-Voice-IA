/**
 * GAMA Copa Center — GamaBracket Integration
 * Integra a implementação correta de GamaBracket com o sistema de seleção de time
 */

let gamaBracketInstance = null;

/**
 * Inicializar GamaBracket quando dados estão prontos
 */
function initGamaBracket(data, selectedTeam = 'BRA') {
  const container = document.getElementById('bracketCircularSlot');
  if (!container || !data) {
    console.warn('⚠️ GamaBracket: container ou data não disponível');
    return;
  }

  try {
    if (gamaBracketInstance) {
      gamaBracketInstance.destroy();
    }

    gamaBracketInstance = GamaBracket.mount(container, {
      data: data,
      team: selectedTeam,
      selectOnClick: true,
      onTeamClick: function(code) {
        // Quando clica em um time no bracket, atualiza a seleção global
        if (window.focusTeam) {
          window.focusTeam(code);
        }
      }
    });

    console.log(`✅ GamaBracket inicializado com ${selectedTeam}`);
  } catch (e) {
    console.error('❌ Erro ao inicializar GamaBracket:', e);
  }
}

/**
 * Atualizar GamaBracket quando time é selecionado
 */
function updateGamaBracket(data, selectedTeam) {
  if (!gamaBracketInstance) {
    console.warn('⚠️ GamaBracket não foi inicializado');
    return;
  }

  try {
    if (data) {
      gamaBracketInstance.setData(data);
    }
    gamaBracketInstance.setTeam(selectedTeam);
    console.log(`🔄 GamaBracket atualizado para: ${selectedTeam}`);
  } catch (e) {
    console.error('❌ Erro ao atualizar GamaBracket:', e);
  }
}

/**
 * Destruir GamaBracket
 */
function destroyGamaBracket() {
  if (gamaBracketInstance) {
    gamaBracketInstance.destroy();
    gamaBracketInstance = null;
  }
}

// Hook global para atualizar bracket quando dados ao vivo chegam
window.updateBracketData = function(data) {
  if (gamaBracketInstance && data) {
    gamaBracketInstance.setData(data);
    console.log('📊 GamaBracket: dados atualizados');
  }
};

// Hook global para atualizar team quando muda
window.updateBracketTeam = function(teamCode) {
  if (gamaBracketInstance) {
    gamaBracketInstance.setTeam(teamCode);
    console.log(`🎯 GamaBracket: time atualizado para ${teamCode}`);
  }
};
