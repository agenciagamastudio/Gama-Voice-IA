import { useApp } from '../App';

export default function Overview() {
  const { goto, content, openChat } = useApp();
  return (
    <>
      <p className="eyebrow">Sala de controle</p>
      <h1 className="lead">Você não pilota o código. Você <em>comanda a tripulação</em> que pilota.</h1>
      <p className="sub">O AIOX é uma equipe de {content.agents.length} agentes de IA que planejam, constroem e revisam software por conta própria — cada um com um papel fixo, tasks definidas e um fluxo que já sabe seguir. Seu trabalho não é fazer; é apontar o projeto e aprovar quando eles pedem. Esta plataforma mostra quem faz o quê, por onde começar — e agora tem um assistente de IA que responde na hora.</p>

      <div className="hero-grid">
        <div>
          <p className="section-h">A regra da casa <span className="ln" /></p>
          <div className="stack">
            <div className="layer l1"><div className="bar" /><div className="lk">Camada 1 · fonte da verdade</div><h3>CLI First</h3><p>A inteligência vive na linha de comando. Os agentes, workflows e decisões acontecem aqui.</p></div>
            <div className="layer l2"><div className="bar" /><div className="lk">Camada 2 · observação</div><h3>Observability</h3><p>Dashboards que só observam o que a CLI faz — logs, métricas, estado. Nunca reimplementam a lógica.</p></div>
            <div className="layer l3"><div className="bar" /><div className="lk">Camada 3 · gestão</div><h3>UI</h3><p>Telas de apoio pontuais (Kanban, settings). A UI é conveniência, não a mente.</p></div>
          </div>
          <p className="flow-note">↑ é exatamente esta pilha que o <b>GAMA_COCKPIT</b> implementa</p>
        </div>
        <div>
          <p className="section-h">Instalação local <span className="ln" /></p>
          <div className="metrics">
            <div className="metric"><div className="n">{content.agents.length}</div><div className="l">agentes com persona</div></div>
            <div className="metric"><div className="n">{content.workflows.length}</div><div className="l">workflows .yaml</div></div>
            <div className="metric"><div className="n">215</div><div className="l">tasks mapeadas</div></div>
            <div className="metric"><div className="n">{content.squadsGama.length}<small> +{content.squadsBase.length}</small></div><div className="l">squads (GAMA + base)</div></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--sp-16)' }}>
        <p className="section-h">O truque: separar pensar de fazer <span className="ln" /></p>
        <p className="sub" style={{ marginTop: 0 }}>O AIOX quebra qualquer projeto em duas fases. A perda de contexto entre "planejar" e "codar" — o motivo pelo qual a maioria dos projetos de IA descarrilha — é o que ele foi desenhado pra eliminar.</p>
        <div className="twophase">
          <div className="phase-card">
            <div className="tag">Fase 1</div><h3>Planejamento agêntico</h3>
            <p>Analistas e arquitetos geram PRD e arquitetura detalhados, com você no loop. Nada de código ainda — só um plano bom o bastante pra não gerar retrabalho.</p>
            <div className="who"><span className="cchip">Atlas</span><span className="cchip">Morgan</span><span className="cchip">Aria</span><span className="cchip">Uma</span></div>
          </div>
          <div className="arrow">→</div>
          <div className="phase-card b">
            <div className="tag">Fase 2</div><h3>Desenvolvimento contextualizado</h3>
            <p>O Scrum Master transforma o plano em "histórias" hiperdetalhadas. O dev executa cada uma com contexto completo — sem adivinhar, sem alucinar escopo.</p>
            <div className="who"><span className="cchip">River</span><span className="cchip">Dex</span><span className="cchip">Quinn</span><span className="cchip">Gage</span></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--sp-16)' }}>
        <p className="section-h">Por onde navegar <span className="ln" /></p>
        <div className="navhint">
          <button className="hint" onClick={() => goto('router')}><div className="k">→ 01</div><h4>Não sei por onde começar</h4><p>Descreve a missão em linguagem natural (IA) ou responde as coordenadas — sai com a trilha e os comandos prontos.</p></button>
          <button className="hint" onClick={() => goto('workflows')}><div className="k">→ 02</div><h4>Quero ver as rotas</h4><p>Os {content.workflows.length} workflows, o que cada um faz, quando usar e a sequência de agentes.</p></button>
          <button className="hint" onClick={() => goto('crew')}><div className="k">→ 03</div><h4>Quem é quem</h4><p>A tripulação completa: papel, quando chamar e os comandos reais de cada agente.</p></button>
          <button className="hint" onClick={() => goto('ade')}><div className="k">→ 05</div><h4>O que roda sozinho</h4><p>Memória, worktrees, auto-crítica, recovery: os subsistemas do modo autônomo.</p></button>
          <button className="hint" onClick={() => goto('commands')}><div className="k">→ 07</div><h4>Acha o comando na hora</h4><p>Busca instantânea em todos os comandos de todos os agentes + a CLI do framework.</p></button>
          <button className="hint" onClick={() => openChat()}><div className="k">→ 💬</div><h4>Pergunta pro assistente</h4><p>Chat com IA treinado na documentação AIOX indexada — responde com fontes.</p></button>
        </div>
      </div>
    </>
  );
}
