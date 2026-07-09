/**
 * Ingestão de conteúdo AIOX → data/index.json
 * Fontes (nesta ordem de prioridade):
 *  1. Local: ~/.aiox-core (user-guide, constitution, docs) e ~/squads/* (squad.yaml, agents, workflows)
 *  2. GitHub SynkraAI (raw.githubusercontent.com) — com --remote ou quando local ausente
 *  3. seed.json — base curada (agentes/workflows/ade) sempre incluída
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const HOME = os.homedir();
const AIOX_CORE = path.join(HOME, '.aiox-core');
const SQUADS_DIR = path.join(HOME, 'squads');
const REMOTE = process.argv.includes('--remote');

type Chunk = { id: string; type: string; title: string; source: string; text: string };

function chunkMarkdown(id: string, title: string, source: string, md: string, maxLen = 1500): Chunk[] {
  const sections = md.split(/\n(?=#{1,3} )/);
  const out: Chunk[] = [];
  let i = 0;
  for (const sec of sections) {
    const clean = sec.trim();
    if (clean.length < 40) continue;
    for (let off = 0; off < clean.length; off += maxLen) {
      out.push({ id: `${id}#${i++}`, type: 'doc', title, source, text: clean.slice(off, off + maxLen) });
    }
  }
  return out;
}

function readIf(p: string): string | null {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

async function fetchRaw(repo: string, file: string): Promise<string | null> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/SynkraAI/${repo}/main/${file}`);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ── Claude Code docs ────────────────────────────────────────────────────────
const CC_CACHE_DIR = path.resolve(__dirname, '../../data/claude-code-docs');

const CC_DOCS: Array<{ slug: string; title: string; url: string; source: string }> = [
  { slug: 'goal', title: 'Claude Code — /goal', url: 'https://code.claude.com/docs/en/goal.md', source: 'code.claude.com/docs/en/goal.md' },
  { slug: 'scheduled-tasks', title: 'Claude Code — /loop e tarefas agendadas', url: 'https://code.claude.com/docs/en/scheduled-tasks.md', source: 'code.claude.com/docs/en/scheduled-tasks.md' },
  { slug: 'sub-agents', title: 'Claude Code — Subagents', url: 'https://code.claude.com/docs/en/sub-agents.md', source: 'code.claude.com/docs/en/sub-agents.md' },
  { slug: 'agent-teams', title: 'Claude Code — Agent Teams', url: 'https://code.claude.com/docs/en/agent-teams.md', source: 'code.claude.com/docs/en/agent-teams.md' },
  { slug: 'workflows', title: 'Claude Code — Workflows', url: 'https://code.claude.com/docs/en/workflows.md', source: 'code.claude.com/docs/en/workflows.md' },
  { slug: 'skills', title: 'Claude Code — Skills', url: 'https://code.claude.com/docs/en/skills.md', source: 'code.claude.com/docs/en/skills.md' },
  { slug: 'hooks', title: 'Claude Code — Hooks (referência)', url: 'https://code.claude.com/docs/en/hooks.md', source: 'code.claude.com/docs/en/hooks.md' },
  { slug: 'hooks-guide', title: 'Claude Code — Hooks (guia)', url: 'https://code.claude.com/docs/en/hooks-guide.md', source: 'code.claude.com/docs/en/hooks-guide.md' },
  { slug: 'commands', title: 'Claude Code — Slash commands', url: 'https://code.claude.com/docs/en/commands.md', source: 'code.claude.com/docs/en/commands.md' },
  { slug: 'headless', title: 'Claude Code — Headless', url: 'https://code.claude.com/docs/en/headless.md', source: 'code.claude.com/docs/en/headless.md' },
  { slug: 'changelog', title: 'Claude Code — Changelog', url: 'https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md', source: 'github:anthropics/claude-code/CHANGELOG.md' },
];

async function fetchClaudeCodeDoc(entry: typeof CC_DOCS[number]): Promise<string | null> {
  const cacheFile = path.join(CC_CACHE_DIR, `${entry.slug}.md`);
  try {
    const res = await fetch(entry.url);
    if (res.ok) {
      const md = await res.text();
      fs.mkdirSync(CC_CACHE_DIR, { recursive: true });
      fs.writeFileSync(cacheFile, md, 'utf8');
      return md;
    }
  } catch { /* network error — fall through to cache */ }
  const cached = readIf(cacheFile);
  if (cached) { console.log(`  (cc cache: ${entry.slug})`); return cached; }
  console.log(`  (cc ausente e sem cache: ${entry.slug})`);
  return null;
}

async function ingestClaudeCodeDocs(): Promise<Chunk[]> {
  const out: Chunk[] = [];
  for (const entry of CC_DOCS) {
    const md = await fetchClaudeCodeDoc(entry);
    if (md) out.push(...chunkMarkdown(`cc:${entry.slug}`, entry.title, entry.source, md));
  }
  return out;
}

