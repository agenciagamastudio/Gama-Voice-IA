import { Target, Zap, DollarSign, Handshake } from 'lucide-react'

const diferenciais = [
  {
    Icon: Target,
    headline: 'Especialistas Nordestinos',
    desc: '20+ anos entregando qualidade com toque regional',
    borderColor: 'var(--qc-cyan)',
  },
  {
    Icon: Zap,
    headline: 'Entrega Rápida',
    desc: 'Solicitação hoje, produto na sua mão em dias',
    borderColor: 'var(--qc-magenta)',
  },
  {
    Icon: DollarSign,
    headline: 'Preços Competitivos',
    desc: 'Qualidade premium sem custos proibitivos',
    borderColor: 'var(--qc-yellow)',
  },
  {
    Icon: Handshake,
    headline: 'Suporte Dedicado',
    desc: 'Atendimento WhatsApp sempre disponível',
    borderColor: 'var(--qc-cyan)',
  },
]

export default function WhyQuadricolor() {
  return (
    <section className="container section-padding">
      {/* Section header */}
      <div className="mb-8 md:mb-10">
        <h2
          className="font-bold mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--qc-fs-h2)',
            color: 'var(--qc-ink)',
          }}
        >
          Por que escolher a Quadricolor?
        </h2>
        <p style={{ color: 'var(--qc-ink-2)', fontSize: 'var(--qc-fs-small)' }}>
          Referência em impressão e comunicação visual no Nordeste
        </p>
      </div>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {diferenciais.map((item, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-6 rounded-[var(--qc-r-md)] border-l-4"
            style={{
              background: 'var(--qc-paper)',
              borderLeftColor: item.borderColor,
            }}
          >
            <item.Icon size={48} style={{ color: item.borderColor }} strokeWidth={1.5} />
            <p
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--qc-fs-h3)',
                color: 'var(--qc-ink)',
              }}
            >
              {item.headline}
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--qc-ink-2)',
              }}
            >
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
