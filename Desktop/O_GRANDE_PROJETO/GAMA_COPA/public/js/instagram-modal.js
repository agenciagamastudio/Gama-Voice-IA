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
        <!-- Image Editor Section -->
        <div class="image-editor-section">
          <div class="editor-toggle">
            <button class="editor-tab active" data-tab="preview" onclick="switchEditorTab('preview')">
              👁️ Preview
            </button>
            <button class="editor-tab" data-tab="edit" onclick="switchEditorTab('edit')">
              ✏️ Editar
            </button>
          </div>

          <!-- Preview Tab -->
          <div id="previewTab" class="editor-tab-content active">
            <div class="preview-image">
              <img id="previewImg" src="" alt="Placar" />
            </div>
          </div>

          <!-- Edit Tab -->
          <div id="editTab" class="editor-tab-content" style="display: none;">
            <div class="editor-controls">
              <!-- Colors Section -->
              <div class="control-group">
                <label class="control-label">🎨 Cores</label>
                <div class="color-controls">
                  <div class="color-input-group">
                    <label>Fundo:</label>
                    <input type="color" id="bgColor" value="#0d0d0d" onchange="updateSvgColors()">
                  </div>
                  <div class="color-input-group">
                    <label>Destaque (Lime):</label>
                    <input type="color" id="limeColor" value="#88CE11" onchange="updateSvgColors()">
                  </div>
                  <div class="color-input-group">
                    <label>Tempo:</label>
                    <input type="color" id="timeColor" value="#e0563b" onchange="updateSvgColors()">
                  </div>
                </div>
              </div>

              <!-- Size Section -->
              <div class="control-group">
                <label class="control-label">📏 Tamanho</label>
                <div class="size-controls">
                  <input type="range" id="sizeSlider" min="50" max="150" value="100" onchange="updateSvgSize()" class="slider">
                  <span id="sizeValue">100%</span>
                </div>
              </div>

              <!-- Filters Section -->
              <div class="control-group">
                <label class="control-label">✨ Filtros</label>
                <div class="filter-controls">
                  <div class="filter-control">
                    <label>Brilho:</label>
                    <input type="range" id="brightnessSlider" min="50" max="150" value="100" onchange="updateSvgFilters()" class="slider">
                    <span id="brightnessValue">100%</span>
                  </div>
                  <div class="filter-control">
                    <label>Contraste:</label>
                    <input type="range" id="contrastSlider" min="50" max="150" value="100" onchange="updateSvgFilters()" class="slider">
                    <span id="contrastValue">100%</span>
                  </div>
                  <div class="filter-control">
                    <label>Saturação:</label>
                    <input type="range" id="saturationSlider" min="0" max="200" value="100" onchange="updateSvgFilters()" class="slider">
                    <span id="saturationValue">100%</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="editor-actions">
                <button class="btn btn-secondary" onclick="downloadSvgAsPng()">
                  ⬇️ Baixar PNG
                </button>
                <button class="btn btn-secondary" onclick="openCanvaEditor()">
                  🎨 Editar no Canva
                </button>
                <button class="btn btn-secondary" onclick="resetEditorValues()">
                  🔄 Reset
                </button>
              </div>
            </div>

            <!-- Live preview in editor -->
            <div class="editor-preview">
              <label class="control-label">Preview:</label>
              <div class="preview-image-small">
                <img id="editPreviewImg" src="" alt="Preview ao vivo" />
              </div>
            </div>
          </div>
        </div>

        <!-- Preview section -->
        <div class="post-preview">
          <div class="preview-copy">
            <label>Copy (editável):</label>
            <textarea id="postCopy" style="width: 100%; height: 140px; padding: 12px; border: 1px solid var(--line); border-radius: 4px; background: var(--panel); color: var(--ink); font-family: var(--mono); font-size: 12px; resize: vertical;"></textarea>
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

/* Image Editor Styles */
.image-editor-section {
  margin-bottom: 24px;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  background: var(--void-2);
}

.editor-toggle {
  display: flex;
  border-bottom: 1px solid var(--line);
  background: rgba(136, 206, 17, 0.05);
}

.editor-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--ink-dim);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.editor-tab:hover {
  color: var(--ink);
  background: rgba(136, 206, 17, 0.1);
}

.editor-tab.active {
  color: var(--lime);
  border-bottom: 2px solid var(--lime);
  background: rgba(136, 206, 17, 0.1);
}

.editor-tab-content {
  display: none;
  padding: 16px;
}

.editor-tab-content.active {
  display: block;
}

