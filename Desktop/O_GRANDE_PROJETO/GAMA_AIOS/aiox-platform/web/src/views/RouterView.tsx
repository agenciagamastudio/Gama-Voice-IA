import { useEffect, useState } from 'react';
import { useApp, GC, useCopy } from '../App';
import { routeMission, generateCommand, type RouteResult } from '../lib/api';
import { WF_COLOR, WF_COLOR_DIM, WF_LABEL } from './Workflows';

type Trail = {
  badge: [string, string, string];
  title: string; desc: string; callout?: string;
  steps: { t: string; who: string; d: string; c?: string }[];
};

const TRAILS: Record<string, Trail> = {
  first: { badge: ['Onboarding', 'var(--primary)', 'var(--primary-dim)'], title: 'Primeira missão — do doctor ao push',
    desc: 'A trilha completa pra sair do "não uso 1%" e fechar teu primeiro ciclo real no AIOX, de ponta a ponta.',
    callout: 'Dica dogfood: usa o GAMA_COCKPIT como cobaia greenfield — construir a ferramenta É a primeira missão.',
    steps: [
      { t: 'Sanear a engine', who: 'terminal', d: 'Corrige os warnings do doctor (rules, settings) e atualiza o entity-registry parado.', c: 'aiox doctor --fix\nnpx aiox-core install --force' },
      { t: 'Escolher a cobaia', who: 'você', d: 'Um projeto parado com brief pronto. Um greenfield simples destrava mais rápido que um brownfield gigante.' },
      { t: 'Rotear', who: 'este painel', d: 'Volta na missão "Tocar um projeto", responde as 3 coordenadas e pega o workflow certo.' },
      { t: 'Disparar', who: 'Orion', d: 'Ativa o mestre no Claude Code e solta o workflow. A tripulação assume.', c: '@aiox-master\n*run-workflow greenfield-fullstack' },
      { t: 'Acompanhar', who: 'Orion · Pax', d: 'Vê o estado geral e o mapa das histórias enquanto os agentes trabalham.', c: '*status\n@po *stories-index' },
      { t: 'Fechar o ciclo', who: 'Quinn · Gage', d: 'Gate de qualidade e entrega — só o Gage tem autoridade de push.', c: '@qa *gate\n@devops *push' },
    ] },
  maint: { badge: ['Manutenção', 'var(--success)', 'var(--success-dim)'], title: 'Sanear o framework',
    desc: 'Zera os warnings do teu último doctor (6 WARN / 0 FAIL em 30-jun) e deixa a engine afiada.',
    callout: 'O entity-registry alimenta a inteligência de código (IDS) que os agentes consultam — parado significa agentes enxergando teu código velho.',
    steps: [
      { t: 'Correções automáticas', who: 'terminal', d: 'Regras faltando (story-lifecycle, agent-memory-imports) e deny rules do settings.', c: 'aiox doctor --fix' },
      { t: 'Atualizar o registry', who: 'terminal', d: 'Reindexar as 821 entidades — resolve o warning de 704h.', c: 'npx aiox-core install --force' },
      { t: 'Git hooks (opcional)', who: 'terminal', d: 'Instala o husky pra validações em commit.', c: 'npx husky init' },
      { t: 'Conferir', who: 'terminal', d: 'Roda o doctor de novo — a meta é zerar os WARN.', c: 'npx aiox-core doctor' },
    ] },
  squad: { badge: ['Squads', 'var(--primary)', 'var(--primary-dim)'], title: 'Criar um squad com o Craft',
    desc: 'Uma equipe modular de agentes pro teu domínio — foi assim que nasceram teus squads GAMA.',
    steps: [
      { t: 'Desenhar', who: 'Craft', d: 'O Craft entrevista você e desenha papéis, tasks e fluxo do squad.', c: '@squad-creator\n*design-squad' },
      { t: 'Gerar', who: 'Craft', d: 'Cria a estrutura completa (config, agents, tasks, templates).', c: '*create-squad' },
      { t: 'Validar', who: 'Craft', d: 'Checa integridade e conformidade antes de usar.', c: '*validate-squad' },
      { t: 'Confirmar', who: 'Craft', d: 'Lista os squads instalados — o novo deve aparecer.', c: '*list-squads' },
    ] },
};
const RESUME_TRAILS: Record<string, Trail> = {
  stuck: { badge: ['Retomada', 'var(--info)', 'var(--info-dim)'], title: 'Retomar um build parado',
    desc: 'O Dex guarda o estado do build — dá pra ver onde parou e continuar sem refazer.',
    steps: [
      { t: 'Ver onde parou', who: 'Dex', d: 'Estado atual do build autônomo.', c: '@dev *build-status' },
      { t: 'Ler o histórico', who: 'Dex', d: 'O log do que foi feito e onde travou.', c: '*build-log' },
      { t: 'Retomar', who: 'Dex', d: 'Continua exatamente do ponto onde parou.', c: '*build-resume' },
    ] },
  broke: { badge: ['Retomada', 'var(--info)', 'var(--info-dim)'], title: 'Reverter e tentar de novo',
    desc: 'O Recovery System registra tentativas e volta ao último ponto seguro — falhar não custa o projeto.',
    steps: [
      { t: 'Registrar a tentativa', who: 'Dex', d: 'Documenta o que falhou pra não repetir o erro.', c: '@dev *track-attempt' },
      { t: 'Rollback', who: 'Dex', d: 'Volta ao último estado estável.', c: '*rollback' },
      { t: 'Nova investida', who: 'Dex', d: 'Roda de novo, agora com o aprendizado registrado.', c: '*develop' },
    ] },
  lost: { badge: ['Retomada', 'var(--info)', 'var(--info-dim)'], title: 'Reencontrar o fio do projeto',
    desc: 'Quando nem você sabe em que pé está: o estado vive nos arquivos de story — é só pedir o mapa.',
    steps: [
      { t: 'Visão geral', who: 'Orion', d: 'Estado do projeto pelo mestre.', c: '@aiox-master *status' },
      { t: 'Mapa das histórias', who: 'Pax', d: 'Índice de todas as stories e seus estados.', c: '@po *stories-index' },
      { t: 'Revisar o backlog', who: 'Pax', d: 'O que está pendente e em que ordem.', c: '*backlog-review' },
      { t: 'Voltar ao ciclo', who: 'River → Dex', d: 'Retoma pelo story-development-cycle a partir da próxima story.' },
    ] },
};
const QUALITY_TRAILS: Record<string, Trail> = {
  review: { badge: ['Qualidade', 'var(--warning)', 'var(--warning-dim)'], title: 'Loop de revisão (qa-loop)',
    desc: 'Quinn aponta, Dex corrige, repete até passar — o loop endurece o código sem você arbitrar.',
    steps: [
      { t: 'Revisar', who: 'Quinn', d: 'Review completo do que foi feito.', c: '@qa *review' },
      { t: 'Corrigir', who: 'Dex', d: 'Aplica exatamente o que o QA pediu.', c: '@dev *apply-qa-fixes' },
      { t: 'Gate', who: 'Quinn', d: 'Passa/reprova formalmente.', c: '@qa *gate' },
    ] },
  security: { badge: ['Qualidade', 'var(--warning)', 'var(--warning-dim)'], title: 'Varredura de segurança',
    desc: 'As checagens que o Quinn roda antes de qualquer entrega sensível.',
    steps: [
      { t: 'Segurança', who: 'Quinn', d: 'Varre vulnerabilidades no código.', c: '@qa *security-check' },
      { t: 'Dependências', who: 'Quinn', d: 'Valida bibliotecas e versões.', c: '*validate-libraries' },
      { t: 'Banco', who: 'Quinn', d: 'Se mexeu em schema: valida as migrations.', c: '*validate-migrations' },
    ] },
  release: { badge: ['Qualidade', 'var(--warning)', 'var(--warning-dim)'], title: 'Fechar e entregar',
    desc: 'O caminho formal até o push — passando pela única autoridade que pode apertar o botão.',
    steps: [
      { t: 'Gate final', who: 'Quinn', d: 'Aprovação formal de qualidade.', c: '@qa *gate' },
      { t: 'Pré-voo', who: 'Gage', d: 'Checagens de pre-push (lint, testes, versão).', c: '@devops *pre-push' },
      { t: 'Push', who: 'Gage', d: 'A entrega em si — autoridade exclusiva dele.', c: '*push' },
      { t: 'Release (opcional)', who: 'Gage', d: 'Versiona e publica.', c: '*release' },
    ] },
};

