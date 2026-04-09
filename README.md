# 🎙️ GAMA VOZ v2.0

**Comunicação Clara e Ressonante — Texto ↔ Voz em Português**

Conversão bidirecional de áudio com IA:
- **Texto → Voz:** Kokoro TTS (humanizado, 3 vozes)
- **Voz → Texto:** Groq Whisper Turbo (alta precisão)

---

## 🚀 Início Rápido

### Opção 1: Com um clique (RECOMENDADO)

```bash
cd GAMA_VOZ
bash START.sh  # ou double-click START.bat no Windows
```

Pronto! Tudo sai sozinho:
- ✅ Backend (Kokoro + Groq) na porta 5001
- ✅ Frontend na porta 5002
- ✅ Navegador abre automaticamente

### Opção 2: Manual

```bash
# 1. Instalar dependências
pip install -r requirements.txt
npm install

# 2. Terminal 1 - Backend
cd backend
python app.py

# 3. Terminal 2 - Frontend
cd frontend
npm run dev

# 4. Abrir navegador
open http://localhost:5002
```

---

## 📋 Requisitos

- Python 3.11+
- Node.js 18+
- GROQ_API_KEY (obtenha em https://groq.com)
- Conexão com internet

---

## ⚙️ Configuração

### API Key do Groq

Crie um arquivo `.env` na raiz do projeto:

```
GROQ_API_KEY=seu_token_aqui
```

Ou defina como variável de ambiente:

```bash
export GROQ_API_KEY=seu_token_aqui
```

---

## 🎯 Funcionalidades

### Texto → Voz (Kokoro TTS)
- ✅ 3 vozes em português:
  - `pm_alex` - Voz masculina (padrão)
  - `pm_santa` - Voz masculina (alternativa)
  - `pf_dora` - Voz feminina
- ✅ Controle de velocidade (0.5x até 2.0x)
- ✅ Qualidade natural e humanizada
- ✅ Saída em WAV @ 24kHz

### Voz → Texto (Groq Whisper)
- ✅ Transcrição automática de áudio
- ✅ Suporte a português (pt-BR)
- ✅ Alta precisão com Whisper Turbo
- ✅ Baixa latência

### Interface
- ✅ Seletor de voz
- ✅ Controle de velocidade
- ✅ Botão sintetizar / gravar
- ✅ Histórico de conversas
- ✅ Preferências salvas localmente

---

## 📁 Estrutura

```
GAMA_VOZ/
├── backend/
│   ├── app.py              # API Flask (TTS + STT)
│   ├── requirements.txt    # Dependências Python
│   └── tests/              # Testes
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas Next.js
│   │   └── styles/         # Estilos
│   ├── package.json
│   └── vite.config.ts
├── .env                    # Variáveis de ambiente
├── START.sh / START.bat    # Script de inicialização
└── README.md
```

---

## 🌐 API Endpoints

### POST `/api/tts/synthesize`

Sintetiza texto em áudio com Kokoro.

**Request:**
```json
{
  "text": "Olá mundo",
  "voice": "pm_alex",
  "speed": 1.0
}
```

**Response:**
- `200 OK` - Audio WAV binary
- `400 Bad Request` - Parâmetros inválidos
- `503 Service Unavailable` - Kokoro não disponível

### GET `/api/tts/voices`

Lista vozes disponíveis.

**Response:**
```json
{
  "voices": ["pm_alex", "pm_santa", "pf_dora"],
  "details": { ... },
  "default": "pm_alex"
}
```

### POST `/api/stt/transcribe`

Transcreve áudio com Groq Whisper.

**Request:**
```
multipart/form-data
- audio: arquivo WAV/MP3/OGG
- language: "pt" (padrão)
```

**Response:**
```json
{
  "text": "texto transcrito",
  "language": "pt"
}
```

### GET `/health`

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

## 🐛 Troubleshooting

### Porta já está em uso
```bash
# Limpar portas
lsof -i :5001 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :5002 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Kokoro não carrega
```bash
# Verificar instalação
python -c "from kokoro import KPipeline; print('OK')"

# Reinstalar se necessário
pip install --upgrade kokoro
```

### Groq API error
- Verifique `.env` tem `GROQ_API_KEY` correto
- Teste em https://console.groq.com/
- Rate limit? Aguarde alguns segundos

### Npm/Python não encontrado
- Instale Node.js: https://nodejs.org
- Instale Python: https://python.org

---

## 📊 Performance

| Operação | Latência | Qualidade |
|----------|----------|-----------|
| Síntese (< 50 chars) | ~2s | Excelente |
| Síntese (< 500 chars) | ~5s | Excelente |
| Transcrição (5s áudio) | ~1s | Alta |
| Transcrição (30s áudio) | ~3s | Alta |

---

## 📝 Licença

GAMA Studio © 2026

---

## 🤝 Contribuindo

Quer melhorar o GAMA Voz?

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/sua-feature`)
3. Commit suas mudanças (`git commit -m "feat: descrição"`)
4. Push para a branch (`git push origin feature/sua-feature`)
5. Abra um Pull Request

---

## 💬 Suporte

Dúvidas ou problemas? Abre uma issue no GitHub ou entra em contato com o time Gama Studio.

**Pronto pra usar!** 🚀