.editor-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.control-group {
  background: var(--void);
  padding: 12px;
  border-radius: 3px;
  border: 1px solid var(--line);
}

.control-label {
  display: block;
  font-weight: 600;
  font-size: 11px;
  color: var(--lime);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.color-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input-group label {
  font-size: 11px;
  color: var(--ink-dim);
  flex: 1;
  margin: 0;
}

.color-input-group input[type="color"] {
  width: 40px;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 2px;
  cursor: pointer;
}

.size-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--line);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--lime);
  cursor: pointer;
  border: 1px solid rgba(136, 206, 17, 0.5);
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--lime);
  cursor: pointer;
  border: 1px solid rgba(136, 206, 17, 0.5);
}

.size-controls span,
.filter-control span {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--lime);
  font-weight: bold;
  min-width: 35px;
  text-align: right;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-control label {
  font-size: 11px;
  color: var(--ink-dim);
  flex: 0 0 70px;
  margin: 0;
}

.filter-control .slider {
  flex: 1;
}

.editor-actions {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.editor-actions .btn {
  width: 100%;
  justify-content: center;
  font-size: 11px;
  padding: 10px 12px;
}

.btn-secondary {
  background: rgba(136, 206, 17, 0.1);
  color: var(--lime);
  border: 1px solid rgba(136, 206, 17, 0.3);
}

.btn-secondary:hover {
  background: rgba(136, 206, 17, 0.2);
}

.editor-preview {
  border-top: 1px solid var(--line);
  padding-top: 12px;
  margin-top: 12px;
}

.preview-image-small {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--void);
  border: 1px solid var(--line);
  border-radius: 3px;
  padding: 8px;
  min-height: 150px;
  overflow: hidden;
}

.preview-image-small img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 640px) {
  .editor-controls {
    grid-template-columns: 1fr;
  }

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
function initInstagramModal() {
  // Criar modal container se não existir
  if (!document.getElementById('instagramModal')) {
    const container = document.createElement('div');
    container.innerHTML = INSTAGRAM_MODAL_HTML;
    document.body.appendChild(container);

    // Adicionar estilos
    const style = document.createElement('style');
    style.textContent = INSTAGRAM_MODAL_STYLES;
    document.head.appendChild(style);

    // Event listener para fechar ao clicar fora
    const modal = document.getElementById('instagramModal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeInstagramModal();
      }
    });
  }
}

/**
 * Abrir modal de criação de post
 * @param {Object} match - {home, away, hs, as, minute, addedTime}
 */
async function openInstagramModal(match) {
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

  // Guardar SVG original no estado do editor
  editorState.originalSvg = post.imageUrl;
  editorState.modifiedSvg = post.imageUrl;

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

  // Listener para copy editável
  document.getElementById('postCopy').addEventListener('input', (e) => {
    updateCharCount(e.target.value);
  });
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
function closeInstagramModal() {
  const modal = document.getElementById('instagramModal');
  modal.style.display = 'none';
}

/**
 * Copiar post para clipboard
 */
async function copyPostToClipboard() {
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
}

/**
 * Abrir Instagram composer
 */
function openInstagramComposer() {
  if (window.currentInstagramPost) {
    const url = window.currentInstagramPost.instagramUrl;
    window.open(url, '_blank');
  }
}

/**
 * ========================================
 * EDITOR DE IMAGEM SVG - FUNÇÕES
 * ========================================
 */

// Estado do editor
let editorState = {
  originalSvg: '',
  bgColor: '#0d0d0d',
  limeColor: '#88CE11',
  timeColor: '#e0563b',
  size: 100,
  brightness: 100,
  contrast: 100,
  saturation: 100
};

/**
 * Trocar abas do editor (Preview/Edit)
 */
function switchEditorTab(tab) {
  // Remover active de todas as abas e conteúdos
  document.querySelectorAll('.editor-tab').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.editor-tab-content').forEach(el => el.classList.remove('active'));

  // Adicionar active ao clicado
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`${tab}Tab`).classList.add('active');

  // Se for edit, copiar preview para edit preview
  if (tab === 'edit') {
    const previewImg = document.getElementById('previewImg');
    const editPreviewImg = document.getElementById('editPreviewImg');
    if (previewImg.src) {
      editPreviewImg.src = previewImg.src;
    }
  }
}

/**
 * Atualizar cores do SVG
 */
