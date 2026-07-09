import '../notfound.css';
import { useApp } from '../App';

/* rotas válidas → view id (mesma ordem das abas) */
const ROUTES: [string, string][] = [
  ['/briefing', 'overview'],
  ['/roteador', 'router'],
  ['/workflows', 'workflows'],
  ['/tripulacao', 'crew'],
  ['/squads', 'squads'],
  ['/motor-ade', 'ade'],
  ['/ciclo', 'cycle'],
  ['/comandos', 'commands'],
  ['/sistema', 'system'],
];

/** 404 — rota fora do mapa de missões. */
export default function NotFound() {
  const { goto } = useApp();
  const path = decodeURIComponent(window.location.pathname);

  return (
    <div className="nf-root">
      <div className="nf-grid" aria-hidden="true" />
      <div className="nf-glow" aria-hidden="true" />

      <div className="nf-content">
        <div className="nf-logo" aria-hidden="true">Λ</div>

        <p className="nf-telemetry">
          <span className="nf-dot" /> sinal perdido · rota fora do mapa de missões
        </p>

        <h1 className="nf-code">404</h1>

        <p className="nf-msg">
          Nenhum agente responde em <code className="nf-path">{path}</code>.
          <br />
          O roteador não encontrou essa coordenada no Mission Control.
        </p>

        <div className="nf-actions">
          <button className="nf-btn-primary" onClick={() => goto('landing')}>
            ← Voltar ao início
          </button>
          <button className="nf-btn-ghost" onClick={() => goto('overview')}>
            Ir pro Mission Control
          </button>
        </div>

        <div className="nf-routes" role="list" aria-label="Rotas válidas">
          <span className="nf-routes-label">rotas mapeadas:</span>
          {ROUTES.map(([slug, view]) => (
            <button key={slug} className="nf-route-chip" role="listitem" onClick={() => goto(view)}>
              {slug}
            </button>
          ))}
        </div>
      </div>

      <footer className="nf-footer">SynkraAI · AIOX Platform · GAMA Design System V3</footer>
    </div>
  );
}
