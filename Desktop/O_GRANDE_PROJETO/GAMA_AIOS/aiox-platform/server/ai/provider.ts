import 'dotenv/config';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type StreamHandlers = {
  onDelta: (t: string) => void;
  /** Se presente, habilita extended thinking (quando o provedor suportar). */
  onThinking?: (t: string) => void;
};

export interface AIProvider {
  name: string;
  model: string;
  /** Resposta completa (não-streaming). */
  complete(system: string, messages: ChatMessage[], maxTokens?: number): Promise<string>;
  /** Streaming — onDelta a cada pedaço de texto; onThinking (opcional) para raciocínio. */
  stream(system: string, messages: ChatMessage[], handlers: StreamHandlers, maxTokens?: number): Promise<void>;
}

class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  private key = process.env.ANTHROPIC_API_KEY || '';

  private headers() {
    return {
      'content-type': 'application/json',
      'x-api-key': this.key,
      'anthropic-version': '2023-06-01',
    };
  }

  async complete(system: string, messages: ChatMessage[], maxTokens = 2048): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ model: this.model, max_tokens: maxTokens, system, messages }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const data: any = await res.json();
    return (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
  }

  async stream(system: string, messages: ChatMessage[], handlers: StreamHandlers, maxTokens = 2048): Promise<void> {
    const THINKING_BUDGET = 4096;
    const body: any = { model: this.model, max_tokens: maxTokens, system, messages, stream: true };
    if (handlers.onThinking) {
      // API exige max_tokens > budget_tokens
      body.thinking = { type: 'enabled', budget_tokens: THINKING_BUDGET };
      body.max_tokens = Math.max(maxTokens, THINKING_BUDGET + 2048);
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    for await (const event of sseEvents(res.body)) {
      try {
        const data = JSON.parse(event);
        if (data.type === 'content_block_delta') {
          if (data.delta?.type === 'text_delta') handlers.onDelta(data.delta.text);
          else if (data.delta?.type === 'thinking_delta' && handlers.onThinking) handlers.onThinking(data.delta.thinking);
          // signature_delta: ignorado
        }
      } catch { /* keep-alive / eventos não-JSON */ }
    }
  }
}

class GroqProvider implements AIProvider {
  name = 'groq';
  model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  private key = process.env.GROQ_API_KEY || '';

  private body(system: string, messages: ChatMessage[], maxTokens: number, stream: boolean) {
    return JSON.stringify({
      model: this.model,
      max_tokens: maxTokens,
      stream,
      messages: [{ role: 'system', content: system }, ...messages],
    });
  }

  private headers() {
    return { 'content-type': 'application/json', authorization: `Bearer ${this.key}` };
  }

  async complete(system: string, messages: ChatMessage[], maxTokens = 2048): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: this.headers(), body: this.body(system, messages, maxTokens, false),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async stream(system: string, messages: ChatMessage[], handlers: StreamHandlers, maxTokens = 2048): Promise<void> {
    const payload: any = JSON.parse(this.body(system, messages, maxTokens, true));
    // modelos de raciocínio da Groq: qwen3/deepseek-r1 precisam de reasoning_format;
    // gpt-oss já streama o raciocínio em delta.reasoning por padrão
    if (handlers.onThinking && /qwen3|deepseek-r1/i.test(this.model)) {
      payload.reasoning_format = 'parsed';
    }
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: this.headers(), body: JSON.stringify(payload),
    });
    if (!res.ok || !res.body) throw new Error(`Groq ${res.status}: ${await res.text()}`);
    for await (const event of sseEvents(res.body)) {
      if (event === '[DONE]') break;
      try {
        const data = JSON.parse(event);
        const d = data.choices?.[0]?.delta;
        if (d?.reasoning && handlers.onThinking) handlers.onThinking(d.reasoning);
        if (d?.content) handlers.onDelta(d.content);
      } catch { /* ignore */ }
    }
  }
}

/** Itera os payloads `data:` de um corpo SSE. */
async function* sseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (line.startsWith('data:')) yield line.slice(5).trim();
    }
  }
}

export function getProvider(): AIProvider | null {
  const which = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
  if (which === 'groq') {
    if (!process.env.GROQ_API_KEY) return null;
    return new GroqProvider();
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    // fallback automático: se só a Groq estiver configurada, usa ela
    if (process.env.GROQ_API_KEY) return new GroqProvider();
    return null;
  }
  return new AnthropicProvider();
}

/* ═══ Roteador de modelos com fallback automático ═══
 * Cadeia de candidatos (Anthropic + vários modelos Groq, cada um com limite próprio).
 * Em 429/413/sem-créditos: marca o modelo em cooldown e tenta o próximo.
 */

