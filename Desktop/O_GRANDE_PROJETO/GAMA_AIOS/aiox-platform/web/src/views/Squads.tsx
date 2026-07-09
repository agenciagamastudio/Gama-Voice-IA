import { useState } from 'react';
import { useApp } from '../App';
import type { Squad } from '../lib/api';
import AiFinder from '../components/AiFinder';

function SquadCard({ s, gama, hit }: { s: Squad; gama: boolean; hit?: boolean }) {
  return (
    <div id={`card-${s.name}`} className={`squad${gama ? ' gama' : ''}${hit ? ' ai-hit' : ''}`}>
      <div className="sname">{s.name}{s.version ? <span style={{ color: 'var(--text-faint)', fontSize: 10, marginLeft: 6 }}>v{s.version}</span> : null}</div>
      <div className="sdesc">{s.desc}</div>
      {(s.agents?.length || s.tasksCount) ? (
        <div className="sx">
          {s.agents?.length ? <span><b>{s.agents.length}</b> agentes</span> : null}
          {s.tasksCount ? <span><b>{s.tasksCount}</b> tasks</span> : null}
          {s.workflows?.length ? <span><b>{s.workflows.length}</b> workflows</span> : null}
        </div>
      ) : null}
      <span className="stag">{gama ? 'teu · GAMA' : s.local ? 'instalado · ~/squads' : 'base'}</span>
    </div>
  );
}

export default function Squads() {
  const { content } = useApp();
  const [aiHits, setAiHits] = useState<string[]>([]);
  return (
    <>
      <p className="eyebrow">Equipes modulares</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Squads — <em>tripulações sob medida</em></h1>
      <p className="sub">Um squad é uma equipe de agentes empacotada pra um domínio específico. Além dos {content.agents.length} agentes base, tu já tem squads instalados — vários customizados da GAMA. O Craft (squad-creator) desenha, valida e publica novos.</p>

      <AiFinder
        endpoint="/api/find-squad"
        placeholder='ex.: "preciso pesquisar a fundo um mercado antes de investir"'
        hint="Descreve a necessidade — a IA aponta o squad certo (ou sugere criar um novo com o Craft)."
        onHits={setAiHits}
      />

      {content.squadsGama.length > 0 && (
        <>
          <p className="section-h" style={{ marginTop: 'var(--sp-10)' }}>Teus squads — GAMA <span className="ln" /></p>
          <div className="squad-grid">{content.squadsGama.map(s => <SquadCard key={s.name} s={s} gama hit={aiHits.includes(s.name)} />)}</div>
        </>
      )}

      <p className="section-h" style={{ marginTop: 'var(--sp-10)' }}>Squads instalados / base <span className="ln" /></p>
      <div className="squad-grid">{content.squadsBase.map(s => <SquadCard key={s.name} s={s} gama={false} hit={aiHits.includes(s.name)} />)}</div>

      <div className="callout" style={{ marginTop: 'var(--sp-8)' }}><b>Nota:</b> squads marcados "instalado" foram lidos direto de <b>~/squads</b> pela ingestão (rode <code>npm run ingest</code> pra atualizar). Rode <b>@squad-creator *list-squads</b> pros detalhes oficiais, ou <b>*design-squad</b> pra criar um novo.</div>
    </>
  );
}
