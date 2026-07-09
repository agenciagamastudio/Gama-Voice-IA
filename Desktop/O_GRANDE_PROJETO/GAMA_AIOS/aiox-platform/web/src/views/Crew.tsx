import { useState } from 'react';
import { useApp, GC } from '../App';

export default function Crew() {
  const { content } = useApp();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <>
      <p className="eyebrow">Tripulação de missão</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Os <em>{content.agents.length} nomes</em> que fazem o trabalho</h1>
      <p className="sub">Cada agente tem persona, autoridade e comandos próprios (prefixo <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>*</span>). Clique em +N pra ver o arsenal completo.</p>

      <div className="crew-legend">
        <div className="lg"><span className="sw" style={{ background: 'var(--info)' }} /> Planejar</div>
        <div className="lg"><span className="sw" style={{ background: 'var(--primary)' }} /> Preparar &amp; construir</div>
        <div className="lg"><span className="sw" style={{ background: 'var(--warning)' }} /> Garantir</div>
        <div className="lg"><span className="sw" style={{ background: 'var(--success)' }} /> Orquestrar &amp; operar</div>
      </div>
      <div className="crew-grid">
        {content.agents.map(a => {
          const isOpen = !!expanded[a.id];
          const shown = isOpen ? a.cmds : a.cmds.slice(0, 5);
          const hidden = a.cmds.length - 5;
          return (
            <article key={a.id} className="agent" style={{ '--gc': GC[a.g] } as React.CSSProperties}>
              <div className="halo" />
              <div className="persona"><h3>{a.p}</h3><span className="id">@{a.id}</span>{a.est && <span className="est">≈ estimado</span>}</div>
              <p className="role">{a.role}</p>
              {a.auth && <div className="authority">{a.auth}</div>}
              <div className="when"><b>Quando chamar</b>{a.when}</div>
              <div className={`cmds${isOpen ? ' expanded' : ''}`}>
                {shown.map(c => <span key={c} className="cchip">{c}</span>)}
                {!isOpen && hidden > 0 && (
                  <span className="cchip more" onClick={() => setExpanded(e => ({ ...e, [a.id]: true }))}>+{hidden}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
