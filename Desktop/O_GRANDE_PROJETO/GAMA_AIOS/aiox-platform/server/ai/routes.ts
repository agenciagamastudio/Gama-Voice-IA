import { Router } from 'express';
import multer from 'multer';
import { getRoutedProvider as getProvider, type ChatMessage } from './provider.js';
import { search, systemCatalog, loadIndex } from '../content/search.js';

export const aiRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/* ═══ Anexos ═══ */

export type ChatAttachment = { name: string; size: number; text: string };

const ATTACH_TEXT_CAP = 50_000;      // chars por arquivo (texto extraído)
const ATTACH_TOTAL_CAP = 50_000;     // teto total injetado no contexto

const TEXT_EXTS = new Set([
  'txt', 'md', 'markdown', 'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'rb', 'go', 'rs', 'java', 'c', 'h',
  'cpp', 'hpp', 'cs', 'php', 'sh', 'bash', 'ps1', 'sql', 'json', 'yaml', 'yml', 'toml', 'ini', 'env',
  'css', 'scss', 'html', 'htm', 'xml', 'svg', 'csv', 'log', 'cfg', 'conf', 'lua', 'r', 'swift', 'kt', 'vue',
]);

export function attachmentsBlock(attachments: ChatAttachment[]): string {
  let budget = ATTACH_TOTAL_CAP;
  const parts: string[] = [];
  for (const a of attachments) {
    if (budget <= 0) break;
    const text = String(a.text || '').slice(0, Math.min(ATTACH_TEXT_CAP, budget));
    budget -= text.length;
    parts.push(`[ANEXO: ${a.name}]\n${text}`);
  }
  return parts.length ? '\n\n' + parts.join('\n\n') : '';
}

const CLAUDE_CODE_CAPS = `
CAPACIDADES MODERNAS DO CLAUDE CODE (mencione quando relevante):
• /goal — mantém o Claude trabalhando em loop até uma condição de conclusão verificada (ex.: "zere todos os warnings", "todos os testes devem estar verdes"). Ideal para missões longas e autônomas.
• /loop — repete um prompt ou skill em intervalo fixo ou dinâmico. Use para monitoramento contínuo, manutenção recorrente, ou pipelines periódicos.
• Subagents — delega partes da tarefa a sessões isoladas com contexto próprio. Perfeito para paralelizar stories, reviews e análises independentes no AIOX.
• Agent Teams — múltiplas sessões cooperando em tempo real, compartilhando artefatos. Para auditorias e builds que exigem vários especialistas simultâneos.
• Workflows — orquestra dezenas de subagentes em fan-out; apropriado para migrações em massa, auditorias de repositórios inteiros ou geração em lote.
• Skills — automatiza sequências repetidas encapsuladas em um slash command reutilizável (ex.: /qa-gate, /generate-story).
• Hooks — gatilhos automáticos em eventos do Claude Code (Stop, PreToolUse, PostToolUse). Exemplos: quality gate do @qa como Stop hook, logging de ferramentas, validações pré-commit.
`;

const ALLOWED_POWERUP_FEATURES = new Set(['/goal', '/loop', 'subagents', 'agent-teams', 'workflows', 'skills', 'hooks']);

function ragContext(query: string): string {
  const hits = search(query, 6);
  if (!hits.length) return '';
  // chunks truncados p/ caber em provedores com TPM baixo (Groq free tier: 6k tokens/min)
  return 'CONTEXTO DA DOCUMENTAÇÃO AIOX (use e cite as fontes):\n' +
    hits.map(h => `[fonte: ${h.source}] ${h.title}\n${h.text.slice(0, 700)}`).join('\n---\n');
}

const CHAT_SYSTEM = `Você é o assistente do AIOX Mission Control — especialista no framework AIOX/AIOS da SynkraAI (agentes, squads, workflows, tasks, comandos, ADE).
Responda SEMPRE em português brasileiro, direto e prático.
Use apenas informações do contexto fornecido e do catálogo de agentes/comandos. Se não souber, diga que não está na documentação indexada.
Ao citar comandos, use o formato real (@agente e *comando). Ao final, cite as fontes usadas entre colchetes.
${CLAUDE_CODE_CAPS}`;

