import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  opacityDelta: number
}

const R = 136, G = 206, B = 17 // #88ce11

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const COUNT = 75
    const MAX_DIST = 140       // particle ↔ particle connection
    const MOUSE_DIST = 180     // mouse ↔ particle connection
    const REPEL_DIST = 100     // push radius
    const REPEL_FORCE = 0.06
    const SPEED = 0.38

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const init = () => {
      particlesRef.current = Array.from({ length: COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        opacityDelta: (Math.random() - 0.5) * 0.004,
      }))
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const ps = particlesRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]

        // Mouse repulsion
        const mdx = p.x - mx
        const mdy = p.y - my
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mdist < REPEL_DIST && mdist > 0) {
          const force = (REPEL_DIST - mdist) / REPEL_DIST * REPEL_FORCE
          p.vx += (mdx / mdist) * force
          p.vy += (mdy / mdist) * force
        }

        // Dampen velocity so it doesn't fly off
        p.vx *= 0.995
        p.vy *= 0.995

        // Enforce min speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed < 0.05) {
          p.vx += (Math.random() - 0.5) * 0.05
          p.vy += (Math.random() - 0.5) * 0.05
        }

        // Move
        p.x += p.vx
        p.y += p.vy
        p.opacity += p.opacityDelta

        // Bounce walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Clamp opacity
        if (p.opacity < 0.05) { p.opacity = 0.05; p.opacityDelta *= -1 }
        if (p.opacity > 0.65) { p.opacity = 0.65; p.opacityDelta *= -1 }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${R},${G},${B},${p.opacity})`
        ctx.fill()

        // Particle ↔ particle connections
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }

        // Mouse ↔ particle connections
        if (mdist < MOUSE_DIST) {
          const alpha = (1 - mdist / MOUSE_DIST) * 0.55
          const width = (1 - mdist / MOUSE_DIST) * 1.5

          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mx, my)
          ctx.strokeStyle = `rgba(${R},${G},${B},${alpha})`
          ctx.lineWidth = width
          ctx.stroke()

          // Brighten particle close to mouse
          const boost = (1 - mdist / MOUSE_DIST) * 0.5
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${R},${G},${B},${boost})`
          ctx.fill()
        }
      }

      // Mouse cursor dot
      if (mx > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 12)
        grad.addColorStop(0, `rgba(${R},${G},${B},0.35)`)
        grad.addColorStop(1, `rgba(${R},${G},${B},0)`)
        ctx.beginPath()
        ctx.arc(mx, my, 12, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize', () => { resize(); init() })

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
