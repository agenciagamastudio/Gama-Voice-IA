import { Zap, Star, Phone, Calendar } from 'lucide-react'

const items = [
  { Icon: Zap, label: 'Entrega Rápida', desc: 'Prazos que respeitamos' },
  { Icon: Star, label: 'Qualidade Premium', desc: 'Materiais selecionados' },
  { Icon: Phone, label: 'Atendimento Nordeste', desc: 'Suporte sempre disponível' },
  { Icon: Calendar, label: 'Desde 2001', desc: 'Décadas de experiência' },
]

export default function TrustStrip() {
  return (
    <section
      className="w-full border-b"
      style={{
        background: 'var(--qc-paper)',
        borderColor: 'var(--qc-line)',
      }}
    >
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-1 py-5 px-4 border-r last:border-r-0"
              style={{
                borderColor: 'var(--qc-line)',
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.04)',
              }}
            >
              <item.Icon size={32} style={{ color: 'var(--qc-cyan)' }} strokeWidth={1.5} />
              <p
                className="font-semibold text-sm leading-tight"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--qc-ink)',
                }}
              >
                {item.label}
              </p>
              <p
                className="text-xs leading-tight"
                style={{ color: 'var(--qc-mute)' }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
