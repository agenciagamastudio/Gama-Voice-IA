import { useState } from 'react';
import { useApp } from '../App';

type Hit = { name: string; why: string };

/** Campo "Roteamento por IA" reutilizável — pergunta em linguagem natural a um endpoint /api/find-*. */
export default function AiFinder({ endpoint, placeholder, hint, onHits }: {
  endpoint: string;
  placeholder: string;
  hint: string;
  onHits?: (names: string[]) => void;
}) {
  const { ai } = useApp();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!query.trim() || busy) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(res.status === 503 ? 'IA não configurada (.env)' : `HTTP ${res.status}`);
      const data = await res.json();
      setHits(data.results || []);
      onHits?.((data.results || []).map((r: Hit) => r.name));
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setBusy(false); }
  }

  return (
    <div className="ai-route">
      <div className="rt-lbl">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: ai.ai ? 'var(--primary)' : 'var(--text-3)' }} />
        Roteamento por IA {!ai.ai && '· offline (configure o .env)'}
      </div>
      <div className="row">
        <input
          value={query}
          placeholder={placeholder}
          disabled={!ai.ai || busy}
          onChange={e => { setQuery(e.target.value); setHits(null); onHits?.([]); }}
          onKeyDown={e => { if (e.key === 'Enter') run(); }}
        />
        <button onClick={run} disabled={!ai.ai || busy || !query.trim()}>{busy ? 'roteando…' : 'rotear'}</button>
      </div>
      <p className="hint-txt">{hint}</p>
      {error && <p className="hint-txt" style={{ color: 'var(--warning)' }}>⚠ {error}</p>}
      {hits && (
        <div className="ai-cmd-results" style={{ marginBottom: 0 }}>
          {hits.length === 0
            ? <div className="cmd-empty">a IA não achou um match certeiro — tenta reformular</div>
            : hits.map((h, i) => (
              <div key={h.name} className={`ai-cmd-hit${i === 0 ? ' best' : ''}`}
                onClick={() => document.getElementById(`card-${h.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                title="clique pra ir até o card">
                <div className="hit-cmd"><span className="pfx">{h.name}</span>{i === 0 && <span className="best-tag">melhor match</span>}</div>
                <div className="hit-why">{h.why}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
