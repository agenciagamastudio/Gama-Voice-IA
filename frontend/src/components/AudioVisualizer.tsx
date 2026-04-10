import React, { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isRecording: boolean
  audioStream?: MediaStream
  onToggleRecording?: () => void
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  audioStream,
  onToggleRecording
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const oscillatorDataRef = useRef<number[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const audioContextRef = useRef<(AudioContext | webkitAudioContext) | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

  useEffect(() => {
    if (!isRecording || !audioStream || !canvasRef.current) {
      // Parar gravação - limpar tudo
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // Desconectar source
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect()
        } catch (err) {}
        sourceRef.current = null
      }

      // Fechar AudioContext
      if (audioContextRef.current) {
        try {
          if (audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close()
          }
        } catch (err) {}
        audioContextRef.current = null
      }

      analyserRef.current = null
      dataArrayRef.current = null

      return
    }

    // Começar gravação - criar novo AudioContext
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext

      // SEMPRE criar novo AudioContext (não reutilizar)
      audioContextRef.current = new AudioContextClass()
      const audioContext = audioContextRef.current as any

      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {})
      }

      // Criar source
      try {
        sourceRef.current = audioContext.createMediaStreamSource(audioStream)
      } catch (err) {
        console.error('Erro ao criar source:', err)
        return
      }

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.85

      sourceRef.current.connect(analyser)

      analyserRef.current = analyser
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
      oscillatorDataRef.current = new Array(analyser.frequencyBinCount).fill(0)

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const draw = () => {
        if (!ctx || !canvas) {
          animationFrameRef.current = requestAnimationFrame(draw)
          return
        }

        try {
          // Limpar canvas
          ctx.fillStyle = '#0a0a0a'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          const centerX = canvas.width / 2
          const centerY = canvas.height / 2

          if (isRecording && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current)

            // Suavizar dados
            const oscillatorData = oscillatorDataRef.current
            for (let i = 0; i < dataArrayRef.current.length; i++) {
              oscillatorData[i] = oscillatorData[i] * 0.6 + (dataArrayRef.current[i] / 255) * 0.4
            }

            // Desenhar múltiplas camadas 3D
            const layers = 5
            const numBars = 128
            const baseRadius = 60
            const maxRadius = 150

            for (let layer = 0; layer < layers; layer++) {
              const layerAlpha = 0.3 - layer * 0.05
              const layerRadiusOffset = (layer / layers) * 40

              // Desenhar camada de linhas
              for (let i = 0; i < numBars; i++) {
                const dataIndex = Math.floor((i / numBars) * oscillatorData.length)
                const value = oscillatorData[dataIndex] || 0

                const angle = (i / numBars) * Math.PI * 2
                const radius = baseRadius + layerRadiusOffset + value * maxRadius

                const x = centerX + Math.cos(angle) * radius
                const y = centerY + Math.sin(angle) * radius

                if (i === 0) {
                  ctx.beginPath()
                  ctx.moveTo(x, y)
                } else {
                  ctx.lineTo(x, y)
                }

                // Conectar com próximo
                if (i === numBars - 1) {
                  const dataIndex0 = 0
                  const value0 = oscillatorData[dataIndex0] || 0
                  const angle0 = 0
                  const radius0 = baseRadius + layerRadiusOffset + value0 * maxRadius
                  const x0 = centerX + Math.cos(angle0) * radius0
                  const y0 = centerY + Math.sin(angle0) * radius0
                  ctx.lineTo(x0, y0)
                }
              }

              ctx.strokeStyle = `rgba(136, 206, 17, ${layerAlpha})`
              ctx.lineWidth = 1.5
              ctx.stroke()
            }

            // Desenhar bolinhas nos pontos mais altos
            for (let i = 0; i < Math.min(numBars, 64); i += 4) {
              const dataIndex = Math.floor((i / numBars) * oscillatorData.length)
              const value = oscillatorData[dataIndex] || 0

              const angle = (i / numBars) * Math.PI * 2
              const radius = baseRadius + value * maxRadius

              const x = centerX + Math.cos(angle) * radius
              const y = centerY + Math.sin(angle) * radius

              const blobSize = 2 + value * 6
              ctx.fillStyle = `rgba(136, 206, 17, ${0.4 + value * 0.6})`
              ctx.beginPath()
              ctx.arc(x, y, blobSize, 0, Math.PI * 2)
              ctx.fill()

              // Glow ao redor
              ctx.strokeStyle = `rgba(136, 206, 17, ${(0.4 + value * 0.6) * 0.5})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.arc(x, y, blobSize + 2, 0, Math.PI * 2)
              ctx.stroke()
            }

            // Círculos concêntricos
            const avgValue = oscillatorData.reduce((a, b) => a + b, 0) / oscillatorData.length
            for (let i = 1; i <= 4; i++) {
              ctx.strokeStyle = `rgba(136, 206, 17, ${(0.2 - i * 0.04) * avgValue})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.arc(centerX, centerY, baseRadius + i * 15, 0, Math.PI * 2)
              ctx.stroke()
            }

            // Centro
            ctx.fillStyle = `rgba(136, 206, 17, ${0.3 + avgValue * 0.4})`
            ctx.beginPath()
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = `rgba(136, 206, 17, ${0.6 + avgValue * 0.4})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
            ctx.stroke()
          } else {
            // Modo idle - círculo cinza
            const baseRadius = 70
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
            ctx.beginPath()
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2)
            ctx.stroke()

            // Ícone de microfone
            ctx.fillStyle = '#FFFFFF'
            ctx.font = 'bold 40px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('🎤', centerX, centerY)
          }
        } catch (err) {
          console.error('Erro:', err)
        }

        animationFrameRef.current = requestAnimationFrame(draw)
      }

      draw()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    } catch (err) {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    }
  }, [isRecording, audioStream])

  return (
    <div
      onClick={onToggleRecording}
      className="cursor-pointer transition-transform hover:scale-105"
      style={{
        padding: '20px',
        borderRadius: '50%'
      }}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        style={{
          backgroundColor: '#161616',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'block',
          boxShadow: '0 0 50px rgba(136, 206, 17, 0.15), inset 0 0 50px rgba(136, 206, 17, 0.05)',
          border: '2px solid rgba(136, 206, 17, 0.2)',
          transition: 'box-shadow 0.3s'
        }}
      />
    </div>
  )
}

export default AudioVisualizer
