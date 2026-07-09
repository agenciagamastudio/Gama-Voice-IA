import { useApp } from '../App';

export default function SystemView() {
  const { goto } = useApp();
  return (
    <>
      <p className="eyebrow">Raio-x da instalação</p>
      <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>O <em>território</em> onde tudo vive</h1>
      <p className="sub">Onde o framework mora, onde os agentes escrevem, o que a tua config diz e como anda a saúde da engine — o retrato real da v5.2.9, direto do recon de 30/06.</p>

      <div className="sys-grid">
        <div>
          <p className="section-h">Mapa do território <span className="ln" /></p>
          <pre className="tree"><b>~/.aiox-core/</b>                    <i>← o framework (npm, sem git)</i>{'\n'}
├─ development/{'\n'}
│  ├─ agents/         <em>12 agentes .md + MEMORY.md</em>{'\n'}
│  ├─ workflows/      <em>14 rotas .yaml</em>{'\n'}
│  └─ tasks/          <em>215 tasks</em>{'\n'}
├─ data/{'\n'}
│  └─ entity-registry.yaml   <em>821 entidades (IDS)</em>{'\n'}
└─ docs/standards/    <em>Livro de Ouro, gates, templates</em>{'\n'}{'\n'}
<b>&lt;teu-projeto&gt;/</b>                  <i>← onde os agentes trabalham</i>{'\n'}
├─ docs/{'\n'}
│  ├─ prd/            <em>PRD shardado · Morgan</em>{'\n'}
│  ├─ architecture/   <em>arquitetura shardada · Aria</em>{'\n'}
│  └─ stories/        <em>histórias · River → Dex → Quinn</em>{'\n'}
└─ squads/            <em>equipes extras do projeto</em>{'\n'}{'\n'}
<b>~/.claude/</b>                       <i>← ponte com o Claude Code</i>{'\n'}
├─ skills/            <em>24 skills (12 de agentes)</em>{'\n'}
├─ commands/          <em>140 arquivos de comando</em>{'\n'}
└─ mcp.json           <em>gateway docker :8080</em></pre>
        </div>
        <div>
          <p className="section-h">Config viva — core-config.yaml <span className="ln" /></p>
          <div className="kv">
            <div className="kvrow"><span className="k">slashPrefix</span><span className="v">AIOX</span></div>
            <div className="kvrow"><span className="k">modelo</span><span className="v">claude-sonnet-4-6</span></div>
            <div className="kvrow"><span className="k">perfil</span><span className="v">advanced</span></div>
            <div className="kvrow"><span className="k">worktree</span><span className="v ok">autoCreate: on_story_start</span></div>
            <div className="kvrow"><span className="k">PRD / arquitetura</span><span className="v ok">sharded ✓</span></div>
            <div className="kvrow"><span className="k">frameworkProtection</span><span className="v warn">false — modo contribuidor ⚠</span></div>
          </div>

          <p className="section-h" style={{ marginTop: 'var(--sp-6)' }}>Saúde — último doctor <span className="ln" /></p>
          <div className="health">
            <div className="hbar"><span className="hp"><b>9</b>pass</span><span className="hw"><b>6</b>warn</span><span className="hf"><b>0</b>fail</span></div>
            <div className="wl">
              <div><span>entity-registry 704h parado (29 dias)</span><code>install --force</code></div>
              <div><span>2 rules ausentes (story-lifecycle, memory-imports)</span><code>doctor --fix</code></div>
              <div><span>0 deny rules no settings (esperado ≥40)</span><code>doctor --fix</code></div>
              <div><span>git hooks (.husky) ausentes</span><code>npx husky init</code></div>
              <div><span>CLAUDE.md sem seções da Constituição</span><code>doctor --fix</code></div>
              <div><span>hooks do Claude 1/2</span><code>install --force</code></div>
            </div>
            <button className="fixlink" onClick={() => goto('router', { mission: '__maint__' })}>→ abrir a missão "Sanear o framework" no Roteador</button>
          </div>
        </div>
      </div>

      <p className="section-h" style={{ marginTop: 'var(--sp-10)' }}>MCPs — ferramentas externas dos agentes <span className="ln" /></p>
      <div className="kv" style={{ maxWidth: 560 }}>
        <div className="kvrow"><span className="k">gateway (docker)</span><span className="v">http://localhost:8080/mcp</span></div>
        <div className="kvrow"><span className="k">preset ativo</span><span className="v ok">minimal</span></div>
      </div>
      <div className="chip-row">
        <span className="cchip">context7</span><span className="cchip">desktop-commander</span><span className="cchip">playwright</span><span className="cchip" style={{ opacity: .55 }}>exa · só no preset full</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>Gestão pelo Gage: <span style={{ fontFamily: 'var(--mono)', color: 'var(--primary)' }}>*add-mcp · *list-mcps · *search-mcp · *setup-mcp-docker</span></p>

      <p className="section-h" style={{ marginTop: 'var(--sp-10)' }}>IDEs sincronizadas <span className="ln" /></p>
      <div className="chip-row">
        <span className="cchip" style={{ borderColor: 'var(--border-green)', color: 'var(--primary)' }}>claude-code · principal</span>
        <span className="cchip">cursor</span><span className="cchip">vscode</span><span className="cchip">gemini</span><span className="cchip">codex</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>12/12 skills de agente sincronizadas no Claude Code · comandos legados 12/12.</p>

      <p className="section-h" style={{ marginTop: 'var(--sp-10)' }}>Standards da casa <span className="ln" /></p>
      <div className="chip-row">
        <span className="cchip">AIOX Livro de Ouro V2.2</span><span className="cchip">Color Palette V2.1</span><span className="cchip">Agent Personalization V1</span><span className="cchip">Quality Gates Spec</span><span className="cchip">Story Template V2</span><span className="cchip">Executor Decision Tree</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>Vivem em <span style={{ fontFamily: 'var(--mono)' }}>~/.aiox-core/docs/standards/</span> — são a lei que os agentes seguem antes de qualquer preferência pontual.</p>
    </>
  );
}
