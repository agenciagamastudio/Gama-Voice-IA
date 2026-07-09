import '../landing.css';
import { useApp } from '../App';

/* ── mapa de cor por grupo de agente ───────────────────────────────────────── */
const GROUP_CLASS: Record<string, string> = {
  plan: 'lp-g-plan',
  build: 'lp-g-build',
  guard: 'lp-g-guard',
  ops: 'lp-g-ops',
  uni: 'lp-g-uni',
};

/* ── recursos apresentados ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '⚡',
    num: '01',
    name: 'Roteador de Missões por IA',
    desc: 'Descreva o objetivo em linguagem natural. A IA analisa, seleciona o agente certo e encaminha automaticamente.',
  },
  {
    icon: '🧠',
    num: '02',
    name: 'Assistente com RAG + Voz',
    desc: 'Chat com contexto profundo do ecossistema AIOX. Anexe arquivos, use o microfone e ative o modo thinking.',
  },
  {
    icon: '🔄',
    num: '03',
    name: 'Workflows Orquestrados',
    desc: 'Pipelines multi-agente prontos para uso: Story Development Cycle, Spec Pipeline, QA Loop e mais.',
  },
  {
    icon: '🛡️',
    num: '04',
    name: 'Squads Especializados',
    desc: 'Grupos temáticos — Apex, Brand, SEO, Legal — cada um com seu chief e missão definida.',
  },
  {
    icon: '🚀',
    num: '05',
    name: 'Motor ADE',
    desc: 'Execução autônoma de epics inteiras. Brief → planejamento → código → QA → entrega. Sem interrupções.',
  },
  {
    icon: '✅',
    num: '06',
    name: 'Ciclo de Vida com Quality Gates',
    desc: 'Draft → Validate → Develop → QA → Deploy. Cada fase tem critérios de aceitação e agentes dedicados.',
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Landing — página standalone de apresentação (rota /)
   ───────────────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const { goto, content, ai } = useApp();

  return (
    <div className="lp-root">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="lp-hero" aria-label="Apresentação AIOX Platform">
        <div className="lp-hero-grid" aria-hidden="true" />
        <div className="lp-hero-glow" aria-hidden="true" />

        <div className="lp-hero-content">
          {/* logotipo */}
          <div className="lp-logo">
            <div className="lp-logo-mark" aria-hidden="true">Λ</div>
            <span>AIOX Platform · SynkraAI</span>
          </div>

          {/* eyebrow */}
          <p className="lp-hero-eyebrow">Sistema Operacional de Agentes de IA</p>

          {/* headline */}
          <h1>
            Orquestre seus agentes.<br />
            <em>Entregue mais rápido.</em>
          </h1>

          {/* subheadline */}
          <p className="lp-hero-sub">
            O AIOX reúne {content.agents.length} agentes especializados, {content.workflows.length} workflows
            e 200+ comandos em um único Mission Control — com roteador por IA, chat com RAG
            e motor de execução autônoma.
          </p>

          {/* CTAs */}
          <div className="lp-cta-group">
            <button
              className="lp-btn-primary"
              onClick={() => goto('overview')}
              aria-label="Abrir Mission Control"
            >
              Entrar no Mission Control
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <a
              className="lp-btn-ghost"
              href="#features"
              aria-label="Ver recursos da plataforma"
            >
              Ver recursos
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* indicador de scroll */}
        <div className="lp-scroll-hint" aria-hidden="true">
          <span>rolar</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 3v10M4 9l4 4 4-4" />
          </svg>
        </div>
      </section>

      {/* ── STATS / TELEMETRIA ──────────────────────────────────────────────── */}
      <div className="lp-stats" role="region" aria-label="Estatísticas da plataforma">
        <div className="lp-stat">
          <span className="lp-stat-val">{content.agents.length}</span>
          <span className="lp-stat-label">Agentes</span>
        </div>
        <div className="lp-stat">
          <span className="lp-stat-val">{content.workflows.length}</span>
          <span className="lp-stat-label">Workflows</span>
        </div>
        <div className="lp-stat">
          <span className="lp-stat-val">200+</span>
          <span className="lp-stat-label">Comandos</span>
        </div>
        <div className="lp-stat">
          <span className="lp-stat-val" style={{ fontSize: 'clamp(13px, 1.8vw, 18px)', paddingTop: '4px' }}>
            <span
              className={`lp-ai-dot${ai.ai ? ' on' : ''}`}
              aria-label={ai.ai ? 'IA ativa' : 'IA inativa'}
            />
            IA {ai.ai ? (ai.provider ?? 'on') : 'off'}
          </span>
          <span className="lp-stat-label">Assistente</span>
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="lp-section" id="features" aria-labelledby="lp-features-title">
        <p className="lp-section-label">Recursos</p>
        <h2 className="lp-section-title" id="lp-features-title">
          Tudo que você precisa para<br />operar agentes de IA com precisão
        </h2>
        <p className="lp-section-desc">
          Cada módulo foi projetado para um estágio do ciclo de vida do software —
          da ideação ao deploy em produção.
        </p>

        <div className="lp-features">
          {FEATURES.map((f) => (
            <article key={f.num} className="lp-feature-card">
              <div className="lp-feature-icon" aria-hidden="true">{f.icon}</div>
              <p className="lp-feature-num">{f.num}</p>
              <h3 className="lp-feature-name">{f.name}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── CREW MANIFEST ───────────────────────────────────────────────────── */}
      <section className="lp-crew-section" aria-labelledby="lp-crew-title">
        <div className="lp-crew-inner">
          <p className="lp-section-label">Tripulação</p>
          <h2 className="lp-section-title" id="lp-crew-title">
            {content.agents.length} agentes. Uma missão.
          </h2>
          <p className="lp-section-desc" style={{ marginBottom: 0 }}>
            Cada agente tem papel, autoridade e especialidade definidos — do planejamento ao devops.
          </p>
        </div>

        <div className="lp-crew-strip" role="list" aria-label="Lista de agentes">
          {content.agents.map((agent) => (
            <div key={agent.id} className="lp-crew-card" role="listitem">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div className={`lp-crew-dot ${GROUP_CLASS[agent.g] ?? 'lp-g-uni'}`} aria-hidden="true" />
                <span className="lp-crew-id">{agent.id}</span>
              </div>
              <p className="lp-crew-role">{agent.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <p className="lp-footer-copy">
          <strong>SynkraAI</strong> · GAMA Design System V3 · v{content.version}
          <br />
          AIOX Mission Control — todos os direitos reservados
        </p>

        <button
          className="lp-footer-cta"
          onClick={() => goto('overview')}
          aria-label="Abrir Mission Control"
        >
          Λ Entrar →
        </button>
      </footer>

    </div>
  );
}