async function main() {
  const seed = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'seed.json'), 'utf8'));
  const docs: Chunk[] = [];
  const squadsLocal: any[] = [];
  const sources: string[] = [];

  // ── 1. .aiox-core local ─────────────────────────────────────
  if (fs.existsSync(AIOX_CORE)) {
    sources.push('.aiox-core (local)');
    const coreDocs = [
      ['user-guide.md', 'Guia do usuário AIOX'],
      ['constitution.md', 'Constituição AIOX'],
      ['working-in-the-brownfield.md', 'Trabalhando em brownfield'],
    ] as const;
    for (const [file, title] of coreDocs) {
      const md = readIf(path.join(AIOX_CORE, file));
      if (md) docs.push(...chunkMarkdown(`core:${file}`, title, `~/.aiox-core/${file}`, md));
    }
    // docs/standards
    const stdDir = path.join(AIOX_CORE, 'docs', 'standards');
    if (fs.existsSync(stdDir)) {
      for (const f of fs.readdirSync(stdDir).filter(f => f.endsWith('.md')).slice(0, 30)) {
        const md = readIf(path.join(stdDir, f));
        if (md) docs.push(...chunkMarkdown(`std:${f}`, `Standard: ${f.replace('.md', '')}`, `~/.aiox-core/docs/standards/${f}`, md));
      }
    }
    // READMEs dos subsistemas do core
    const coreDir = path.join(AIOX_CORE, 'core');
    if (fs.existsSync(coreDir)) {
      for (const sub of fs.readdirSync(coreDir)) {
        const md = readIf(path.join(coreDir, sub, 'README.md'));
        if (md) docs.push(...chunkMarkdown(`core-sub:${sub}`, `Subsistema core: ${sub}`, `~/.aiox-core/core/${sub}/README.md`, md));
      }
    }
  }

  // ── 2. ~/squads locais ──────────────────────────────────────
  if (fs.existsSync(SQUADS_DIR)) {
    sources.push('~/squads (local)');
    for (const squad of fs.readdirSync(SQUADS_DIR)) {
      const sdir = path.join(SQUADS_DIR, squad);
      if (!fs.statSync(sdir).isDirectory()) continue;
      const yml = readIf(path.join(sdir, 'squad.yaml')) || readIf(path.join(sdir, 'squad.yml'));
      let meta: any = {};
      if (yml) { try { meta = YAML.parse(yml) || {}; } catch { /* yaml inválido */ } }

      const agents = fs.existsSync(path.join(sdir, 'agents'))
        ? fs.readdirSync(path.join(sdir, 'agents')).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
        : [];
      const workflows = fs.existsSync(path.join(sdir, 'workflows'))
        ? fs.readdirSync(path.join(sdir, 'workflows')).filter(f => /\.ya?ml$/.test(f)).map(f => f.replace(/\.ya?ml$/, ''))
        : [];
      const tasksCount = fs.existsSync(path.join(sdir, 'tasks'))
        ? fs.readdirSync(path.join(sdir, 'tasks')).filter(f => f.endsWith('.md')).length
        : 0;

      squadsLocal.push({
        name: squad,
        desc: meta.description || meta.desc || `Squad instalado localmente (${agents.length} agentes, ${tasksCount} tasks).`,
        version: meta.version, agents, workflows, tasksCount, local: true,
      });

      const readme = readIf(path.join(sdir, 'README.md'));
      if (readme) docs.push(...chunkMarkdown(`squad:${squad}:readme`, `Squad ${squad} — README`, `~/squads/${squad}/README.md`, readme).slice(0, 6));

      // primeiras linhas de cada agente (persona/role) como chunk
      for (const ag of agents.slice(0, 20)) {
        const md = readIf(path.join(sdir, 'agents', `${ag}.md`));
        if (md) {
          docs.push({
            id: `squad:${squad}:agent:${ag}`, type: 'agent',
            title: `${squad} / @${ag}`, source: `~/squads/${squad}/agents/${ag}.md`,
            text: md.slice(0, 1200),
          });
        }
      }
    }
  }

  // ── 3. GitHub SynkraAI (complementar) ──────────────────────
  if (REMOTE || (!fs.existsSync(AIOX_CORE) && !fs.existsSync(SQUADS_DIR))) {
    sources.push('github.com/SynkraAI (remoto)');
    const remoteFiles: Array<[string, string, string]> = [
      ['aiox-core', 'README.md', 'aiox-core — README'],
      ['aiox-core', 'docs/GUIDING-PRINCIPLES.md', 'aiox-core — Guiding Principles'],
      ['aiox-core', 'docs/guides/user-guide.md', 'aiox-core — User Guide'],
      ['aiox-core', 'docs/guides/squads-guide.md', 'aiox-core — Squads Guide'],
      ['aiox-core', 'docs/guides/ade-guide.md', 'aiox-core — ADE Guide'],
      ['aiox-squads', 'README.md', 'aiox-squads — README'],
      ['aiox-dashboard', 'README.md', 'aiox-dashboard — README'],
    ];
    for (const [repo, file, title] of remoteFiles) {
      const md = await fetchRaw(repo, file);
      if (md) docs.push(...chunkMarkdown(`gh:${repo}:${file}`, title, `github:SynkraAI/${repo}/${file}`, md));
      else console.log(`  (remoto ausente: ${repo}/${file})`);
    }
  }

  // ── 4. Claude Code docs (always fetched, cache fallback) ────
  const ccDocs = await ingestClaudeCodeDocs();
  docs.push(...ccDocs);
  if (ccDocs.length) sources.push(`code.claude.com (${ccDocs.length} chunks)`);

  // ── merge squads: locais enriquecem/substituem o seed ───────
  const localNames = new Set(squadsLocal.map(s => s.name));
  const squadsGama = seed.squadsGama.filter((s: any) => !localNames.has(s.name));
  const squadsBase = [
    ...squadsLocal,
    ...seed.squadsBase.filter((s: any) => !localNames.has(s.name)),
  ];

  const index = {
    ...seed,
    source: `ingest ${new Date().toISOString().slice(0, 10)} · fontes: ${sources.join(' + ') || 'seed apenas'}`,
    squadsGama,
    squadsBase,
    docs,
  };

  fs.writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify(index, null, 1));
  console.log(`✓ index.json gerado — ${docs.length} chunks de docs, ${squadsLocal.length} squads locais, fontes: ${sources.join(' + ') || 'seed'}`);
}

main().catch(e => { console.error(e); process.exit(1); });
