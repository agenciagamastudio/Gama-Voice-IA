# 🎙️ GAMA Voice IA

> **Speech-to-Text em Português** — Gravação de áudio inteligente com visualização 3D interativa

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React 18+](https://img.shields.io/badge/React-18+-blue.svg)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)

---

## ✨ Características Principais

### 🎙️ **Gravação Interativa**
- Botão circular que reage ao som da sua voz
- Visualização 3D em tempo real da forma de onda
- Interface intuitiva e responsiva (mobile + desktop)

### 📊 **Visualização Avançada**
- Waveform 3D com 5 camadas de profundidade
- 128 barras de frequência radiando do centro
- Animação suave com efeito de glow
- Tema GAMA com cor verde neon (#88CE11)

### 🤖 **Transcrição com IA**
- **STT:** Groq Whisper v3 Turbo (alta precisão, português)
- Latência ~1 segundo para 5 segundos de áudio
- Suporte para áudio de até 1 hora

### 💾 **Histórico Inteligente**
- Armazena todas as transcrições com timestamps
- Estatísticas: duração, hora de pico, palavras mais frequentes
- Busca e filtro por data/hora
- Exportação de histórico

### 🌐 **Completamente Português**
- Interface 100% em português
- Transcrição em português brasileiro
- Suporte para acentuação e caracteres especiais

---

## 📋 Pré-requisitos

| Requisito | Versão | Link | Obrigatório |
|-----------|--------|------|-------------|
| Git | 2.0+ | https://git-scm.com/ | ✅ Sim |
| Python | 3.9+ | https://www.python.org/ | ✅ Sim |
| Node.js | 18+ | https://nodejs.org/ | ✅ Sim |
| npm | 9+ | Vem com Node.js | ✅ Sim |
| Microfone | - | Integrado ou USB | ✅ Sim |
| Internet | - | Qualquer conexão | ✅ Sim |

---

## 🚀 Instalação — Guia Completo

### ⚡ Opção 1: Instalação Automática (Recomendado) — 2 minutos

#### 🪟 **Windows**

```batch
REM 1. Clonar repositório
git clone https://github.com/agenciagamastudio/Gama-Voice-IA.git
cd Gama-Voice-IA\Desktop\O_GRANDE_PROJETO\GAMA_VOZ

REM 2. Executar instalação automática (double-click ou cmd)
INSTALAR_GAMA.bat

REM 3. Iniciar aplicação
INICIAR_GAMA.bat

REM 4. Abra no navegador
REM http://localhost:5173
```

#### 🍎 **macOS / Linux**

```bash
# 1. Clonar repositório
git clone https://github.com/agenciagamastudio/Gama-Voice-IA.git
cd Gama-Voice-IA/Desktop/O_GRANDE_PROJETO/GAMA_VOZ

# 2. Executar instalação automática
chmod +x INSTALAR_GAMA.sh
./INSTALAR_GAMA.sh

# 3. Terminal 1 — Iniciar Backend
cd backend
python3 -m uvicorn main:app --reload --port 5001

# 4. Terminal 2 — Iniciar Frontend
cd frontend
npm run dev

# 5. Abra no navegador
# http://localhost:5173
```

---

### 🔧 Opção 2: Instalação Manual — 5 minutos

#### **Passo 1: Clonar Repositório**

```bash
git clone https://github.com/agenciagamastudio/Gama-Voice-IA.git
cd Gama-Voice-IA/Desktop/O_GRANDE_PROJETO/GAMA_VOZ
```

#### **Passo 2: Instalar Dependências do Backend**

```bash
cd backend
pip install -r requirements.txt
# ou
pip3 install -r requirements.txt
```

#### **Passo 3: Instalar Dependências do Frontend**

```bash
cd ../frontend
npm install
```

#### **Passo 4: Configurar Variáveis de Ambiente (Opcional)**

Verifique se existe `.env.local` na pasta `frontend/`:

```bash
# Se não existir, crie:
echo VITE_API_BASE_URL=http://localhost:5001 > frontend/.env.local
```

#### **Passo 5: Iniciar Backend (Terminal 1)**

```bash
cd backend
python -m uvicorn main:app --reload --port 5001
# ou
python3 -m uvicorn main:app --reload --port 5001
```

Você deve ver:
```
INFO:     Uvicorn running on http://127.0.0.1:5001
INFO:     Application startup complete
```

#### **Passo 6: Iniciar Frontend (Terminal 2)**

```bash
cd frontend
npm run dev
```

Você deve ver:
```
VITE v5.0.0  ready in 500 ms
➜  Local:   http://localhost:5173/
```

#### **Passo 7: Abrir no Navegador**

```
http://localhost:5173
```

---

## 📖 Como Usar

### **Interface Principal**

A interface é dividida em 2 seções:

```
┌─────────────────────────────────────────────┐
│  🎤 GAMA Voz — Speech-to-Text em Português │
└─────────────────────────────────────────────┘

┌──────────────────┐  ┌────────────────────────┐
│   Histórico      │  │  Gravação & Resultado  │
│   (esquerda)     │  │  (centro/direita)      │
│                  │  │                        │
│ • Item 1         │  │  ⭕ Círculo Interativo │
│ • Item 2         │  │  (clique para gravar)  │
│ • Item 3         │  │                        │
│                  │  │  📝 Transcrição        │
└──────────────────┘  │  📊 Estatísticas       │
                      └────────────────────────┘
```

### **Passo a Passo: Primeira Gravação**

1. **Clique no círculo verde** (parte da direita)
2. **Fale algo** no seu microfone
   - O círculo vai reagir com animação em tempo real
   - As cores vão mudar conforme o volume
3. **Clique novamente para parar**
   - A gravação é processada automaticamente
4. **Veja o resultado**
   - Texto transcrito aparece abaixo
   - Histórico é atualizado na esquerda
   - Estatísticas aparecem na parte inferior

### **Funcionalidades por Seção**

#### **Esquerda — Histórico**
- 📋 Lista todas as gravações anteriores
- 🔍 Clique em um item para reutilizar o texto
- 📊 Mostra estatísticas gerais
  - Total de gravações
  - Tempo total gasto
  - Horas e dias de pico

#### **Centro/Direita — Gravação**
- 🎤 **Círculo Interativo:**
  - Verde quando parado
  - Animado durante gravação
  - Mostra barras de frequência em tempo real
- ✅ **Transcrição:**
  - Texto transcrito (automático)
  - Botão "Copiar" (copia para clipboard)
  - Botão "Baixar" (salva como arquivo .txt)
  - Botão "Limpar" (apaga o texto)
- ⏱️ **Duração:** Mostra quanto tempo durou a gravação

---

## ✅ Checklist de Verificação

Depois de instalar, verifique se tudo está funcionando:

- [ ] Backend rodando em `http://localhost:5001/`
- [ ] Frontend rodando em `http://localhost:5173/`
- [ ] Microfone funciona (sistema operacional tem permissão)
- [ ] Navegador pede permissão de microfone (clique "Permitir")
- [ ] Círculo anima quando você fala
- [ ] Transcrição aparece após falar
- [ ] Histórico salva as gravações

Se algum item não estiver marcado, veja a seção **Troubleshooting** abaixo.

---

## 🎯 Boas Práticas

✅ **Acessibilidade** — Aplicações que precisam de áudio para usuários com deficiência visual

✅ **Educação** — Plataformas de aprendizado com áudio em português

✅ **Assistentes Virtuais** — Bots e assistentes conversacionais

✅ **Produtividade** — Ferramentas de transcrição e síntese para profissionais

✅ **Entretenimento** — Narração de histórias, podcasts, audiobooks

---

## 🌐 API Reference

### 🔊 POST `/api/tts/synthesize`

Sintetiza texto em áudio.

**Request:**
```json
{
  "text": "Olá, mundo!",
  "voice": "pm_alex",
  "speed": 1.0
}
```

**Respostas:**
- `200 OK` → Audio WAV (binary)
- `400 Bad Request` → Parâmetros inválidos
- `503 Service Unavailable` → Kokoro indisponível

---

### 🎤 POST `/api/stt/transcribe`

Transcreve áudio em texto.

**Request:**
```
multipart/form-data
- audio: <arquivo WAV/MP3/OGG>
- language: "pt" (padrão)
```

**Response:**
```json
{
  "text": "texto transcrito",
  "language": "pt"
}
```

**Respostas:**
- `200 OK` → Transcrição bem-sucedida
- `400 Bad Request` → Arquivo inválido
- `503 Service Unavailable` → Groq indisponível

---

### 🎵 GET `/api/tts/voices`

Lista vozes disponíveis.

**Response:**
```json
{
  "voices": ["pm_alex", "pm_santa", "pf_dora"],
  "details": {
    "pm_alex": {
      "id": "pm_alex",
      "gender": "male",
      "description": "Male voice (Portuguese)"
    }
  },
  "default": "pm_alex"
}
```

---

### 🏥 GET `/health`

Status do sistema.

**Response:**
```json
{
  "status": "ok",
  "service": "GAMA Voz",
  "tts": "kokoro",
  "stt": "groq"
}
```

---

## 📁 Estrutura do Projeto

```
GAMA-Voice-IA/
├── backend/
│   ├── app.py                 # API Flask (TTS + STT)
│   ├── requirements.txt       # Dependências Python
│   └── tests/
│       ├── test_tts.py
│       └── test_stt.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TextToSpeech.jsx
│   │   │   ├── SpeechToText.jsx
│   │   │   └── VoiceSelector.jsx
│   │   ├── pages/
│   │   │   └── index.jsx
│   │   └── styles/
│   │       └── global.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── docs/
│   ├── API.md
│   ├── SETUP.md
│   └── ARCHITECTURE.md
├── .env.example               # Template de configuração
├── .gitignore
├── README.md                  # Este arquivo
├── START.sh                   # Script de inicialização (Linux/Mac)
├── START.bat                  # Script de inicialização (Windows)
└── LICENSE

```

---

## 🎯 Boas Práticas

### 📌 **Durante a Gravação**

✅ **Faça:**
- Fale claro e articuladamente
- Mantenha distância consistente do microfone (~15 cm)
- Use ambiente silencioso quando possível
- Faça pausas naturais entre frases
- Deixe 1-2 segundos de silêncio após terminar

❌ **Evite:**
- Falar muito rápido (velocidade > 2.0x normal)
- Falar muito perto do microfone (causa distorção)
- Barulhos de fundo (teclado, buzina, ventilador)
- Interromper a gravação no meio de uma frase
- Mudar drasticamente de volume

### 💾 **Gerenciamento de Dados**

✅ **Faça:**
- Revisar transcrições para corrigir erros (copie e edite)
- Baixar arquivos importantes para backup
- Limpar histórico periodicamente se estiver grande
- Usar nomes descritivos para seus arquivos

❌ **Evite:**
- Depender 100% do histórico (pode ser perdido ao limpar cache)
- Gravar informações sensíveis (senhas, cartão de crédito)
- Deixar a aplicação aberta por horas sem uso

### 🔧 **Performance**

✅ **Faça:**
- Fechar outras abas pesadas do navegador
- Desabilitar extensões de navegador se causarem lentidão
- Reiniciar backend se a transcrição ficar lenta
- Verificar conexão de internet

❌ **Evite:**
- Rodar em navegador muito antigo (use Chrome/Firefox recente)
- Deixar muitas abas abertas enquanto usa GAMA
- Usar VPN com latência alta

### 🔐 **Segurança**

✅ **Faça:**
- Usar em conexão HTTPS em produção
- Validar dados transcrevidos antes de usar em aplicações críticas
- Implementar rate limiting se expor a API publicamente

❌ **Evite:**
- Compartilhar URLs com localhost em produção
- Expor a API sem autenticação
- Confiar cegamente em transcrições para dados críticos

---

## 📊 Performance

| Operação | Latência | Qualidade | Notas |
|----------|----------|-----------|-------|
| Gravação (5s áudio) | ~1s processamento | ⭐⭐⭐⭐⭐ | Muito preciso |
| Gravação (30s áudio) | ~3s processamento | ⭐⭐⭐⭐⭐ | Suporta áudio longo |
| Visualização | Real-time 60fps | ⭐⭐⭐⭐⭐ | Smooth animation |
| Histórico | <100ms busca | ⭐⭐⭐⭐⭐ | 1000+ registros |

---

## 🐛 Troubleshooting — Erros Comuns

### **❌ Erro: "Microfone não funciona / não aparece permissão"**

**Causa:** Navegador não tem permissão ou microfone não foi detectado.

**Solução:**

1. **Verificar permissão do navegador:**
   - Clique no ícone 🔒 na barra de endereço
   - Procure por "Câmera" ou "Microfone"
   - Clique em "Permitir"

2. **Verificar se microfone está conectado:**
   - Windows: Configurações → Som → Verificar nível do microfone
   - macOS: System Preferences → Sound → Input
   - Linux: `pactl list sources` (PulseAudio)

3. **Testar microfone em outro site:**
   - Vá para https://www.google.com/intl/pt_BR/chrome/demos/speech.html
   - Se não funcionar lá, problema é do navegador/microfone

4. **Se nada funcionar:**
   - Reinicie o navegador
   - Reinicie o computador
   - Tente outro navegador (Chrome, Firefox, Edge)

---

### **❌ Erro: "Port 5001 already in use" / "Port 5173 already in use"**

**Causa:** Outra aplicação está usando a mesma porta.

**Solução:**

#### **Windows:**

```batch
REM Encontrar processo usando porta 5001
netstat -aon | findstr :5001

REM Matar processo (substitua PID pelo número encontrado)
taskkill /PID 12345 /F
```

Ou usar outra porta:
```batch
cd backend
python -m uvicorn main:app --reload --port 5002
```

#### **macOS/Linux:**

```bash
# Encontrar e matar processo
lsof -i :5001 | grep LISTEN
kill -9 <PID>

# Ou usar outra porta
python3 -m uvicorn main:app --reload --port 5002
```

---

### **❌ Erro: "npm: command not found"**

**Causa:** Node.js não está instalado ou não está no PATH.

**Solução:**

1. Instale Node.js: https://nodejs.org/
   - ⚠️ Escolha a versão LTS (18 ou superior)
   
2. Verifique instalação:
   ```bash
   node --version
   npm --version
   ```

3. Se ainda não funcionar, reinicie o terminal/cmd

---

### **❌ Erro: "python/python3: command not found"**

**Causa:** Python não está instalado ou não está no PATH.

**Solução:**

1. Instale Python: https://www.python.org/
   - ⚠️ Escolha versão 3.9 ou superior
   - ⚠️ Durante instalação, marque "Add Python to PATH" (Windows)

2. Verifique instalação:
   ```bash
   python --version
   # ou
   python3 --version
   ```

3. Se ainda não funcionar, reinicie o terminal/cmd

---

### **❌ Erro: "ModuleNotFoundError: No module named 'uvicorn'"**

**Causa:** Dependências Python não foram instaladas.

**Solução:**

```bash
cd backend
pip install -r requirements.txt
# ou
pip3 install -r requirements.txt
```

---

### **❌ Erro: "Transcrição não aparece / toma muito tempo"**

**Causa:** Backend pode estar lento ou desconectado.

**Solução:**

1. **Verificar se backend está rodando:**
   - Abra `http://localhost:5001/` no navegador
   - Você deve ver um erro JSON (é normal, confirma que backend está ativo)

2. **Reiniciar backend:**
   - Pressione `Ctrl+C` no terminal do backend
   - Execute novamente: `python -m uvicorn main:app --reload --port 5001`

3. **Verificar logs:**
   - Olhe o terminal do backend para mensagens de erro
   - Se ver erros, copie e procure em Google

4. **Se nada funcionar:**
   - Reinicie ambos (backend e frontend)
   - Limpe cache do navegador (Ctrl+Shift+Del)
   - Atualize a página (Ctrl+Shift+R)

---

### **❌ Erro: "Waveform congelado / não anima"**

**Causa:** AudioContext não foi inicializado corretamente.

**Solução:**

1. **Recarregue a página:**
   ```
   Ctrl+Shift+R (força reload sem cache)
   ```

2. **Verifique se microfone está funcionando:**
   - Clique no círculo
   - Deve pedir permissão de microfone
   - Clique "Permitir"

3. **Abra console para ver erros:**
   - Pressione F12
   - Vá para a aba "Console"
   - Procure mensagens em vermelho

---

### **❌ Erro: "CORS error" / "Blocked by CORS policy"**

**Causa:** Backend e frontend estão em domínios diferentes.

**Solução:**

Verifique `VITE_API_BASE_URL` em `frontend/.env.local`:

```bash
# Deve ser:
VITE_API_BASE_URL=http://localhost:5001

# Não use:
VITE_API_BASE_URL=http://127.0.0.1:5001  # Pode causar CORS
```

Reinicie frontend após alterar.

---

### **❌ Erro: "Histórico desapareceu / não salva"**

**Causa:** LocalStorage foi limpo ou está em modo incógnito.

**Solução:**

1. **Não está em navegação privada?**
   - LocalStorage não funciona em modo incógnito
   - Use navegação normal

2. **Se limpou cache:**
   - Histórico será perdido
   - Para futuro, baixe as transcrições regularmente (botão "Baixar")

---

## 🌐 API Reference (Backend)

### **🎤 POST `/api/stt/transcribe`**

Transcreve áudio em texto.

**Request:**
```
Content-Type: multipart/form-data
- audio: <arquivo de áudio WAV/MP3/OGG/WebM>
- language: "pt" (padrão)
```

**Response:**
```json
{
  "text": "texto transcrito aqui",
  "language": "pt"
}
```

**Status Codes:**
- `200 OK` — Transcrição bem-sucedida
- `400 Bad Request` — Arquivo inválido
- `500 Server Error` — Erro no servidor

---

### **🏥 GET `/health`**

Verifica status do sistema.

**Response:**
```json
{
  "status": "ok",
  "service": "GAMA Voz",
  "timestamp": "2026-04-10T10:30:00Z"
}
```

---

## 📁 Estrutura do Projeto

```
GAMA_VOZ/
├── backend/
│   ├── main.py                      # API FastAPI/Uvicorn
│   ├── requirements.txt             # Dependências Python
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioVisualizer.tsx  # Waveform 3D interativo
│   │   │   ├── STT.tsx              # Componente principal
│   │   │   └── HistoryPanel.tsx     # Painel de histórico
│   │   ├── pages/
│   │   │   └── index.tsx
│   │   └── utils/
│   │       ├── config.ts            # Configurações (API URL)
│   │       └── history.ts           # Gerenciador de histórico
│   ├── .env.local                   # Variáveis de ambiente
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── SETUP.md                         # Guia detalhado de instalação
├── QUICK_START.md                   # Quick reference
├── INSTALAR_GAMA.bat                # Script instalação Windows
├── INSTALAR_GAMA.sh                 # Script instalação macOS/Linux
├── INICIAR_GAMA.bat                 # Script inicialização Windows
├── FECHAR_GAMA.bat                  # Script para fechar tudo
├── README.md                        # Este arquivo
└── LICENSE
```

---

## 📚 Documentação Completa

Para instruções mais detalhadas, veja:

- **[SETUP.md](SETUP.md)** — Guia completo com troubleshooting avançado
- **[QUICK_START.md](QUICK_START.md)** — Referência rápida (5 minutos)

---

## 🤝 Contribuindo

Quer contribuir? Ótimo! 🎉

1. **Fork** o repositório
2. **Crie uma branch** para sua feature (`git checkout -b feature/minha-feature`)
3. **Commit** suas mudanças (`git commit -m "feat: descrição clara"`)
4. **Push** para a branch (`git push origin feature/minha-feature`)
5. **Abra um Pull Request**

### Padrões de Commit

```bash
feat:    # Nova funcionalidade
fix:     # Correção de bug
docs:    # Documentação
style:   # Formatação, missing semilons, etc
refactor: # Refatoração sem mudança de behavior
test:    # Adicionando testes
chore:   # Build, deps, etc
```

---

## 📄 Licença

MIT License © 2026 Gama Studio

Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Equipe

Desenvolvido com ❤️ por **Gama Studio**

- **Gama Engine** — Plataforma de desenvolvimento AI-first
- **Gama iOS** — Aplicações mobile inteligentes

---

## 💬 Suporte & Comunidade

### Dúvidas?

- 📖 [Documentação](docs/)
- 🐛 [Issues](https://github.com/agenciagamastudio/Gama-Voice-IA/issues)
- 💌 [Email](mailto:contact@gamastudio.com)

### Nos acompanhe

- 🌐 Website: https://gamastudio.com
- 🐙 GitHub: https://github.com/agenciagamastudio
- 🎥 YouTube: [Gama Studio](https://youtube.com/@gamastudio)

---

## 🎓 Recursos & Referências

### **Documentação Técnica**
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — Visualização de áudio
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) — Gravação de áudio
- [FastAPI](https://fastapi.tiangolo.com/) — Backend framework
- [React 18](https://react.dev/) — Frontend framework
- [Next.js](https://nextjs.org/) — React framework

### **Transcrição de Áudio**
- [Groq API](https://groq.com/docs) — STT (Speech-to-Text)
- [Whisper v3](https://openai.com/index/whisper-3/) — Modelo de transcrição
- [Português Brasileiro (PT-BR)](https://www.language-support.pt/) — Suporte de idioma

### **Visualização 3D**
- [Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)

---

<div align="center">

**🚀 Pronto para começar?**

[⬆ Voltar ao Topo](#-gama-voice-ia)

</div>
