/**
 * Instagram Post Generator Modal
 * UI para criar e compartilhar posts no Instagram
 */

const INSTAGRAM_MODAL_HTML = `
<div id="instagramModal" class="modal-overlay" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <h2>📸 Criar Post Instagram</h2>
      <button class="modal-close" onclick="closeInstagramModal()" aria-label="Fechar">✕</button>
    </div>

    <div class="modal-body">
      <!-- Loading state -->
      <div id="modalLoading" class="loading-spinner" style="display: none;">
        <div class="spinner"></div>
        <p>Gerando seu post...</p>
      </div>

      <!-- Content state -->
      <div id="modalContent" style="display: none;">
        <!-- Preview section -->
        <div class="post-preview">
          <div class="preview-image">
            <img id="previewImg" src="" alt="Placar" />
          </div>

          <div class="preview-copy">
            <label>Copy (editável):</label>
            <textarea id="postCopy" readonly style="width: 100%; height: 140px; padding: 12px; border: 1px solid var(--line); border-radius: 4px; background: var(--panel); color: var(--ink); font-family: var(--mono); font-size: 12px; resize: vertical;"></textarea>
            <div class="copy-stats">
              <span id="charCount">0</span> / 2.200 caracteres
              <span id="canPostStatus"></span>
            </div>
          </div>
        </div>

        <!-- Hashtags section -->
        <div class="hashtags-section">
          <label>Hashtags:</label>
          <div id="hashtagsList" class="hashtags-list"></div>
        </div>

        <!-- Action buttons -->
        <div class="modal-actions">
          <button id="btnCopyToClipboard" class="btn btn-primary" onclick="copyPostToClipboard()">
            📋 Copiar
          </button>
          <button id="btnOpenInstagram" class="btn btn-success" onclick="openInstagramComposer()">
            📲 Abrir Instagram
          </button>
          <a id="instagramLink" href="" target="_blank" style="display: none;"></a>
        </div>
      </div>

      <!-- Error state -->
      <div id="modalError" class="error-message" style="display: none;">
        <p id="errorText"></p>
        <button class="btn" onclick="closeInstagramModal()">Fechar</button>
      </div>
    </div>
  </div>
</div>
`;

// Estilos para o modal
const INSTAGRAM_MODAL_STYLES = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  background: var(--panel);
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--ink);
}

.modal-close {
  background: none;
  border: none;
  color: var(--ink-dim);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--ink);
}

.modal-body {
  padding: 24px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(136, 206, 17, 0.2);
  border-top-color: #88CE11;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  margin-top: 16px;
  color: var(--ink-dim);
}

.post-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.preview-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--void-2);
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  min-height: 200px;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.preview-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-copy label {
  font-weight: 600;
  font-size: 12px;
  color: var(--lime);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-copy textarea {
  resize: vertical;
  font-size: 12px !important;
}

.copy-stats {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-faint);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#charCount {
  color: var(--lime);
  font-weight: bold;
}

#canPostStatus {
  padding: 3px 8px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: bold;
}

#canPostStatus.ok {
  background: rgba(136, 206, 17, 0.2);
  color: #88CE11;
}

#canPostStatus.warning {
  background: rgba(224, 168, 59, 0.2);
  color: #e0a83b;
}

.hashtags-section {
  margin-bottom: 24px;
}

.hashtags-section label {
  font-weight: 600;
  font-size: 12px;
  color: var(--lime);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 10px;
}

