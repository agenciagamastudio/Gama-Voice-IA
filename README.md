# 🎙️ GAMA VOZ v2.0

**Comunicação Clara e Ressonante**

Texto → Voz (Kokoro TTS) + Voz → Texto (Groq Whisper)

---

## 🚀 Como Usar (SUPER FÁCIL)

### Opção 1: Com um clique (RECOMENDADO)

1. Clone o repositório:
```bash
git clone https://github.com/agenciagamastudio/Gama-Voice-IA.git
cd Gama-Voice-IA
```

2. **Duplo clique em `START.bat`**

Pronto! Tudo sai sozinho:
- ✅ Backend na porta 5001
- ✅ Frontend na porta 5002
- ✅ Navegador abre automaticamente

### Opção 2: Manual (se preferir)

```bash
# 1. Instalar dependências
pip install -r requirements.txt
npm install

# 2. Terminal 1 - Backend
cd backend
set GROQ_API_KEY=sua_groq_api_key_aqui
python app.py

# 3. Terminal 2 - Frontend
cd frontend
npm run dev

# 4. Abrir navegador
http://localhost:5002
```

---

## 📋 Requisitos

- Python 3.11+
- Node.js 18+
- Conexão com internet (pra APIs)

---

## ⚙️ Configuração

### API Key do Groq

A API key já vem pré-configurada no `START.bat`. Se quiser mudar:

1. Abra `START.bat` em um editor de texto
2. Procure por `set GROQ_API_KEY=`
3. Substitua pelo seu token do Groq

Ou crie um arquivo `.env`:
```
GROQ_API_KEY=seu_token_aqui
```

---

## 🎯 Funcionalidades

### Texto → Voz
- ✅ 5 vozes em português (antonio, francisca, brenda, paulo, maria)
- ✅ Controle de velocidade (0.5x até 2.0x)
- ✅ Qualidade humanizada com Kokoro TTS

### Voz → Texto
- ✅ Transcrição automática com Groq Whisper Turbo
- ✅ Suporte a português
- ✅ Alta precisão

### Configurações
- ✅ Seletor de voz
- ✅ Controle de velocidade
- ✅ Salva preferências automaticamente

---

## 📁 Estrutura

```
Gama-Voice-IA/
├── backend/           # API Flask
│   ├── app.py        # Servidor principal
│   └── requirements.txt
├── frontend/         # Interface React
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── START.bat         # ⭐ Iniciar tudo (clique aqui!)
└── README.md
```

---

## 🐛 Problemas?

### Porta já está em uso
- Feche o programa que está usando a porta
- Ou mude em `vite.config.ts` (frontend)

### API Key não funciona
- Verifique a chave no Groq console
- Copie novamente no `START.bat`

### Npm/Python não encontrado
- Instale Node.js: https://nodejs.org
- Instale Python: https://python.org

---

## 📝 Licença

GAMA Studio © 2026

---

## 💡 Dicas

- **Duplo clique em START.bat** = Forma mais fácil
- **F5 no navegador** = Recarrega se algo der ruim
- **Feche as abas** = Para parar tudo

---

**Pronto pra usar!** 🚀