aiRouter.get('/status', (_req, res) => {
  const p = getProvider();
  res.json({ ai: !!p, provider: p?.name || null, model: p?.model || null });
});

/** Chat com RAG — streaming SSE. Body: { messages: [{role, content}] } */
aiRouter.post('/chat', async (req, res) => {
  const provider = getProvider();
  if (!provider) { res.status(503).json({ error: 'no_api_key' }); return; }
  const messages: ChatMessage[] = (req.body?.messages || []).slice(-12);
  if (!messages.length) { res.status(400).json({ error: 'empty' }); return; }

  // anexos da conversa: entram só no contexto enviado ao provider (não persistem no índice)
  const attachments: ChatAttachment[] = Array.isArray(req.body?.attachments) ? req.body.attachments : [];
  if (attachments.length) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        messages[i] = { ...messages[i], content: messages[i].content + attachmentsBlock(attachments) };
        break;
      }
    }
  }

  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const system = `${CHAT_SYSTEM}\n\n${systemCatalog()}\n\n${ragContext(lastUser)}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write(`data: ${JSON.stringify({ meta: { provider: provider.name, model: provider.model } })}\n\n`);
  try {
    await provider.stream(system, messages, {
      onDelta: delta => res.write(`data: ${JSON.stringify({ delta })}\n\n`),
      onThinking: thinking => res.write(`data: ${JSON.stringify({ thinking })}\n\n`),
    });
    res.write('data: [DONE]\n\n');
  } catch (e: any) {
    res.write(`data: ${JSON.stringify({ error: String(e?.message || e) })}\n\n`);
  }
  res.end();
});

/** Extrai texto de um arquivo (txt/md/código/PDF) pra virar anexo do chat. Multipart: campo "file". */
aiRouter.post('/extract', upload.single('file'), async (req, res) => {
  const f = req.file;
  if (!f) { res.status(400).json({ error: 'no_file' }); return; }
  const ext = (f.originalname.split('.').pop() || '').toLowerCase();
  try {
    let text = '';
    if (ext === 'pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(f.buffer) });
      try {
        const parsed = await parser.getText();
        text = String(parsed.text || '');
      } finally {
        await parser.destroy();
      }
    } else if (TEXT_EXTS.has(ext)) {
      text = f.buffer.toString('utf8');
    } else {
      res.status(415).json({ error: `formato .${ext} não suportado (use texto, código ou PDF)` });
      return;
    }
    text = text.trim();
    if (!text) { res.status(422).json({ error: 'não consegui extrair texto desse arquivo' }); return; }
    res.json({ name: f.originalname, size: f.size, text: text.slice(0, ATTACH_TEXT_CAP) });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

/** Ditado por voz — transcreve áudio via Groq Whisper. Multipart: campo "audio". */
aiRouter.post('/transcribe', upload.single('audio'), async (req, res) => {
  const key = process.env.GROQ_API_KEY;
  if (!key) { res.status(503).json({ error: 'no_api_key' }); return; }
  const f = req.file;
  if (!f) { res.status(400).json({ error: 'no_audio' }); return; }
  try {
    const fd = new FormData();
    const ext = (f.mimetype.split('/')[1] || 'webm').split(';')[0];
    fd.append('file', new Blob([new Uint8Array(f.buffer)], { type: f.mimetype }), `dictation.${ext}`);
    fd.append('model', process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo');
    fd.append('language', 'pt');
    fd.append('response_format', 'json');
    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST', headers: { authorization: `Bearer ${key}` }, body: fd,
    });
    if (!r.ok) throw new Error(`Groq ${r.status}: ${await r.text()}`);
    const data: any = await r.json();
    res.json({ text: String(data.text || '').trim() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

/** Roteador inteligente. Body: { mission: string } → JSON estruturado validado contra o índice. */
aiRouter.post('/route', async (req, res) => {
  const provider = getProvider();
  if (!provider) { res.status(503).json({ error: 'no_api_key' }); return; }
  const mission = String(req.body?.mission || '').slice(0, 2000);
  if (!mission.trim()) { res.status(400).json({ error: 'empty' }); return; }

  const system = `Você é o roteador de missões do AIOX. Dada a missão do usuário, escolha o melhor caminho.