.hashtags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag-badge {
  background: rgba(136, 206, 17, 0.15);
  border: 1px solid rgba(136, 206, 17, 0.35);
  color: var(--lime);
  font-family: var(--mono);
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 3px;
  display: inline-block;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  border: none;
  border-radius: 3px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn:hover {
  filter: brightness(1.08);
}

.btn-primary {
  background: rgba(136, 206, 17, 0.2);
  color: var(--lime);
  border: 1px solid rgba(136, 206, 17, 0.35);
}

.btn-success {
  background: var(--lime);
  color: var(--void);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(224, 86, 59, 0.15);
  border: 1px solid rgba(224, 86, 59, 0.35);
  color: var(--red);
  padding: 16px;
  border-radius: 4px;
  text-align: center;
}

.error-message p {
  margin: 0 0 16px;
}

@media (max-width: 640px) {
  .post-preview {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    max-height: 85vh;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
`;

/**
 * Inicializar modal (inserir no DOM)
 */
export function initInstagramModal() {
  // Criar modal container se não existir
  if (!document.getElementById('instagramModal')) {
    const container = document.createElement('div');
    container.innerHTML = INSTAGRAM_MODAL_HTML;
    document.body.appendChild(container);

    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = INSTAGRAM_MODAL_STYLES;
    document.head.appendChild(style);
  }
}

/**
 * Abrir modal de criação de post
 * @param {Object} match - {home, away, hs, as, minute, addedTime}
 */
export async function openInstagramModal(match) {
  const modal = document.getElementById('instagramModal');
  const loading = document.getElementById('modalLoading');
  const content = document.getElementById('modalContent');
  const error = document.getElementById('modalError');

  // Mostrar modal com loading
  modal.style.display = 'flex';
  loading.style.display = 'flex';
  content.style.display = 'none';
  error.style.display = 'none';

  try {
    // Chamar backend para gerar post
    const response = await fetch('/api/generate-instagram-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeTeam: match.home,
        awayTeam: match.away,
        homeScore: match.hs,
        awayScore: match.as,
        minute: match.minute,
        addedTime: match.addedTime
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const post = await response.json();

    // Preencher modal com dados
    populateModalContent(post);

    // Mostrar conteúdo
    loading.style.display = 'none';
    content.style.display = 'block';
  } catch (err) {
    console.error('Erro ao gerar post:', err);
    loading.style.display = 'none';
    error.style.display = 'block';
    document.getElementById('errorText').textContent = `Erro: ${err.message}`;
  }
}

/**
 * Preencher modal com dados do post
 */
function populateModalContent(post) {
  // Copy
  document.getElementById('postCopy').value = post.copy;

  // Imagem (SVG como data URL)
  const svgBlob = new Blob([post.imageUrl], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  document.getElementById('previewImg').src = svgUrl;

  // Hashtags
  const hashtagsList = document.getElementById('hashtagsList');
  hashtagsList.innerHTML = post.hashtags
    .map(tag => `<span class="hashtag-badge">#${tag}</span>`)
    .join('');

  // Contador de caracteres
  updateCharCount(post.copy);

  // Instagram link
  const instagramLink = document.getElementById('instagramLink');
  instagramLink.href = post.instagramUrl;

  // Guardar post atual para ações
  window.currentInstagramPost = post;
}

/**
 * Atualizar contador de caracteres
 */
function updateCharCount(text) {
  const count = text.length;
  document.getElementById('charCount').textContent = count;

  const status = document.getElementById('canPostStatus');
  if (count <= 2200) {
    status.textContent = '✓ Ok para postar';
    status.className = 'ok';
  } else {
    status.textContent = '⚠ Excedeu limite';
    status.className = 'warning';
  }
}

/**
 * Fechar modal
 */
window.closeInstagramModal = function() {
  const modal = document.getElementById('instagramModal');
  modal.style.display = 'none';
};

/**
 * Copiar post para clipboard
 */
window.copyPostToClipboard = async function() {
  const copy = document.getElementById('postCopy').value;
  try {
    await navigator.clipboard.writeText(copy);

    // Feedback visual
    const btn = document.getElementById('btnCopyToClipboard');
    const original = btn.textContent;
    btn.textContent = '✓ Copiado!';
    setTimeout(() => {
      btn.textContent = original;
    }, 2000);
  } catch (err) {
    alert('Erro ao copiar: ' + err.message);
  }
};

/**
 * Abrir Instagram composer
 */
window.openInstagramComposer = function() {
  if (window.currentInstagramPost) {
    const url = window.currentInstagramPost.instagramUrl;
    window.open(url, '_blank');
  }
};

/**
 * Adicionar listener para fechar modal ao clicar fora
 */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('instagramModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeInstagramModal();
      }
    });
  }
});

// Auto-inicializar quando o script carregar
initInstagramModal();
