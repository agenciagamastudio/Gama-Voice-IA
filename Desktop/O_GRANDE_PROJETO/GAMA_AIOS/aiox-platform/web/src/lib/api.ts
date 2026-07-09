export type Agent = { p: string; id: string; role: string; g: string; est?: boolean; auth?: string; when: string; cmds: string[] };
export type Workflow = { name: string; file: string; cat: string; desc: string; when: string; track: [string, string, string][] };
export type Squad = { name: string; desc: string; agents?: string[]; workflows?: string[]; tasksCount?: number; local?: boolean; version?: string };
export type AdeItem = { name: string; desc: string; proof: string; ok: boolean; hl?: boolean };
export type Content = {
  version: string; source: string; docsCount?: number;
  agents: Agent[]; workflows: Workflow[]; ade: AdeItem[];
  squadsGama: Squad[]; squadsBase: Squad[];
  lifecycle: any[]; authority: any[]; gates: any[];
};
export type AiStatus = { ai: boolean; provider: string | null; model: string | null };
export type RouteResult = {
  workflow: string | null; agents: string[];
  steps: { title: string; who: string; desc: string; cmd?: string | null }[];
  rationale: string; discovery?: boolean;
  powerups?: { feature: string; how: string }[];
};

export async function fetchContent(): Promise<Content | null> {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function fetchAiStatus(): Promise<AiStatus> {
  try {
    const res = await fetch('/api/status');
    return await res.json();
  } catch { return { ai: false, provider: null, model: null }; }
}

export async function routeMission(mission: string): Promise<RouteResult> {
  const res = await fetch('/api/route', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mission }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || `HTTP ${res.status}`);
  return res.json();
}

export async function generateCommand(goal: string, workflow?: string | null, agents?: string[]): Promise<string> {
  const res = await fetch('/api/generate-command', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ goal, workflow, agents }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).prompt;
}

export type Attachment = { name: string; size: number; text: string };

/** Extrai texto de um arquivo no servidor (txt/md/código/PDF). */
export async function extractFile(file: File): Promise<Attachment> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/extract', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

/** Transcreve áudio gravado (ditado) via Whisper no servidor. */
export async function transcribeAudio(blob: Blob): Promise<string> {
  const fd = new FormData();
  const ext = (blob.type.split('/')[1] || 'webm').split(';')[0];
  fd.append('audio', blob, `dictation.${ext}`);
  const res = await fetch('/api/transcribe', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data.text || '';
}

export type ChatEvents = {
  onDelta: (t: string) => void;
  onThinking?: (t: string) => void;
  onMeta?: (m: { provider: string; model: string }) => void;
};

/** Chat streaming — despacha delta/thinking/meta, resolve ao fim. */
export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  events: ChatEvents,
  attachments?: Attachment[],
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, attachments: attachments?.length ? attachments : undefined }),
  });
  if (res.status === 503) throw new Error('no_api_key');
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 2);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      let data: any = null;
      try { data = JSON.parse(payload); } catch { continue; }
      if (data.delta) events.onDelta(data.delta);
      if (data.thinking) events.onThinking?.(data.thinking);
      if (data.meta) events.onMeta?.(data.meta);
      if (data.error) throw new Error(data.error);
    }
  }
}