type Candidate = { key: string; label: string; make: () => AIProvider };

const cooldown = new Map<string, number>(); // key → timestamp de quando pode tentar de novo

export function parseRetrySeconds(msg: string): number | null {
  const m = msg.match(/try again in (?:(\d+)m)?([\d.]+)s/i);
  if (!m) return null;
  return (m[1] ? parseInt(m[1]) * 60 : 0) + Math.ceil(parseFloat(m[2] || '0'));
}

export function isQuotaError(msg: string): boolean {
  return /429|413|rate_limit|credit balance is too low|tokens per (day|minute)/i.test(msg);
}

function markCooldown(key: string, msg: string) {
  const secs = /credit balance/i.test(msg) ? 6 * 3600 : (parseRetrySeconds(msg) ?? 120);
  cooldown.set(key, Date.now() + secs * 1000);
  console.log(`⏳ modelo em cooldown ${secs}s: ${key}`);
}

function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];
  const groqModels = (process.env.GROQ_MODELS ||
    // gpt-oss primeiro: expõe raciocínio (delta.reasoning) → habilita o bloco "Pensando" no chat
    'openai/gpt-oss-120b,llama-3.3-70b-versatile,openai/gpt-oss-20b,llama-3.1-8b-instant')
    .split(',').map(s => s.trim()).filter(Boolean);

  const groq: Candidate[] = process.env.GROQ_API_KEY
    ? groqModels.map(m => ({
        key: `groq:${m}`, label: `groq/${m}`,
        make: () => { const p = new GroqProvider(); p.model = m; return p; },
      }))
    : [];
  const anthropic: Candidate[] = process.env.ANTHROPIC_API_KEY
    ? [{ key: 'anthropic', label: `anthropic/${process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5'}`, make: () => new AnthropicProvider() }]
    : [];

  const pref = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
  return pref === 'groq' ? [...groq, ...anthropic] : [...anthropic, ...groq];
}

function availableCandidates(): Candidate[] {
  const now = Date.now();
  const all = buildCandidates();
  const free = all.filter(c => (cooldown.get(c.key) || 0) <= now);
  // se TODOS estão em cooldown, tenta mesmo assim o que libera primeiro
  return free.length ? free : all.sort((a, b) => (cooldown.get(a.key) || 0) - (cooldown.get(b.key) || 0));
}

class RoutedProvider implements AIProvider {
  name = 'auto';
  get model() {
    const c = availableCandidates();
    return c.length ? `${c[0].label} (+${c.length - 1} fallback${c.length - 1 !== 1 ? 's' : ''})` : 'nenhum';
  }

  async complete(system: string, messages: ChatMessage[], maxTokens = 2048): Promise<string> {
    let lastErr: any = null;
    for (const cand of availableCandidates()) {
      try {
        return await cand.make().complete(system, messages, maxTokens);
      } catch (e: any) {
        const msg = String(e?.message || e);
        lastErr = e;
        if (isQuotaError(msg)) { markCooldown(cand.key, msg); continue; }
        throw e;
      }
    }
    throw lastErr || new Error('nenhum modelo disponível');
  }

  async stream(system: string, messages: ChatMessage[], handlers: StreamHandlers, maxTokens = 2048): Promise<void> {
    let lastErr: any = null;
    for (const cand of availableCandidates()) {
      let emitted = false;
      const wrapped: StreamHandlers = {
        onDelta: t => { emitted = true; handlers.onDelta(t); },
        onThinking: handlers.onThinking
          ? t => { emitted = true; handlers.onThinking!(t); }
          : undefined,
      };
      try {
        await cand.make().stream(system, messages, wrapped, maxTokens);
        return;
      } catch (e: any) {
        const msg = String(e?.message || e);
        lastErr = e;
        // só faz fallback se ainda não emitiu nada (delta OU thinking — senão duplicaria a resposta)
        if (!emitted && isQuotaError(msg)) { markCooldown(cand.key, msg); continue; }
        throw e;
      }
    }
    throw lastErr || new Error('nenhum modelo disponível');
  }
}

export function getRoutedProvider(): AIProvider | null {
  return buildCandidates().length ? new RoutedProvider() : null;
}

/** Estado da cadeia de modelos (pra telemetria/health). */
export function modelStatus(): { key: string; label: string; cooldownSecs: number }[] {
  const now = Date.now();
  return buildCandidates().map(c => ({
    key: c.key,
    label: c.label,
    cooldownSecs: Math.max(0, Math.ceil(((cooldown.get(c.key) || 0) - now) / 1000)),
  }));
}
