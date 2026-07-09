import { useApp } from '../App';

const LEVELS = [
  { dots: 1, name: 'Interativo', cmd: '*develop-interactive', d: 'O Dex para em cada passo e espera teu ok. Bom pra código sensível ou pra aprender o fluxo.' },
  { dots: 2, name: 'Padrão', cmd: '*develop', d: 'Roda a story inteira, parando só nos checkpoints. O modo do dia a dia.' },
  { dots: 3, name: 'YOLO', cmd: '*develop-yolo', d: 'Sem confirmações. Usa quando a story é bem especificada e o risco é baixo.' },
  { dots: 4, name: 'Autônomo (ADE)', cmd: '*build-autonomous', d: 'O motor completo: executa, se auto-critica, recupera de falha e só te chama no fim.' },
];

export default function Ade() {
  const { content } = useApp();
  return (
    <>
      <p className="eyebrow">Motor autônomo</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>ADE — o que faz o AIOX <em>rodar sozinho</em></h1>
      <p className="sub">O Autonomous Development Engine é o conjunto de subsistemas que deixa os agentes trabalharem sem tua mão o tempo todo: isolam trabalho, se recuperam de falhas, criticam o próprio código e lembram do contexto entre sessões. Cada peça abaixo mostra a prova real dela na tua instalação.</p>
      <p className="section-h" style={{ marginTop: 'var(--sp-8)' }}>Níveis de autonomia — quanto você solta a rédea <span className="ln" /></p>
      <div className="auto-strip">
        {LEVELS.map(l => (
          <div key={l.name} className="alevel">
            <div className="adots">{[1, 2, 3, 4].map(i => <span key={i} className={`adot${i <= l.dots ? ' on' : ''}`} />)}</div>
            <h4>{l.name}</h4><span className="acmd">{l.cmd}</span><p>{l.d}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 var(--sp-4)' }}>Vale pra qualquer agente: <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>*yolo</span> liga o modo sem-confirmação e <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>*guide</span> te explica o agente por dentro.</p>

      <p className="section-h" style={{ marginTop: 'var(--sp-6)' }}>Subsistemas do motor <span className="ln" /></p>
      <div className="ade-grid">
        {content.ade.map(e => (
          <article key={e.name} className={`epic${e.hl ? ' hl' : ''}`}>
            <div className="en">SUBSISTEMA</div>
            <h3>{e.name}</h3>
            <p>{e.desc}</p>
            <div className={`proof${e.ok ? ' ok' : ''}`}>{e.ok ? '✓ confirmado' : '○ documentação'} · <code>{e.proof}</code></div>
          </article>
        ))}
      </div>
      <div className="callout" style={{ marginTop: 'var(--sp-6)' }}><b>Leitura:</b> a estrutura vem da documentação do AIOX. Os selos <span style={{ color: 'var(--success)' }}>✓ confirmado</span> foram checados no recon (config, arquivos e comandos reais); os demais fazem parte do framework e podem variar por versão.</div>
    </>
  );
}
