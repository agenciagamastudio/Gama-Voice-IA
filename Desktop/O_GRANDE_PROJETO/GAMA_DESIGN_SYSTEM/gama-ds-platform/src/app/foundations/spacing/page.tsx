'use client'

export default function SpacingPage() {
  const spacings = [
    { name: 'XS', value: '4px', tailwind: 'xs', usage: 'Micro-spacing, letter-spacing, muito tight' },
    { name: 'SM', value: '8px', tailwind: 'sm', usage: 'Tight grouping de elementos' },
    { name: 'MD', value: '12px', tailwind: 'md', usage: 'Default padding de componentes' },
    { name: 'LG', value: '16px', tailwind: 'lg', usage: 'Component spacing, gaps padrão' },
    { name: 'XL', value: '24px', tailwind: 'xl', usage: 'Section spacing, espaço generoso' },
    { name: '2XL', value: '32px', tailwind: '2xl', usage: 'Large grouping, entre seções' },
    { name: '3XL', value: '48px', tailwind: '3xl', usage: 'Hero spacing, seções principais' },
    { name: '4XL', value: '64px', tailwind: '4xl', usage: 'Extra large spacing, grid gaps' },
    { name: '5XL', value: '96px', tailwind: '5xl', usage: 'Full-width sections, major dividers' },
    { name: '6XL', value: '128px', tailwind: '6xl', usage: 'Page sections, large containers' },
    { name: '7XL', value: '160px', tailwind: '7xl', usage: 'Hero sections, top-level spacing' },
  ]

  return (
    <div className="min-h-screen bg-gama-dark p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-display text-gama-primary font-black mb-2">📏 Spacing</h1>
        <p className="text-lg text-gama-text-secondary mb-12">Sistema de espaçamento em múltiplos de 4px — consistência visual em toda interface</p>

        {/* Principle */}
        <section className="mb-16 bg-gama-surface/50 rounded-2xl p-8 border border-gama-primary/20">
          <h2 className="text-2xl font-bold text-gama-text mb-4">🎯 Princípio Base</h2>
          <p className="text-gama-text-secondary">
            Todo espaçamento é um múltiplo de <code className="bg-gama-darker px-2 py-1 rounded text-gama-primary font-mono">4px</code>.
            Isso garante alinhamento perfeito, escala consistente e ritmo visual em toda a interface.
          </p>
        </section>

        {/* Spacing Scale */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gama-text mb-8">Escala de Espaçamento</h2>
          <div className="space-y-6">
            {spacings.map((spacing) => (
              <div key={spacing.name} className="bg-gama-surface rounded-xl p-8 border border-gama-surface-accent hover:border-gama-primary/50 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gama-primary mb-2">{spacing.name}</h3>
                    <p className="text-sm text-gama-text-secondary">{spacing.usage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gama-text">{spacing.value}</p>
                    <p className="text-xs text-gama-text-secondary font-mono">--spacing-{spacing.tailwind}</p>
                  </div>
                </div>

                {/* Visual representation */}
                <div className="bg-gama-darker rounded-lg p-4 overflow-x-auto">
                  <div className="flex items-center gap-4">
                    <div
                      className="bg-gama-primary rounded-md flex-shrink-0"
                      style={{ width: spacing.value, height: '40px' }}
                    />
                    <span className="text-gama-text-secondary text-sm font-mono whitespace-nowrap">{spacing.value} de largura</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component Patterns */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gama-text mb-8">Padrões de Componentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Button */}
            <div className="bg-gama-surface rounded-xl p-6 border border-gama-surface-accent">
              <h3 className="text-lg font-bold text-gama-text mb-4">Botão (Button)</h3>
              <div className="bg-gama-darker rounded-lg p-4 mb-4 flex justify-center">
                <div style={{ padding: '12px 24px' }} className="bg-gama-primary text-gama-dark font-bold rounded-lg text-center text-sm">
                  Clique aqui
                </div>
              </div>
              <code className="text-xs bg-gama-darker px-3 py-2 rounded block text-gama-text-secondary">
                padding: 12px 24px (md lg)
              </code>
            </div>

            {/* Card */}
            <div className="bg-gama-surface rounded-xl p-6 border border-gama-surface-accent">
              <h3 className="text-lg font-bold text-gama-text mb-4">Card</h3>
              <div style={{ padding: '32px' }} className="bg-gama-darker rounded-lg mb-4">
                <p className="text-gama-text-secondary text-sm">Conteúdo com padding de 32px</p>
              </div>
              <code className="text-xs bg-gama-darker px-3 py-2 rounded block text-gama-text-secondary">
                padding: 32px (2xl)
              </code>
            </div>

            {/* Input */}
            <div className="bg-gama-surface rounded-xl p-6 border border-gama-surface-accent">
              <h3 className="text-lg font-bold text-gama-text mb-4">Input/TextField</h3>
              <div style={{ padding: '12px 16px' }} className="bg-gama-darker border border-gama-surface rounded-lg mb-4 text-gama-text-secondary text-sm">
                Digite algo...
              </div>
              <code className="text-xs bg-gama-darker px-3 py-2 rounded block text-gama-text-secondary">
                padding: 12px 16px (md lg)
              </code>
            </div>

            {/* Chip/Badge */}
            <div className="bg-gama-surface rounded-xl p-6 border border-gama-surface-accent">
              <h3 className="text-lg font-bold text-gama-text mb-4">Chip/Badge</h3>
              <div style={{ padding: '6px 12px' }} className="inline-block bg-gama-primary/20 text-gama-primary rounded-full text-xs font-semibold mb-4">
                Design System
              </div>
              <code className="text-xs bg-gama-darker px-3 py-2 rounded block text-gama-text-secondary">
                padding: 6px 12px (xs-sm md)
              </code>
            </div>
          </div>
        </section>

        {/* Layout Spacing */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gama-text mb-8">Espaçamento de Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-gama-surface rounded-xl p-6 border border-gama-surface-accent">
              <h3 className="font-bold text-gama-text mb-6">Gaps (Entre elementos)</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gama-text-secondary mb-2">Elementos inline tight (gap: 8px)</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gama-darker rounded text-xs">Tag 1</span>
                    <span className="px-3 py-1 bg-gama-darker rounded text-xs">Tag 2</span>
                    <span className="px-3 py-1 bg-gama-darker rounded text-xs">Tag 3</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gama-text-secondary mb-2">Grid padrão (gap: 16px)</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-gama-darker rounded" />
                    <div className="h-12 bg-gama-darker rounded" />
                    <div className="h-12 bg-gama-darker rounded" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gama-text-secondary mb-2">Grid generoso (gap: 24px)</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-16 bg-gama-darker rounded" />
                    <div className="h-16 bg-gama-darker rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gama-surface rounded-xl p-6 border border-gama-surface-accent">
              <h3 className="font-bold text-gama-text mb-6">Margins (Entre seções)</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gama-text-secondary mb-2">Seção com margin-bottom: 24px</p>
                  <div className="h-12 bg-gama-darker rounded mb-6" />
                  <p className="text-xs text-gama-text-muted">↓ espaço de 24px ↓</p>
                </div>
                <div>
                  <p className="text-xs text-gama-text-secondary mb-2">Seção com margin-bottom: 48px</p>
                  <div className="h-12 bg-gama-darker rounded" style={{ marginBottom: '48px' }} />
                  <p className="text-xs text-gama-text-muted">↓ espaço de 48px ↓</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Examples */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gama-text mb-8">Exemplos Reais</h2>

          {/* Form */}
          <div className="bg-gama-surface rounded-xl p-8 border border-gama-surface-accent mb-8">
            <h3 className="text-lg font-bold text-gama-text mb-6">Formulário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gama-text-secondary mb-2">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  style={{ padding: '12px 16px' }}
                  className="w-full bg-gama-darker border border-gama-surface-accent rounded-lg text-gama-text text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gama-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  style={{ padding: '12px 16px' }}
                  className="w-full bg-gama-darker border border-gama-surface-accent rounded-lg text-gama-text text-sm"
                />
              </div>
              <button style={{ padding: '12px 24px' }} className="w-full bg-gama-primary text-gama-dark font-bold rounded-lg mt-2">
                Enviar
              </button>
            </div>
            <p className="text-xs text-gama-text-secondary mt-4">
              <code className="bg-gama-darker px-2 py-1 rounded">gap: 16px</code> entre inputs
            </p>
          </div>

          {/* Card List */}
          <div className="bg-gama-surface rounded-xl p-8 border border-gama-surface-accent">
            <h3 className="text-lg font-bold text-gama-text mb-6">Lista de Cards</h3>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} style={{ padding: '24px' }} className="bg-gama-darker rounded-lg border border-gama-surface-accent">
                  <h4 className="font-bold text-gama-text mb-2">Card Title {i}</h4>
                  <p className="text-sm text-gama-text-secondary">Descrição do card com espaçamento interno de 24px</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gama-text-secondary mt-4">
              <code className="bg-gama-darker px-2 py-1 rounded">gap: 16px</code> entre cards,{' '}
              <code className="bg-gama-darker px-2 py-1 rounded">padding: 24px</code> internamente
            </p>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gama-text mb-8">✅ Best Practices</h2>
          <div className="bg-gama-surface/50 rounded-2xl p-8 border border-gama-primary/20">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <li className="flex gap-3">
                <span className="text-gama-primary text-lg">•</span>
                <div>
                  <p className="font-bold text-gama-text mb-1">Múltiplos de 4px</p>
                  <p className="text-sm text-gama-text-secondary">Sempre use múltiplos de 4px para consistência e alinhamento perfeito.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-gama-primary text-lg">•</span>
                <div>
                  <p className="font-bold text-gama-text mb-1">Padding interno</p>
                  <p className="text-sm text-gama-text-secondary">Use 12px (md) ou 16px (lg) para padding de componentes padrão.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-gama-primary text-lg">•</span>
                <div>
                  <p className="font-bold text-gama-text mb-1">Gaps entre elementos</p>
                  <p className="text-sm text-gama-text-secondary">Use 8px (sm) para tight, 12px (md) para padrão, 16px (lg) para generoso.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-gama-primary text-lg">•</span>
                <div>
                  <p className="font-bold text-gama-text mb-1">Espaçamento vertical</p>
                  <p className="text-sm text-gama-text-secondary">Entre seções use 24px (xl) a 48px (3xl) para respiração visual.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-gama-primary text-lg">•</span>
                <div>
                  <p className="font-bold text-gama-text mb-1">Usar CSS variables</p>
                  <p className="text-sm text-gama-text-secondary">Prefira usar tokens Tailwind ou CSS vars em vez de pixels aleatórios.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-gama-primary text-lg">•</span>
                <div>
                  <p className="font-bold text-gama-text mb-1">Consistência</p>
                  <p className="text-sm text-gama-text-secondary">Reutilize os mesmos valores de spacing em toda a aplicação.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
