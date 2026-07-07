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
  console.log('🔍 initGamaBracket:', { container: !!container, data: !!data, selectedTeam });

  if (!container) {
    console.error('❌ Container #bracketCircularSlot não encontrado!');
    return;
  }

  if (!data) {
    console.error('❌ Dados do bracket não disponíveis!');
    return;
  }

  try {
    // NÃO limpar container — deixar CircularBracket desenhar e GamaBracket atualizar dinamicamente

    if (gamaBracketInstance) {
      console.log('Destruindo GamaBracket anterior...');
      gamaBracketInstance.destroy();
    }

    if (typeof GamaBracket === 'undefined') {
      console.error('❌ GamaBracket não foi carregado! Verifique se docs/gama-copa-bracket.js foi carregado.');
      return;
    }

    gamaBracketInstance = GamaBracket.mount(container, {
      data: data,
      team: selectedTeam,
      selectOnClick: true,
      onTeamClick: function(code) {
        console.log('🎯 Time clicado no bracket:', code);
        if (window.focusTeam) {
          window.focusTeam(code);
        }
      }
    });

    console.log(`✅ GamaBracket montado com sucesso para ${selectedTeam}`);
  } catch (e) {
    console.error('❌ Erro ao inicializar GamaBracket:', e);
    console.error('Stack:', e.stack);
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
