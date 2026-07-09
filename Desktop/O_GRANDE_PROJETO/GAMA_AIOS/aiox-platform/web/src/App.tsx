import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import seedData from '../../data/seed.json';
import { fetchAiStatus, fetchContent, type AiStatus, type Content } from './lib/api';
import Overview from './views/Overview';
import RouterView from './views/RouterView';
import Workflows from './views/Workflows';
import Crew from './views/Crew';
import Squads from './views/Squads';
import Ade from './views/Ade';
import Cycle from './views/Cycle';
import Commands from './views/Commands';
import SystemView from './views/SystemView';
import Landing from './views/Landing';
import NotFound from './views/NotFound';
import ChatWidget from './components/ChatWidget';

/* ── contexto global de dados ─────────────────────────── */
type Ctx = {
  content: Content;
  ai: AiStatus;
  goto: (view: string, opts?: { mission?: string }) => void;
  routerMission: string | null;
  toast: () => void;
  openChat: () => void;
};
const AppCtx = createContext<Ctx>(null!);
export const useApp = () => useContext(AppCtx);

export const GC: Record<string, string> = {
  plan: 'var(--info)', build: 'var(--primary)', guard: 'var(--warning)', ops: 'var(--success)', uni: 'var(--text-3)',
};

const TABS = [
  ['overview', '00', 'Briefing'],
  ['router', '01', 'Roteador'],
  ['workflows', '02', 'Workflows'],
  ['crew', '03', 'Tripulação'],
  ['squads', '04', 'Squads'],
  ['ade', '05', 'Motor ADE'],
  ['cycle', '06', 'Ciclo'],
  ['commands', '07', 'Comandos'],
  ['system', '08', 'Sistema'],
] as const;

/* ── URL ↔ view (History API, sem router lib) ─────────── */
const VIEW_SLUG: Record<string, string> = {
  overview: 'briefing', router: 'roteador', workflows: 'workflows', crew: 'tripulacao',
  squads: 'squads', ade: 'motor-ade', cycle: 'ciclo', commands: 'comandos', system: 'sistema',
};
const SLUG_VIEW: Record<string, string> = Object.fromEntries(
  Object.entries(VIEW_SLUG).map(([v, s]) => [s, v]),
);

function normalizeSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos (/Tripulação → tripulacao)
    .replace(/[\s_-]+/g, '');                         // ignora hífen/espaço (/Motor-ADE → motorade)
}

const NORM_VIEW: Record<string, string> = Object.fromEntries(
  Object.entries(VIEW_SLUG).map(([v, s]) => [normalizeSlug(s), v]),
);

function viewFromPath(): string {
  const raw = decodeURIComponent(window.location.pathname).replace(/^\/+|\/+$/g, '');
  if (!raw) return 'landing'; // raiz = landing page de apresentação
  return NORM_VIEW[normalizeSlug(raw)] || 'notfound';
}