${systemCatalog()}
${CLAUDE_CODE_CAPS}

Responda APENAS com JSON válido neste formato exato (sem markdown, sem \`\`\`):
{"workflow": "<nome do workflow válido ou null>", "agents": ["<@id em ordem>"], "steps": [{"title": "...", "who": "<persona ou @id>", "desc": "...", "cmd": "<comandos reais, um por linha, ou null>"}], "rationale": "<1-2 frases em pt-BR>", "discovery": <true se código sem docs precisa de brownfield-discovery antes>, "powerups": [{"feature": "/goal|/loop|subagents|agent-teams|workflows|skills|hooks", "how": "<como aplicar nesta missão específica, pt-BR>"}]}
powerups: array de 0 a 3 itens, inclua SOMENTE quando agregar valor real à missão descrita. feature deve ser exatamente um dos valores listados.
Use SOMENTE workflows e comandos que existem no catálogo. Steps: 3 a 6 passos práticos.`;

  try {
    const raw = await provider.complete(system, [{ role: 'user', content: mission }], 1500);
    const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonStr);
    // validação contra o índice — nunca inventar workflow
    const idx = loadIndex();
    const wfNames = new Set(idx.workflows.map((w: any) => w.name));
    if (parsed.workflow && !wfNames.has(parsed.workflow)) parsed.workflow = null;
    const agentIds = new Set(idx.agents.map((a: any) => '@' + a.id));
    parsed.agents = (parsed.agents || []).filter((a: string) => agentIds.has(a.startsWith('@') ? a : '@' + a));
    parsed.powerups = (parsed.powerups || []).filter(
      (p: any) => typeof p?.feature === 'string' && ALLOWED_POWERUP_FEATURES.has(p.feature),
    );
    res.json(parsed);
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

/** Gerador de prompt pronto pro Claude Code. Body: { goal, workflow?, agents? } */
aiRouter.post('/generate-command', async (req, res) => {
  const provider = getProvider();
  if (!provider) { res.status(503).json({ error: 'no_api_key' }); return; }
  const { goal, workflow, agents } = req.body || {};
  const system = `Você gera prompts prontos para colar no Claude Code usando o framework AIOX.
${systemCatalog()}
${CLAUDE_CODE_CAPS}
Regras: use apenas @agentes e *comandos reais do catálogo. Se a missão se beneficiar de /goal, /loop, subagents ou hooks, mencione no prompt gerado. Saída: SOMENTE o texto do prompt final (pt-BR), sem explicação em volta, começando pela ativação do agente (ex.: "@aiox-master") seguido dos comandos e do contexto da missão em linguagem natural.`;
  const user = `Missão: ${goal}\n${workflow ? `Workflow sugerido: ${workflow}\n` : ''}${agents?.length ? `Agentes sugeridos: ${agents.join(', ')}\n` : ''}`;
  try {
    const prompt = await provider.complete(system, [{ role: 'user', content: user }], 1200);
    res.json({ prompt: prompt.trim() });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

/** Busca de comando em linguagem natural. Body: { query } → { results: [{cmd, agent, why}] } */
aiRouter.post('/find-command', async (req, res) => {
  const provider = getProvider();
  if (!provider) { res.status(503).json({ error: 'no_api_key' }); return; }
  const query = String(req.body?.query || '').slice(0, 500);
  if (!query.trim()) { res.status(400).json({ error: 'empty' }); return; }

  const system = `Você encontra o comando AIOX certo pra o que o usuário descreve em linguagem natural.
${systemCatalog()}
Responda APENAS com JSON válido (sem markdown): {"results":[{"cmd":"*comando","agent":"@id-do-agente","why":"<1 frase pt-BR: o que faz e por que é o certo>"}]}
Regras: 1 a 3 resultados, do mais certeiro pro menos; use SOMENTE comandos e agentes do catálogo; se envolver git push/PR/release, o agente é @devops (autoridade exclusiva).`;
  try {
    const raw = await provider.complete(system, [{ role: 'user', content: query }], 800);
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    const idx = loadIndex();
    // dono real de cada comando — se a IA errar o agente mas o comando existir, corrigimos
    const owner = new Map<string, string>();
    for (const a of idx.agents) for (const c of a.cmds) if (!owner.has(c)) owner.set(c, a.id);
    const results = (parsed.results || []).flatMap((r: any) => {
      const cmd = String(r.cmd || '').trim();
      const claimed = String(r.agent || '').replace(/^@/, '');
      const validPair = idx.agents.some((a: any) => a.id === claimed && a.cmds.includes(cmd));
      const id = validPair ? claimed : owner.get(cmd);
      return id ? [{ cmd, agent: `@${id}`, why: String(r.why || '') }] : [];
    }).slice(0, 3);
    res.json({ results });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

/** Encontra o workflow certo em linguagem natural. Body: { query } → { results: [{name, why}] } */
aiRouter.post('/find-workflow', async (req, res) => {
  const provider = getProvider();
  if (!provider) { res.status(503).json({ error: 'no_api_key' }); return; }
  const query = String(req.body?.query || '').slice(0, 500);
  if (!query.trim()) { res.status(400).json({ error: 'empty' }); return; }
  const idx = loadIndex();
  const catalog = idx.workflows.map((w: any) => `${w.name} [${w.cat}] — ${w.desc} Quando usar: ${w.when}`).join('\n');
  const system = `Você indica o workflow AIOX certo pra situação descrita.
WORKFLOWS DISPONÍVEIS:
${catalog}
Responda APENAS com JSON válido (sem markdown): {"results":[{"name":"<nome exato do workflow>","why":"<1-2 frases pt-BR: por que é o certo pra essa situação>"}]}
Regras: 1 a 2 resultados, do mais certeiro pro menos; use SOMENTE nomes exatos da lista.`;
  try {
    const raw = await provider.complete(system, [{ role: 'user', content: query }], 600);
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    const names = new Set(idx.workflows.map((w: any) => w.name));
    const results = (parsed.results || []).filter((r: any) => names.has(r.name)).slice(0, 2);
    res.json({ results });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

/** Encontra o squad certo em linguagem natural. Body: { query } → { results: [{name, why}] } */
aiRouter.post('/find-squad', async (req, res) => {
  const provider = getProvider();
  if (!provider) { res.status(503).json({ error: 'no_api_key' }); return; }
  const query = String(req.body?.query || '').slice(0, 500);
  if (!query.trim()) { res.status(400).json({ error: 'empty' }); return; }
  const idx = loadIndex();
  const squads = [...idx.squadsGama, ...idx.squadsBase];
  const catalog = squads.map((s: any) =>
    `${s.name} — ${s.desc}${s.agents?.length ? ` Agentes: ${s.agents.slice(0, 8).join(', ')}.` : ''}`).join('\n');
  const system = `Você indica o squad AIOX certo pra necessidade descrita.
SQUADS DISPONÍVEIS:
${catalog}
Responda APENAS com JSON válido (sem markdown): {"results":[{"name":"<nome exato do squad>","why":"<1-2 frases pt-BR: por que ele resolve isso>"}]}
Regras: 1 a 2 resultados; use SOMENTE nomes exatos da lista; se nenhum servir, sugira o squad-creator pra criar um novo.`;
  try {
    const raw = await provider.complete(system, [{ role: 'user', content: query }], 600);
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    const names = new Set(squads.map((s: any) => s.name));
    const results = (parsed.results || []).filter((r: any) => names.has(r.name)).slice(0, 2);
    res.json({ results });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});
