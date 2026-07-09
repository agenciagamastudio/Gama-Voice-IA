import { useState } from 'react';
import { useApp, GC, useCopy } from '../App';
import AiFinder from '../components/AiFinder';

export const WF_COLOR: Record<string, string> = { greenfield: 'var(--primary)', brownfield: 'var(--info)', cycle: 'var(--success)', quality: 'var(--warning)', infra: 'var(--text-3)' };
export const WF_COLOR_DIM: Record<string, string> = { greenfield: 'var(--primary-dim)', brownfield: 'var(--info-dim)', cycle: 'var(--success-dim)', quality: 'var(--warning-dim)', infra: 'rgba(150,150,150,.12)' };
export const WF_LABEL: Record<string, string> = { greenfield: 'Greenfield', brownfield: 'Brownfield', cycle: 'Ciclo', quality: 'Qualidade', infra: 'Infra' };

const FILTERS = [['all', 'Todas'], ['greenfield', 'Greenfield'], ['brownfield', 'Brownfield'], ['cycle', 'Ciclos de dev'], ['quality', 'Qualidade'], ['infra', 'Infra']] as const;

export default function Workflows() {
  const { content } = useApp();
  const [filter, setFilter] = useState('all');
  const [aiHits, setAiHits] = useState<string[]>([]);
  const copy = useCopy();
  /** prompt pronto pra colar no Claude Code na pasta do projeto */
  const wfPrompt = (name: string) => `@aiox-master\n*run-workflow ${name}`;
  const list = content.workflows.filter(w => filter === 'all' || w.cat === filter);
  return (
    <>
      <p className="eyebrow">Rotas disponíveis</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>{content.workflows.length} <em>trajetórias</em> prontas</h1>
      <p className="sub">Cada workflow é um roteiro que os agentes seguem sozinhos. A cor marca a família; a trilha mostra a ordem da tripulação.</p>

      <AiFinder
        endpoint="/api/find-workflow"
        placeholder='ex.: "quero adicionar uma tela nova num app que já está em produção"'
        hint="Descreve a situação — a IA aponta o workflow certo e explica o porquê. Clica no resultado pra ir até o card."
        onHits={names => { setAiHits(names); if (names.length) setFilter('all'); }}
      />

      <div className="filters">
        {FILTERS.map(([cat, label]) => (
          <button key={cat} className="filter" aria-pressed={filter === cat} onClick={() => setFilter(cat)}>{label}</button>
        ))}
      </div>
      <div className="wf-grid">
        {list.map(w => (
          <article
            key={w.name} id={`card-${w.name}`}
            className={`wf clickable${aiHits.includes(w.name) ? ' ai-hit' : ''}`}
            style={{ '--cat': WF_COLOR[w.cat], '--cat-dim': WF_COLOR_DIM[w.cat] } as React.CSSProperties}
            onClick={() => copy(wfPrompt(w.name))}
            title={`clique pra copiar:\n${wfPrompt(w.name)}`}
          >
            <span className="cat-tag">{WF_LABEL[w.cat]}</span>
            <span className="wf-copy-hint">⧉ copiar prompt</span>
            <h3>{w.name}</h3>
            <div className="file">{w.file}</div>
            <p className="desc">{w.desc}</p>
            <div className="mini-track">
              {w.track.map((n, i) => {
                const ag = content.agents.find(a => a.p === n[0]);
                return (
                  <span key={i} className="mini">
                    <span className="d" style={{ background: GC[n[2]] }} />
                    {n[0]}{ag && <span className="mini-id">@{ag.id}</span>}
                  </span>
                );
              })}
            </div>
            <p className="when"><b>Quando:</b> {w.when}</p>
          </article>
        ))}
      </div>
    </>
  );
}
