import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { aiRouter } from './ai/routes.js';
import { modelStatus } from './ai/provider.js';
import { loadIndex, search } from './content/search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '2mb' }));

/* ── rate limit em memória (protege a cota de IA na rede local) ── */
const RL_WINDOW_MS = 60_000;
const RL_MAX = 30; // POSTs de IA por IP por minuto
const rlHits = new Map<string, number[]>();
app.use('/api', (req, res, next) => {
  if (req.method !== 'POST') { next(); return; }
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const hits = (rlHits.get(ip) || []).filter(t => now - t < RL_WINDOW_MS);
  if (hits.length >= RL_MAX) {
    res.status(429).json({ error: 'rate_limited', retryAfterSecs: Math.ceil((hits[0] + RL_WINDOW_MS - now) / 1000) });
    return;
  }
  hits.push(now);
  rlHits.set(ip, hits);
  next();
});

const startedAt = Date.now();

app.get('/api/health', (_req, res) => {
  let docs = 0, indexOk = true;
  try { docs = loadIndex().docs.length; } catch { indexOk = false; }
  res.json({
    ok: true,
    uptimeSecs: Math.floor((Date.now() - startedAt) / 1000),
    index: { ok: indexOk, docs },
    models: modelStatus(),
  });
});

/* ── reingestão sob demanda (botão na view Sistema) ── */
let ingesting = false;
app.post('/api/reingest', (_req, res) => {
  if (ingesting) { res.status(409).json({ error: 'ingest_em_andamento' }); return; }
  ingesting = true;
  const t0 = Date.now();
  execFile('npx', ['tsx', path.resolve(__dirname, 'content/ingest.ts')], {
    cwd: path.resolve(__dirname, '..'), shell: true, timeout: 180_000,
  }, (err, stdout, stderr) => {
    ingesting = false;
    if (err) { res.status(500).json({ error: String(stderr || err.message).slice(0, 500) }); return; }
    let docs = 0;
    try { docs = loadIndex().docs.length; } catch { /* index recarrega no próximo load */ }
    res.json({ ok: true, secs: Math.round((Date.now() - t0) / 1000), docs, log: String(stdout).slice(-400) });
  });
});

app.get('/api/content', (_req, res) => {
  const idx = loadIndex();
  // não manda os chunks inteiros pro front — só metadados + entidades
  const { docs, ...rest } = idx;
  res.json({ ...rest, docsCount: docs.length });
});

app.get('/api/search', (req, res) => {
  res.json(search(String(req.query.q || ''), Number(req.query.k) || 8));
});

app.use('/api', aiRouter);

// produção: serve o build do Vite
const dist = path.resolve(__dirname, '../dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => console.log(`⚡ AIOX Platform server em http://localhost:${PORT}`));
