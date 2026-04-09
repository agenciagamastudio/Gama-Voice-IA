# 🎙️ GAMA Voice IA

> **Conversação Inteligente em Português** — Texto ↔ Voz com IA

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React 18+](https://img.shields.io/badge/React-18+-blue.svg)](https://react.dev/)

---

## ✨ Características

🚀 **Rápido & Eficiente**
- Síntese de texto → voz em ~2 segundos (Kokoro)
- Transcrição de voz → texto em ~1 segundo (Groq Whisper)
- Interface responsiva e intuitiva

🌍 **100% Português**
- 3 vozes naturais em português:
  - 👨 **pm_alex** — Voz masculina (padrão)
  - 👨 **pm_santa** — Voz masculina (alternativa)
  - 👩 **pf_dora** — Voz feminina
- Transcrição com Groq Whisper Turbo (PT-BR)

🤖 **Powered by IA**
- **TTS:** Kokoro (humanizado, natural)
- **STT:** Groq Whisper v3 Turbo (alta precisão)
- Controle de velocidade (0.5x a 2.0x)

💾 **Persistência**
- Preferências salvas localmente
- Histórico de conversas
- Suporte para múltiplas sessões

---

## 🚀 Início Rápido

### ⚡ Instalação Automática

```bash
# Clone o repositório
git clone https://github.com/agenciagamastudio/Gama-Voice-IA.git
cd Gama-Voice-IA

# Execute o script de inicialização
bash START.sh          # Linux/Mac
# ou
START.bat              # Windows
```

Tudo sai sozinho:
- ✅ Backend (porta 5001)
- ✅ Frontend (porta 5002)
- ✅ Navegador abre automaticamente

### 🔧 Instalação Manual

```bash
# 1. Dependências
pip install -r requirements.txt
npm install

# 2. Configurar API Key
echo "GROQ_API_KEY=seu_token_aqui" > .env

# 3. Terminal 1 — Backend
cd backend
python app.py
# ou
python -m flask run --port 5001

# 4. Terminal 2 — Frontend
cd frontend
npm run dev
# ou
npm run build && npm start

# 5. Abrir navegador
open http://localhost:5002
```

---

## 📋 Pré-requisitos

| Requisito | Versão | Link |
|-----------|--------|------|
| Python | 3.11+ | https://www.python.org/ |
| Node.js | 18+ | https://nodejs.org/ |
| Groq API Key | - | https://groq.com |
| Internet | - | ✅ Obrigatória |

---

## 🎯 Casos de Uso

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

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Groq API Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Opcional
FLASK_ENV=development
FLASK_DEBUG=True
```

Obtenha sua `GROQ_API_KEY` em: https://console.groq.com/keys

---

## 📊 Performance

| Operação | Latência | Qualidade | Notas |
|----------|----------|-----------|-------|
| TTS (< 50 chars) | ~2s | ⭐⭐⭐⭐⭐ | Muito rápido |
| TTS (< 500 chars) | ~5s | ⭐⭐⭐⭐⭐ | Excelente qualidade |
| STT (5s áudio) | ~1s | ⭐⭐⭐⭐⭐ | Precisão alta |
| STT (30s áudio) | ~3s | ⭐⭐⭐⭐⭐ | Suporta áudio longo |

---

## 🐛 Troubleshooting

### ❌ "GROQ_API_KEY not configured"

```bash
# Verifique o arquivo .env
cat .env

# Ou defina como variável de ambiente
export GROQ_API_KEY=sua_chave_aqui
```

### ❌ "Kokoro TTS not loaded"

```bash
# Reinstale o Kokoro
pip install --upgrade kokoro

# Teste a importação
python -c "from kokoro import KPipeline; print('OK')"
```

### ❌ "Porta 5001/5002 já está em uso"

```bash
# Linux/Mac: Liberar porta
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows: Usar porta diferente
FLASK_PORT=5003 python backend/app.py
```

### ❌ "npm/python not found"

- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

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

## 🎓 Aprenda Mais

- [Kokoro TTS Documentation](https://github.com/hexgrad/Kokoro)
- [Groq API Docs](https://groq.com/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)

---

<div align="center">

**🚀 Pronto para começar?**

[⬆ Voltar ao Topo](#-gama-voice-ia)

</div>
