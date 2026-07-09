import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; label?: string }
interface State { error: Error | null }

/** Isola falhas de uma view — erro num módulo não derruba o app inteiro. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary${this.props.label ? `:${this.props.label}` : ''}]`, error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="eb-panel" role="alert">
        <p className="eb-head"><span className="eb-dot" /> falha no módulo{this.props.label ? ` · ${this.props.label}` : ''}</p>
        <p className="eb-msg">Algo quebrou ao renderizar esta seção. O resto do Mission Control segue operacional.</p>
        <code className="eb-err">{String(this.state.error.message || this.state.error).slice(0, 300)}</code>
        <div className="eb-actions">
          <button onClick={() => this.setState({ error: null })}>⟳ tentar de novo</button>
          <button onClick={() => window.location.reload()}>recarregar página</button>
        </div>
      </div>
    );
  }
}
