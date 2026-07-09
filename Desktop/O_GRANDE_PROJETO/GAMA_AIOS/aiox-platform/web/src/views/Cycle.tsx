import { useApp, GC } from '../App';

export default function Cycle() {
  const { content } = useApp();
  return (
    <>
      <p className="eyebrow">Ciclo &amp; governança</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Como uma história <em>vira código</em></h1>
      <p className="sub">Toda tarefa vira uma "story" que percorre estados fixos, passando de agente em agente através de arquivos. Cada um sabe o que recebe e o que entrega — e certas ações são exclusivas de certos agentes.</p>

      <p className="section-h" style={{ marginTop: 'var(--sp-8)' }}>O ciclo de vida de uma story <span className="ln" /></p>
      <div className="lifecycle">
        {content.lifecycle.map((s: any, i: number) => (
          <div key={s.st} className="stage" style={{ '--sc': GC[s.g] } as React.CSSProperties}>
            <div className="snum">ESTADO {String(i + 1).padStart(2, '0')}</div>
            <div className="st">{s.st}</div>
            <div className="sag">@{s.id} · {s.ag}</div>
            <span className="scmd">{s.cmd}</span>
            <div className="sd">{s.d}</div>
          </div>
        ))}
      </div>

      <p className="section-h" style={{ marginTop: 'var(--sp-10)' }}>Matriz de autoridade — quem pode o quê <span className="ln" /></p>
      <div className="auth-grid">
        {content.authority.map((a: any) => (
          <div key={a.id} className="auth-row">
            <div className="ar-agent">{a.ag}<span className="ai">@{a.id}</span></div>
            <div className="ar-can">{a.can}</div>
            <div className={`ar-excl${a.excl === '—' ? ' none' : ''}`}>{a.excl === '—' ? 'sem exclusiva' : 'só ele · *' + a.excl}</div>
          </div>
        ))}
      </div>

      <p className="section-h" style={{ marginTop: 'var(--sp-10)' }}>Quality gates — o que o Quinn checa antes de liberar <span className="ln" /></p>
      <div className="gate-row">
        {content.gates.map((g: any) => (
          <div key={g.c} className="gate-chip"><span className="gi">◆</span> {g.n} <code>{g.c}</code></div>
        ))}
      </div>
    </>
  );
}
