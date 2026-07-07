/**
 * GAMA Copa Center — GamaBracket Integration
 * Integra a implementação correta de GamaBracket com o sistema de seleção de time
 */

let gamaBracketInstance = null;

/**
 * Inicializar GamaBracket quando dados estão prontos
 */
function initGamaBracket(data, selectedTeam = 'BRA') {
  console.log('🔍 initGamaBracket: apenas preparando para atualizações dinâmicas');
  // Não fazer nada — CircularBracket vai renderizar
  // Apenas preparar para quando o time mudar via updateBracketTeam()
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
  console.log(`🎯 Atualizando bracket para team: ${teamCode}`);

  // Atualizar CircularBracket (renderiza novamente com o novo team)
  if (typeof circularBracket !== 'undefined' && circularBracket && typeof BRACKET_DATA !== 'undefined') {
    circularBracket.render(BRACKET_DATA, teamCode);
    console.log(`✅ Bracket atualizado visualmente para ${teamCode}`);
  }
};
