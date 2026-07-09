import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { aiRouter } from './ai/routes.js';
import { loadIndex, search } from './content/search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '2mb' }));

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