const Q0 = [
  ['project', 'Tocar um projeto — novo ou existente'],
  ['first', 'Primeira missão guiada — destravar o AIOX'],
  ['resume', 'Destravar trabalho parado'],
  ['quality', 'Garantir qualidade / liberar entrega'],
  ['maint', 'Sanear o framework (doctor)'],
  ['squad', 'Criar um squad novo'],
] as const;

function CmdText({ text }: { text: string }) {
  const parts = text.split(/(@[\w-]+|\*[\w-]+|#[^\n]*)/g);
  return <>{parts.map((p, i) =>
    p.startsWith('@') ? <span key={i} className="ag">{p}</span>
    : p.startsWith('*') ? <span key={i} className="pfx">{p}</span>
    : p.startsWith('#') ? <span key={i} className="cm">{p}</span>
    : p)}</>;
}

function CopyCmd({ text, children }: { text: string; children: React.ReactNode }) {
  const copy = useCopy();
  return <div className="cmd"><button className="copy" onClick={() => copy(text)}>copiar</button>{children}</div>;
}

function TrailBlock({ t }: { t: Trail }) {
  return (
    <>
      <div className="rt-head"><span className="rt-badge" style={{ color: t.badge[1], background: t.badge[2] }}>{t.badge[0]}</span><h2>{t.title}</h2></div>
      <p className="rt-desc">{t.desc}</p>
      {t.callout && <div className="callout"><b>Nota:</b> {t.callout}</div>}
      <div className="track-h">Trilha — nesta ordem</div>
      <div className="trail">
        {t.steps.map((s, i) => (
          <div key={i} className="tstep" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="tnum">{String(i + 1).padStart(2, '0')}</div>
            <div>
              <h4>{s.t}<span className="twho">· {s.who}</span></h4>
              <p>{s.d}</p>
              {s.c && <TrailCmd text={s.c} />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TrailCmd({ text }: { text: string }) {
  const copy = useCopy();
  return <div className="tcmd"><button className="copy" onClick={() => copy(text)}>copiar</button><CmdText text={text} /></div>;
}

export default function RouterView() {
  const { content, ai, routerMission } = useApp();
  const [answers, setAnswers] = useState<Record<number, string | null>>({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null });
  const [aiInput, setAiInput] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState<RouteResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [genPrompt, setGenPrompt] = useState<string | null>(null);
  const [genBusy, setGenBusy] = useState(false);

  useEffect(() => {
    if (routerMission === '__maint__') setAnswers(a => ({ ...a, 0: 'maint' }));
  }, [routerMission]);

  const wfByName = (n: string) => content.workflows.find(w => w.name === n);

  function pick(q: number, v: string) {
    setAiResult(null); setGenPrompt(null);
    setAnswers(prev => {
      const next = { ...prev, [q]: v };
      if (q === 0) { next[1] = next[2] = next[3] = next[4] = next[5] = null; }
      if (q === 1) { next[2] = next[3] = null; }
      return next;
    });
  }

  const m = answers[0];
  type Res = { kind: 'wf'; wf: string; discovery: boolean } | { kind: 'trail'; trail: Trail } | { pending: true; msg?: string } | null;
  function computeResult(): Res {
    if (aiResult) return null;
    if (!m) return null;
    if (m === 'project') {
      const a1 = answers[1], a2 = answers[2];
      if (!a1 || !a2) return { pending: true };
      if (a1 === 'green') return { kind: 'wf', wf: ({ fullstack: 'greenfield-fullstack', service: 'greenfield-service', ui: 'greenfield-ui' } as any)[a2], discovery: false };
      if (!answers[3]) return { pending: true, msg: 'Código existente precisa da coordenada 03 pra rotear certo.' };
      return { kind: 'wf', wf: ({ fullstack: 'brownfield-fullstack', service: 'brownfield-service', ui: 'brownfield-ui' } as any)[a2], discovery: answers[3] === 'nodoc' };
    }
    if (m === 'resume') { if (!answers[4]) return { pending: true, msg: 'Falta a coordenada: qual a situação?' }; return { kind: 'trail', trail: RESUME_TRAILS[answers[4]!] }; }
    if (m === 'quality') { if (!answers[5]) return { pending: true, msg: 'Falta a coordenada: o que garantir?' }; return { kind: 'trail', trail: QUALITY_TRAILS[answers[5]!] }; }
    return { kind: 'trail', trail: TRAILS[m] };
  }
  const res = computeResult();

  async function runAiRoute() {
    if (!aiInput.trim() || aiBusy) return;
    setAiBusy(true); setAiError(null); setGenPrompt(null);
    setAnswers({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null });
    try { setAiResult(await routeMission(aiInput)); }
    catch (e: any) { setAiError(e?.message === 'no_api_key' ? 'IA não configurada — preencha o .env.' : String(e?.message || e)); }
    finally { setAiBusy(false); }
  }

  async function runGenerate(goal: string, wf?: string | null, agents?: string[]) {
    setGenBusy(true);
    try { setGenPrompt(await generateCommand(goal, wf, agents)); }
    catch (e: any) { setGenPrompt(`⚠ erro ao gerar: ${e?.message || e}`); }
    finally { setGenBusy(false); }
  }

  function reset() {
    setAnswers({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null });
    setAiResult(null); setGenPrompt(null); setAiError(null);
  }

  const Opt = ({ q, v, label }: { q: number; v: string; label: string }) => (
    <button className="opt" aria-pressed={answers[q] === v} onClick={() => pick(q, v)}><span className="dot" /> {label}</button>
  );

  const showResult = aiResult || (res && !('pending' in res && res.pending));

  return (
    <>
      <p className="eyebrow">Roteador de missão</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Diga a situação. Eu digo o <em>caminho</em>.</h1>
      <p className="sub">Descreve a missão com tuas palavras (IA) ou responde as coordenadas — o painel devolve a trilha exata: workflow, tripulação e comandos prontos pra colar no Claude Code.</p>

      <div className="ai-route">
        <div className="rt-lbl"><span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: ai.ai ? 'var(--primary)' : 'var(--text-3)' }} /> Roteamento por IA {!ai.ai && '· offline (configure o .env)'}</div>
        <div className="row">
          <input
            value={aiInput}
            placeholder='ex.: "quero adicionar login social num app React que já existe"'
            disabled={!ai.ai || aiBusy}
            onChange={e => setAiInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runAiRoute(); }}
          />
          <button onClick={runAiRoute} disabled={!ai.ai || aiBusy || !aiInput.trim()}>{aiBusy ? 'roteando…' : 'rotear'}</button>
        </div>
        <p className="hint-txt">A IA entende a missão, escolhe o workflow real e monta a sequência — validado contra o catálogo (nunca inventa comando).</p>
        {aiError && <p className="hint-txt" style={{ color: 'var(--warning)' }}>⚠ {aiError}</p>}
      </div>

      <div className="router">
        <div className="panel quiz">
          <div className="q" id="q0">
            <div className="qn">MISSÃO</div>
            <div className="qt">O que te traz aqui?</div>
            <div className="opts">{Q0.map(([v, label]) => <Opt key={v} q={0} v={v} label={label} />)}</div>
          </div>
          <div className={`q branch b-project${m === 'project' ? ' on' : ' locked'}`}>
            <div className="qn">COORDENADA 01</div>
            <div className="qt">O projeto já tem código?</div>
            <div className="opts"><Opt q={1} v="green" label="Começar do zero" /><Opt q={1} v="brown" label="Já existe código" /></div>
          </div>
          <div className={`q branch b-project${m === 'project' && answers[1] ? ' on' : ' locked'}`}>
            <div className="qn">COORDENADA 02</div>
            <div className="qt">Qual o escopo?</div>
            <div className="opts">
              <Opt q={2} v="fullstack" label="App completo (front + back)" />
              <Opt q={2} v="service" label="Só backend / API / serviço" />
              <Opt q={2} v="ui" label="Só interface / front" />
            </div>
          </div>
          {m === 'project' && answers[1] === 'brown' && (
            <div className={`q branch b-project${answers[2] ? ' on' : ' locked'}`}>
              <div className="qn">COORDENADA 03</div>
              <div className="qt">O código já está documentado?</div>
              <div className="opts"><Opt q={3} v="doc" label="Sim, tem docs/arquitetura" /><Opt q={3} v="nodoc" label="Não, é território novo pros agentes" /></div>
            </div>
          )}
          <div className={`q branch b-resume${m === 'resume' ? ' on' : ' locked'}`}>
            <div className="qn">COORDENADA 01</div>
            <div className="qt">Qual a situação?</div>
            <div className="opts">
              <Opt q={4} v="stuck" label="Build parou no meio / perdi o ponto" />
              <Opt q={4} v="broke" label="Deu errado — quero reverter" />
              <Opt q={4} v="lost" label="Perdi o fio do projeto inteiro" />
            </div>
          </div>
          <div className={`q branch b-quality${m === 'quality' ? ' on' : ' locked'}`}>
            <div className="qn">COORDENADA 01</div>
            <div className="qt">O que quer garantir?</div>
            <div className="opts">
              <Opt q={5} v="review" label="Revisar código recém-feito" />
              <Opt q={5} v="security" label="Segurança e dependências" />
              <Opt q={5} v="release" label="Fechar e entregar (gate → push)" />
            </div>
          </div>
        </div>

        <div className="panel result">
          {!showResult ? (
            <div className="result-empty">
              <div className="scan" />
              <h3>{res && 'pending' in res && res.msg ? 'Mais uma coordenada' : 'Aguardando coordenadas'}</h3>
              <p>{(res && 'pending' in res && res.msg) || 'Responda ao lado ou descreva a missão pra IA acima. O caminho e a tripulação aparecem aqui.'}</p>
            </div>
          ) : aiResult ? (
            <div>
              <div className="rt-head">
                <span className="rt-badge" style={{ color: 'var(--primary)', background: 'var(--primary-dim)' }}>Roteado por IA</span>
                <h2>{aiResult.workflow || 'Trilha customizada'}</h2>
              </div>
              <p className="rt-desc">{aiResult.rationale}</p>
              {aiResult.discovery && <div className="callout"><b>Atenção:</b> comece pelo <b>brownfield-discovery</b> — os agentes ainda não conhecem esse código.</div>}
              {aiResult.agents.length > 0 && (
                <div className="track" style={{ marginBottom: 'var(--sp-4)' }}>
                  {aiResult.agents.map((a, i) => {
                    const ag = content.agents.find(x => '@' + x.id === (a.startsWith('@') ? a : '@' + a));
                    return (
                      <span key={a + i}>
                        {i > 0 && <span className="sep">→</span>}
                        <span className="node"><span className="pchip" style={{ background: ag ? GC[ag.g] : 'var(--text-3)' }} /><span className="pn">{ag?.p || a}</span><span className="pa">{a}</span></span>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="track-h">Trilha — nesta ordem</div>
              <div className="trail">
                {aiResult.steps.map((s, i) => (
                  <div key={i} className="tstep">
                    <div className="tnum">{String(i + 1).padStart(2, '0')}</div>
                    <div>
                      <h4>{s.title}<span className="twho">· {s.who}</span></h4>
                      <p>{s.desc}</p>
                      {s.cmd && <TrailCmd text={s.cmd} />}
                    </div>
                  </div>
                ))}
              </div>
              {aiResult.powerups && aiResult.powerups.length > 0 && (
                <div className="callout" style={{ marginTop: 16 }}>
                  <b>Potencializadores Claude Code:</b>
                  {aiResult.powerups.map((p, i) => (
                    <div key={i} style={{ marginTop: 8 }}>
                      <span className="cchip">{p.feature}</span> {p.how}
                    </div>
                  ))}
                </div>
              )}
              <div className="gen-prompt">
                <button className="redo" disabled={genBusy} onClick={() => runGenerate(aiInput, aiResult.workflow, aiResult.agents)}>
                  {genBusy ? 'gerando…' : '⚡ gerar prompt pronto pro Claude Code'}
                </button>
                {genPrompt && <CopyCmd text={genPrompt}><CmdText text={genPrompt} /></CopyCmd>}
              </div>
              <button className="redo" onClick={reset}>↺ recomeçar roteamento</button>
            </div>
          ) : res && 'kind' in res && res.kind === 'wf' ? (() => {
            const w = wfByName(res.wf)!;
            const auto = res.discovery
              ? `# 1º mapeie o que já existe\n@aiox-master\n*run-workflow brownfield-discovery\n\n# depois rode a evolução\n*run-workflow ${res.wf}`
              : `@aiox-master # ativa o Orion no Claude Code\n*run-workflow ${res.wf}`;
            const manual = w.track.map(n => {
              const ag = content.agents.find(a => a.p === n[0]);
              return `@${ag ? ag.id : n[0].toLowerCase()} # ${n[1]}`;
            }).join('\n');
            return (
              <div>
                <div className="rt-head"><span className="rt-badge" style={{ color: WF_COLOR[w.cat], background: WF_COLOR_DIM[w.cat] }}>{WF_LABEL[w.cat]}</span><h2>{w.name}</h2></div>
                <div className="rt-file">{w.file}</div>
                <p className="rt-desc">{w.desc}</p>
                {res.discovery && <div className="callout"><b>Atenção:</b> como os agentes não conhecem esse código ainda, comece pelo <b>brownfield-discovery</b> pra eles mapearem tudo antes de mexer. Sem isso, o risco de quebrar o que já funciona sobe.</div>}
                <div className="track-h">Tripulação em ação — nesta ordem</div>
                <div className="track">
                  {w.track.map((n, i) => (
                    <span key={i}>
                      {i > 0 && <span className="sep">→</span>}
                      <span className="node" style={{ animationDelay: `${i * 70}ms` }}><span className="pchip" style={{ background: GC[n[2]] }} /><span className="pn">{n[0]}</span><span className="pa">{n[1]}</span></span>
                    </span>
                  ))}
                </div>
                <div className="cmd-block">
                  <div className="mode-lbl"><span className="n">A</span> Modo automático — o Orion dirige</div>
                  <CopyCmd text={auto}><CmdText text={auto} /></CopyCmd>
                  <div className="mode-lbl"><span className="n">B</span> Modo manual — agente por agente</div>
                  <CopyCmd text={manual}><CmdText text={manual} /></CopyCmd>
                </div>
                {ai.ai && (
                  <div className="gen-prompt">
                    <button className="redo" disabled={genBusy} onClick={() => runGenerate(`Rodar o workflow ${w.name}: ${w.desc}`, w.name)}>
                      {genBusy ? 'gerando…' : '⚡ gerar prompt pronto pro Claude Code (IA)'}
                    </button>
                    {genPrompt && <CopyCmd text={genPrompt}><CmdText text={genPrompt} /></CopyCmd>}
                  </div>
                )}
                <p style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--text-faint)', marginTop: 14 }}>Depois que rodar: acompanha os estados na aba <b style={{ color: 'var(--text-3)' }}>06 · Ciclo</b> e o arsenal na <b style={{ color: 'var(--text-3)' }}>07 · Comandos</b>.</p>
                <button className="redo" onClick={reset}>↺ recomeçar roteamento</button>
              </div>
            );
          })() : res && 'kind' in res && res.kind === 'trail' ? (
            <div>
              <TrailBlock t={res.trail} />
              <button className="redo" onClick={reset}>↺ recomeçar roteamento</button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
