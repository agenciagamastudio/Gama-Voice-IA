import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');

export type DocChunk = {
  id: string;
  type: 'agent' | 'squad' | 'task' | 'workflow' | 'doc' | 'command';
  title: string;
  source: string;
  text: string;
};

export type ContentIndex = {
  version: string;
  source: string;
  agents: any[];
  workflows: any[];
  ade: any[];
  squadsGama: any[];
  squadsBase: any[];
  lifecycle: any[];
  authority: any[];
  gates: any[];
  docs: DocChunk[];
};

let cached: ContentIndex | null = null;
let cachedMtime = 0;

/** Carrega index.json (gerado pelo ingest) ou cai no seed.json. */
export function loadIndex(): ContentIndex {
  const indexPath = path.join(DATA_DIR, 'index.json');
  const seedPath = path.join(DATA_DIR, 'seed.json');
  const file = fs.existsSync(indexPath) ? indexPath : seedPath;
  const mtime = fs.statSync(file).mtimeMs;
  if (!cached || mtime !== cachedMtime) {
    cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    cachedMtime = mtime;
  }
  return cached!;
}

const STOP = new Set(['de','da','do','das','dos','a','o','as','os','e','é','em','um','uma','para','pra','com','que','no','na','the','of','and','to','in','on','for','é','ser','como','qual','quais','me','eu']);

function tokens(s: string): string[] {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9*@-]+/).filter(t => t.length > 1 && !STOP.has(t));
}

/** Busca lexical simples (TF com boost de título) sobre todos os chunks do índice. */
export function search(query: string, k = 8): DocChunk[] {
  const idx = loadIndex();
  const chunks: DocChunk[] = [
    ...idx.docs,
    ...idx.agents.map((a: any): DocChunk => ({
      id: `agent:${a.id}`, type: 'agent', title: `${a.p} (@${a.id})`, source: 'crew',
      text: `${a.p} @${a.id} — ${a.role}. ${a.auth || ''} Quando chamar: ${a.when} Comandos: ${(a.cmds || []).join(' ')}`,
    })),
    ...idx.workflows.map((w: any): DocChunk => ({
      id: `wf:${w.name}`, type: 'workflow', title: w.name, source: w.file,
      text: `workflow ${w.name} (${w.cat}) — ${w.desc} Quando usar: ${w.when} Sequência: ${(w.track || []).map((t: any[]) => t[0] + ' ' + t[1]).join(' → ')}`,
    })),
    ...[...idx.squadsGama, ...idx.squadsBase].map((s: any): DocChunk => ({
      id: `squad:${s.name}`, type: 'squad', title: s.name, source: 'squads',
      text: `squad ${s.name} — ${s.desc} ${s.agents ? 'Agentes: ' + s.agents.join(', ') : ''} ${s.workflows ? 'Workflows: ' + s.workflows.join(', ') : ''}`,
    })),
  ];

  const q = tokens(query);
  if (!q.length) return [];
  const scored = chunks.map(c => {
    const titleT = tokens(c.title);
    const textT = tokens(c.text);
    let score = 0;
    for (const t of q) {
      if (titleT.some(x => x.includes(t))) score += 5;
      score += textT.filter(x => x === t).length;
      score += textT.filter(x => x !== t && x.includes(t)).length * 0.3;
    }
    return { c, score };
  }).filter(x => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(x => x.c);
}

/** Contexto compacto do sistema (agentes+workflows válidos) para prompts. */
export function systemCatalog(): string {
  const idx = loadIndex();
  const agents = idx.agents.map((a: any) => `@${a.id} (${a.p}, ${a.role}): ${(a.cmds || []).join(' ')}`).join('\n');
  const wfs = idx.workflows.map((w: any) => `${w.name} [${w.cat}] — ${w.when}`).join('\n');
  return `AGENTES E COMANDOS VÁLIDOS:\n${agents}\n\nWORKFLOWS VÁLIDOS:\n${wfs}`;
}