function updateSvgColors() {
  const bgColor = document.getElementById('bgColor').value;
  const limeColor = document.getElementById('limeColor').value;
  const timeColor = document.getElementById('timeColor').value;

  editorState.bgColor = bgColor;
  editorState.limeColor = limeColor;
  editorState.timeColor = timeColor;

  // Atualizar preview com cores modificadas
  applyEditorChanges();
}

/**
 * Atualizar tamanho do SVG
 */
function updateSvgSize() {
  const size = parseInt(document.getElementById('sizeSlider').value);
  document.getElementById('sizeValue').textContent = size + '%';
  editorState.size = size;
  applyEditorChanges();
}

/**
 * Aplicar filtros (brilho, contraste, saturação)
 */
function updateSvgFilters() {
  const brightness = parseInt(document.getElementById('brightnessSlider').value);
  const contrast = parseInt(document.getElementById('contrastSlider').value);
  const saturation = parseInt(document.getElementById('saturationSlider').value);

  document.getElementById('brightnessValue').textContent = brightness + '%';
  document.getElementById('contrastValue').textContent = contrast + '%';
  document.getElementById('saturationValue').textContent = saturation + '%';

  editorState.brightness = brightness;
  editorState.contrast = contrast;
  editorState.saturation = saturation;

  applyEditorChanges();
}

/**
 * Aplicar todas as mudanças do editor ao SVG
 */
function applyEditorChanges() {
  if (!editorState.originalSvg) return;

  let modifiedSvg = editorState.originalSvg;

  // Substituir cores no SVG
  modifiedSvg = modifiedSvg.replace(/#0d0d0d|#1a1a1a/g, editorState.bgColor);
  modifiedSvg = modifiedSvg.replace(/#88CE11|#6fa30f/g, editorState.limeColor);
  modifiedSvg = modifiedSvg.replace(/#e0563b/g, editorState.timeColor);

  // Criar blob e URL do SVG modificado
  const svgBlob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);

  // Atualizar imagens com SVG modificado
  const previewImg = document.getElementById('previewImg');
  const editPreviewImg = document.getElementById('editPreviewImg');

  previewImg.src = svgUrl;
  editPreviewImg.src = svgUrl;

  // Aplicar filtros CSS à imagem preview
  const filterValue = `brightness(${editorState.brightness}%) contrast(${editorState.contrast}%) saturate(${editorState.saturation}%) scale(${editorState.size / 100})`;
  previewImg.style.filter = filterValue;
  editPreviewImg.style.filter = filterValue;

  // Guardar SVG modificado para download
  editorState.modifiedSvg = modifiedSvg;
}

/**
 * Baixar SVG como PNG
 */
async function downloadSvgAsPng() {
  try {
    const svgString = editorState.modifiedSvg || editorState.originalSvg;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1200;
    canvas.height = 600;

    // Converter SVG para image
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Aplicar filtros ao canvas
      ctx.filter = `brightness(${editorState.brightness}%) contrast(${editorState.contrast}%) saturate(${editorState.saturation}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Download PNG
      canvas.toBlob((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'placar-copa-2026.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      alert('Erro ao converter SVG para PNG');
      URL.revokeObjectURL(url);
    };

    img.src = url;
  } catch (err) {
    alert('Erro ao baixar imagem: ' + err.message);
  }
}

/**
 * Abrir Canva editor
 */
function openCanvaEditor() {
  // Link para criar design no Canva (será atualizado com integração real later)
  const canvaUrl = 'https://www.canva.com/design/DAC-YourId/edit';
  window.open(canvaUrl, '_blank');
}

/**
 * Reset editor para valores padrão
 */
function resetEditorValues() {
  document.getElementById('bgColor').value = '#0d0d0d';
  document.getElementById('limeColor').value = '#88CE11';
  document.getElementById('timeColor').value = '#e0563b';
  document.getElementById('sizeSlider').value = 100;
  document.getElementById('brightnessSlider').value = 100;
  document.getElementById('contrastSlider').value = 100;
  document.getElementById('saturationSlider').value = 100;

  editorState = {
    ...editorState,
    bgColor: '#0d0d0d',
    limeColor: '#88CE11',
    timeColor: '#e0563b',
    size: 100,
    brightness: 100,
    contrast: 100,
    saturation: 100
  };

  document.getElementById('sizeValue').textContent = '100%';
  document.getElementById('brightnessValue').textContent = '100%';
  document.getElementById('contrastValue').textContent = '100%';
  document.getElementById('saturationValue').textContent = '100%';

  applyEditorChanges();
}

// Auto-inicializar quando o script carregar
document.addEventListener('DOMContentLoaded', initInstagramModal);
initInstagramModal();