export default function App() {
  const [view, setView] = useState(viewFromPath);
  const [content, setContent] = useState<Content>(seedData as unknown as Content);
  const [ai, setAi] = useState<AiStatus>({ ai: false, provider: null, model: null });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [routerMission, setRouterMission] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchContent().then(c => c && setContent(c));
    fetchAiStatus().then(setAi);
  }, []);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // voltar/avançar do navegador sincroniza a view
  useEffect(() => {
    const onPop = () => { setView(viewFromPath()); window.scrollTo({ top: 0 }); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // título da aba acompanha a view
  useEffect(() => {
    const label = view === 'landing' ? null
      : view === 'notfound' ? '404'
      : TABS.find(([id]) => id === view)?.[2] ?? null;
    document.title = label ? `${label} · AIOX Mission Control` : 'AIOX · Mission Control — GAMA';
  }, [view]);

  const totalCmds = useMemo(
    () => content.agents.reduce((n, a) => n + a.cmds.length, 0) + 5,
    [content],
  );

  const ctx: Ctx = {
    content, ai,
    goto: (v, opts) => {
      if (opts?.mission) setRouterMission(opts.mission);
      const path = v === 'landing' ? '/' : `/${VIEW_SLUG[v] || 'briefing'}`;
      if (window.location.pathname !== path) window.history.pushState(null, '', path);
      setView(v);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    routerMission,
    toast: () => { setShowToast(true); setTimeout(() => setShowToast(false), 1600); },
    openChat: () => setChatOpen(true),
  };

  if (view === 'landing' || view === 'notfound') {
    return (
      <AppCtx.Provider value={ctx}>
        {view === 'landing' ? <Landing /> : <NotFound />}
      </AppCtx.Provider>
    );
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="grid-overlay" />
      <div className="wrap">
        <header className="status">
          <div className="brand">
            <div className="logo">Λ</div>
            <div>
              <b>AIOX</b><br />
              <span className="meta">SynkraAI · Mission Control · v{content.version}</span>
            </div>
          </div>
          <div className="telemetry">
            <div className="tm"><span className="pulse" /> <b>online</b></div>
            <div className="tm"><b>{content.agents.length}</b> agentes</div>
            <div className="tm"><b>{content.workflows.length}</b> workflows</div>
            <div className="tm"><b>{totalCmds}</b> comandos</div>
            <span className={`ai-badge${ai.ai ? ' on' : ''}`} title={ai.model || 'configure .env'}>
              <span className="pulse" /> IA {ai.ai ? ai.provider : 'off'}
            </span>
            <button
              className="theme-toggle"
              onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
              aria-label="Alternar tema claro/escuro" title="Alternar tema"
            >
              <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            </button>
          </div>
        </header>

        <nav className="tabs" role="tablist">
          {TABS.map(([id, idx, label]) => (
            <button key={id} className="tab" role="tab" aria-selected={view === id} onClick={(e) => { ctx.goto(id); e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }}>
              <span className="idx">{idx}</span> {label}
            </button>
          ))}
        </nav>
        <div className="tabline" />

        <main>
          <section className={`view${view === 'overview' ? ' active' : ''}`} id="overview">{view === 'overview' && <Overview />}</section>
          <section className={`view${view === 'router' ? ' active' : ''}`} id="router">{view === 'router' && <RouterView />}</section>
          <section className={`view${view === 'workflows' ? ' active' : ''}`} id="workflows">{view === 'workflows' && <Workflows />}</section>
          <section className={`view${view === 'crew' ? ' active' : ''}`} id="crew">{view === 'crew' && <Crew />}</section>
          <section className={`view${view === 'squads' ? ' active' : ''}`} id="squads">{view === 'squads' && <Squads />}</section>
          <section className={`view${view === 'ade' ? ' active' : ''}`} id="ade">{view === 'ade' && <Ade />}</section>
          <section className={`view${view === 'cycle' ? ' active' : ''}`} id="cycle">{view === 'cycle' && <Cycle />}</section>
          <section className={`view${view === 'commands' ? ' active' : ''}`} id="commands">{view === 'commands' && <Commands />}</section>
          <section className={`view${view === 'system' ? ' active' : ''}`} id="system">{view === 'system' && <SystemView />}</section>
        </main>

        <footer>
          <span>Fonte dos dados: <b>{content.source}</b>{content.docsCount ? ` · ${content.docsCount} chunks de docs indexados` : ''}</span>
          <span className="live"><span className="pulse" style={{ background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} /> <b>GAMA Design System V3 · AIOX Platform</b></span>
        </footer>
      </div>
      <ChatWidget open={chatOpen} onToggle={() => setChatOpen(o => !o)} />
      <div className={`toast${showToast ? ' show' : ''}`}>copiado ✓</div>
    </AppCtx.Provider>
  );
}

/** copia texto e mostra toast (uso nas views) */
export function useCopy() {
  const { toast } = useApp();
  return (text: string) => navigator.clipboard.writeText(text).then(toast).catch(() => {});
}
