import { useMemo, useState } from 'react';
import { useApp, GC, useCopy } from '../App';
import { CMD_DESC } from '../data/cmdDesc';

const UNIVERSAL = ['*help', '*guide', '*yolo', '*exit', '*session-info'];

const CLI = [
  ['# saúde da instalação', 'npx aiox-core doctor'],
  ['# corrige warnings automáticos', 'aiox doctor --fix'],
  ['# atualiza core + entity-registry', 'npx aiox-core install --force'],
  ['# novo projeto greenfield', 'npx aiox-core init <nome>'],
  ['# versão, agentes, tasks', 'npx aiox-core info'],
  ['# atualiza o framework', 'npx aiox-core update'],
] as const;

export default function Commands() {
  const { content } = useApp();
  const copy = useCopy();
  const { ai } = useApp();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [aiResults, setAiResults] = useState<{ cmd: string; agent: string; why: string }[] | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  /** copia sempre com o @agente na frente (universal copia só o comando) */
  const copyCmd = (id: string, cmd: string) => copy(id === 'uni' ? cmd : `@${id} ${cmd}`);

  async function askAi() {
    if (!query.trim() || aiBusy) return;
    setAiBusy(true); setAiError(null);
    try {
      const res = await fetch('/api/find-command', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(res.status === 503 ? 'IA não configurada (.env)' : `HTTP ${res.status}`);
      const data = await res.json();
      setAiResults(data.results || []);
    } catch (e: any) {
      setAiError(String(e?.message || e));
    } finally { setAiBusy(false); }
  }

  const all = useMemo(() => [
    ...content.agents.flatMap(a => a.cmds.map(c => ({ cmd: c, persona: a.p, id: a.id, g: a.g, est: !!a.est }))),
    ...UNIVERSAL.map(c => ({ cmd: c, persona: 'universal', id: 'uni', g: 'uni', est: false })),
  ], [content]);

  const q = query.trim().toLowerCase().replace(/^\*/, '');
  const list = all.filter(c => {
    const okFilter = filter === 'all' || c.id === filter || c.id === 'uni';
    const okQuery = !q || c.cmd.toLowerCase().includes(q) || c.persona.toLowerCase().includes(q);
    return okFilter && okQuery;
  });

  return (
    <>
      <p className="eyebrow">Arsenal completo</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Todos os <em>comandos</em>, num lugar</h1>
      <p className="sub">Cada agente expõe comandos com prefixo <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>*</span>. Busca por nome ou filtra por agente pra achar o que precisa na hora.</p>

      <p className="section-h" style={{ marginTop: 'var(--sp-8)' }}>CLI do framework — o motor por fora dos agentes <span className="ln" /></p>
      <div className="cli-grid">
        {CLI.map(([cm, cmd]) => (
          <div key={cmd} className="cmd">
            <button className="copy" onClick={() => copy(cmd)}>copiar</button>
            <span className="cm">{cm}</span>{'\n'}{cmd}
          </div>
        ))}
      </div>

      <p className="section-h" style={{ marginTop: 'var(--sp-6)' }}>Comandos de agente <span className="ln" /></p>
      <div className="cmd-explorer">
        <div className="cmd-search-row">
          <input
            className="cmd-search"
            placeholder='busca normal ou em linguagem natural…  ex.: "comando que salva as últimas alterações no git"'
            value={query}
            onChange={e => { setQuery(e.target.value); setAiResults(null); }}
            onKeyDown={e => { if (e.key === 'Enter' && ai.ai) askAi(); }}
          />
          <button className="ai-find" onClick={askAi} disabled={!ai.ai || aiBusy || !query.trim()} title={ai.ai ? 'perguntar pra IA qual comando faz isso' : 'configure a chave de API no .env'}>
            {aiBusy ? '…' : '✦ IA'}
          </button>
        </div>
        {aiError && <p className="src-note" style={{ color: 'var(--warning)' }}>⚠ {aiError}</p>}
        {aiResults && (
          <div className="ai-cmd-results">
            {aiResults.length === 0
              ? <div className="cmd-empty">a IA não achou um comando certeiro pra isso — tenta reformular</div>
              : aiResults.map((r, i) => (
                <div key={r.agent + r.cmd} className={`ai-cmd-hit${i === 0 ? ' best' : ''}`} onClick={() => copy(`${r.agent} ${r.cmd}`)} title="clique pra copiar">
                  <div className="hit-cmd"><span className="ag">{r.agent}</span> <span className="pfx">{r.cmd}</span>{i === 0 && <span className="best-tag">melhor match</span>}</div>
                  <div className="hit-why">{r.why}</div>
                  <button className="copy" onClick={e => { e.stopPropagation(); copy(`${r.agent} ${r.cmd}`); }}>copiar</button>
                </div>
              ))}
          </div>
        )}
        <div className="cmd-filters">
          {[{ p: 'Todos', id: 'all', g: null as string | null }, ...content.agents.map(a => ({ p: a.p, id: a.id, g: a.g as string | null }))].map(a => (
            <button key={a.id} className="filter" aria-pressed={filter === a.id} onClick={() => setFilter(a.id)}
              style={a.g ? { '--fc': GC[a.g] } as React.CSSProperties : undefined}>
              {a.g && <span className="fdot" />}{a.p}
            </button>
          ))}
        </div>
        <div className="cmd-count">{list.length} comando{list.length !== 1 ? 's' : ''}</div>
        <div className="cmd-list">
          {list.length === 0
            ? <div className="cmd-empty">nenhum comando encontrado pra "{query}"</div>
            : list.map((c, i) => (
              <div key={c.id + c.cmd + i} className="cmd-item" style={{ '--ci': GC[c.g] } as React.CSSProperties} onClick={() => copyCmd(c.id, c.cmd)}>
                <span className="cmd-name">{c.cmd}</span>
                <span className="cmd-owner">{c.est ? '≈ ' : ''}{c.persona}</span>
                <span className="cmd-tip">
                  <b>{c.cmd}</b> · {c.persona === 'universal' ? 'todos os agentes' : `@${c.id}`}
                  <i>{CMD_DESC[c.cmd] || 'Descrição ainda não catalogada — rode *help no agente pra ver a oficial.'}</i>
                  <em>clique pra copiar {c.id === 'uni' ? '' : `→ @${c.id} ${c.cmd}`}</em>
                </span>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
