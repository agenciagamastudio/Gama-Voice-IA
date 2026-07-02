import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Upload, Download, Loader, Sliders, RefreshCw,
  Music, Zap, Wind, Activity, Layers,
} from 'lucide-react'
import { API_BASE_URL } from '../utils/config'
import { useAuthAPI } from '../hooks/useAuthAPI'
import Toast from './Toast'

// ─── Types ────────────────────────────────────────────────────────────────

interface EffectState<T> {
  enabled: boolean
  params: T
}

interface AllEffects {
  pitch_shift:   EffectState<{ n_steps: number }>
  time_stretch:  EffectState<{ rate: number }>
  reverb:        EffectState<{ decay: number }>
  compressor:    EffectState<{ threshold: number; ratio: number }>
  eq_bass_boost: EffectState<{ amount: number }>
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(b64: string, mime = 'audio/wav'): Blob {
  const raw  = atob(b64)
  const arr  = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

async function drawWaveform(blob: Blob, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0f0f0f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  try {
    const ab = await blob.arrayBuffer()
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
    const ac = new AudioCtx()
    const buffer = await ac.decodeAudioData(ab)
    ac.close()

    const data = buffer.getChannelData(0)
    const step = Math.max(1, Math.floor(data.length / canvas.width))
    const R = 136, G = 206, B = 17

    for (let x = 0; x < canvas.width; x++) {
      let peak = 0
      for (let j = 0; j < step; j++) {
        const v = Math.abs(data[x * step + j] || 0)
        if (v > peak) peak = v
      }
      const h  = Math.max(2, peak * canvas.height * 0.88)
      const y  = (canvas.height - h) / 2
      ctx.fillStyle = `rgba(${R},${G},${B},${0.25 + peak * 0.75})`
      ctx.fillRect(x, y, 1, h)
    }
  } catch {
    // Placeholder wavy shape on decode failure
    ctx.fillStyle = 'rgba(136,206,17,0.18)'
    for (let x = 0; x < canvas.width; x++) {
      const h = (Math.sin(x * 0.09) * 0.3 + 0.4) * canvas.height * 0.5
      ctx.fillRect(x, (canvas.height - h) / 2, 1, h)
    }
  }
}

// Compute slider fill percentage
function sliderBg(val: number, min: number, max: number): string {
  const p = ((val - min) / (max - min)) * 100
  return `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${p}%, rgba(255,255,255,0.1) ${p}%, rgba(255,255,255,0.1) 100%)`
}

// ─── Sub-component: WaveformCanvas ────────────────────────────────────────

interface WaveformCanvasProps {
  label: string
  color: string
  audio: Blob | null
  audioUrl: string | null
  placeholder?: string
}

function WaveformCanvas({ label, color, audio, audioUrl, placeholder }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (audio && canvasRef.current) {
      drawWaveform(audio, canvasRef.current)
    } else if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.fillStyle = '#0f0f0f'
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }, [audio])

  return (
    <div
      className="glass-card"
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            boxShadow: audio ? `0 0 8px ${color}` : 'none',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.07em',
            color: audio ? color : 'var(--color-text-muted)',
          }}
        >
          {label}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        style={{
          width: '100%',
          height: '80px',
          borderRadius: '8px',
          background: '#0f0f0f',
          opacity: audio ? 1 : 0.3,
          transition: 'opacity 300ms',
        }}
      />

      {audioUrl ? (
        <audio
          controls
          src={audioUrl}
          style={{ width: '100%', height: '32px', borderRadius: '6px' }}
        />
      ) : (
        <div
          style={{
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {placeholder}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Sub-component: EffectCard ────────────────────────────────────────────

interface EffectCardProps {
  label: string
  icon: React.ReactNode
  enabled: boolean
  onToggle: () => void
  children: React.ReactNode
}

function EffectCard({ label, icon, enabled, onToggle, children }: EffectCardProps) {
  return (
    <div
      style={{
        background: enabled ? 'rgba(136,206,17,0.04)' : 'var(--glass-bg-2)',
        border: `1px solid ${enabled ? 'var(--color-border-green)' : 'var(--color-border)'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'border-color 200ms, background 200ms',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: enabled ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            transition: 'color 200ms',
          }}
        >
          {icon}
          <span style={{ fontSize: '13px', fontWeight: 700 }}>{label}</span>
        </div>

        {/* Toggle switch */}
        <div
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
          tabIndex={0}
          onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') onToggle() }}
          style={{
            width: '36px',
            height: '20px',
            borderRadius: '999px',
            background: enabled ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 200ms',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '3px',
              left: enabled ? '19px' : '3px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: enabled ? '#000' : 'rgba(255,255,255,0.45)',
              transition: 'left 200ms, background 200ms',
            }}
          />
        </div>
      </div>

      {/* Params — collapse when disabled */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: enabled ? '220px' : '0px',
          opacity: enabled ? 1 : 0,
          transition: 'max-height 280ms ease, opacity 200ms ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Sub-component: SliderRow ─────────────────────────────────────────────

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, step, format, onChange }: SliderRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{label}</span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-primary)',
            fontVariantNumeric: 'tabular-nums',
            minWidth: '52px',
            textAlign: 'right',
          }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '8px',
          appearance: 'none' as any,
          cursor: 'pointer',
          background: sliderBg(value, min, max),
          transition: 'background 50ms',
        }}
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function PostProcessingStudio() {
  const { fetchWithAuth } = useAuthAPI()

  const [originalAudio, setOriginalAudio] = useState<Blob | null>(null)
  const [originalUrl,   setOriginalUrl]   = useState<string | null>(null)
  const [processedAudio, setProcessedAudio] = useState<Blob | null>(null)
  const [processedUrl,   setProcessedUrl]   = useState<string | null>(null)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState<string | null>(null)
  const [appliedEffects, setAppliedEffects] = useState<string[]>([])
  const [toastMsg,       setToastMsg]       = useState('')
  const [toastVisible,   setToastVisible]   = useState(false)

  const [effects, setEffects] = useState<AllEffects>({
    pitch_shift:   { enabled: false, params: { n_steps: 0 } },
    time_stretch:  { enabled: false, params: { rate: 1.0 } },
    reverb:        { enabled: false, params: { decay: 0.4 } },
    compressor:    { enabled: false, params: { threshold: -20, ratio: 4 } },
    eq_bass_boost: { enabled: false, params: { amount: 1.5 } },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2200)
  }, [])

  const loadAudioFile = useCallback((file: File) => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    const url = URL.createObjectURL(file)
    setOriginalAudio(file)
    setOriginalUrl(url)
    setProcessedAudio(null)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    setProcessedUrl(null)
    setAppliedEffects([])
    setError(null)
  }, [originalUrl, processedUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadAudioFile(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('audio/')) loadAudioFile(file)
  }

  const toggleEffect = (key: keyof AllEffects) => {
    setEffects(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }))
  }

  const setParam = <K extends keyof AllEffects>(key: K, paramKey: string, val: number) => {
    setEffects(prev => ({
      ...prev,
      [key]: { ...prev[key], params: { ...prev[key].params, [paramKey]: val } },
    }))
  }

  const handleProcess = async () => {
    if (!originalAudio) return
    setLoading(true)
    setError(null)

    try {
      const audioBase64 = await blobToBase64(originalAudio)

      const effectsPayload: Record<string, unknown> = {}
      if (effects.pitch_shift.enabled)   effectsPayload.pitch_shift   = effects.pitch_shift.params
      if (effects.time_stretch.enabled)  effectsPayload.time_stretch  = effects.time_stretch.params
      if (effects.reverb.enabled)        effectsPayload.reverb        = effects.reverb.params
      if (effects.compressor.enabled)    effectsPayload.compressor    = effects.compressor.params
      if (effects.eq_bass_boost.enabled) effectsPayload.eq_bass_boost = effects.eq_bass_boost.params

      const res = await fetchWithAuth(`${API_BASE_URL}/api/audio/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: audioBase64, effects: effectsPayload }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).error || `Erro ${res.status}`)
      }

      const data: { audio: string; effects_applied?: string[] } = await res.json()
      const blob = base64ToBlob(data.audio)
      if (processedUrl) URL.revokeObjectURL(processedUrl)
      const url = URL.createObjectURL(blob)
      setProcessedAudio(blob)
      setProcessedUrl(url)
      setAppliedEffects(data.effects_applied ?? Object.keys(effectsPayload))
      showToast('Processamento concluído!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no processamento')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!processedUrl) return
    const a  = document.createElement('a')
    a.href   = processedUrl
    a.download = `gama_voz_fx_${Date.now()}.wav`
    a.click()
    showToast('Áudio baixado!')
  }

  const activeCount = Object.values(effects).filter(e => e.enabled).length
  const canProcess  = !!originalAudio && activeCount > 0 && !loading

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Upload Zone ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
          Arquivo de Áudio
        </label>

        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${originalAudio ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center' as const,
            cursor: 'pointer',
            background: originalAudio ? 'var(--color-primary-dim)' : 'var(--glass-bg-2)',
            transition: 'border-color 200ms, background 200ms',
          }}
          onMouseEnter={e => {
            if (!originalAudio) e.currentTarget.style.borderColor = 'var(--color-primary)'
          }}
          onMouseLeave={e => {
            if (!originalAudio) e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {originalAudio ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Music style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>
                {(originalAudio as File).name ?? 'Áudio carregado'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                ({((originalAudio as File).size / 1024).toFixed(0)} KB)
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Upload style={{ width: '28px', height: '28px', color: 'var(--color-text-muted)' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Arraste um arquivo ou clique para selecionar
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                WAV · MP3 · OGG · FLAC · M4A
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Before / After Waveforms ─────────────────────────────────────── */}
      {originalAudio && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <WaveformCanvas
            label="Original"
            color="rgba(255,255,255,0.4)"
            audio={originalAudio}
            audioUrl={originalUrl}
          />
          <WaveformCanvas
            label="Processado"
            color="var(--color-primary)"
            audio={processedAudio}
            audioUrl={processedUrl}
            placeholder="Processe para ver o resultado"
          />
        </div>
      )}

      {/* ── Effect Rack ──────────────────────────────────────────────────── */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
              Cadeia de Efeitos
            </span>
          </div>
          {activeCount > 0 && (
            <span className="pill pill-green">
              {activeCount} ativo{activeCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Pitch Shift */}
          <EffectCard
            label="Pitch Shift"
            icon={<Activity style={{ width: '14px', height: '14px' }} />}
            enabled={effects.pitch_shift.enabled}
            onToggle={() => toggleEffect('pitch_shift')}
          >
            <SliderRow
              label="Semitones"
              value={effects.pitch_shift.params.n_steps}
              min={-12} max={12} step={0.5}
              format={v => `${v > 0 ? '+' : ''}${v}`}
              onChange={v => setParam('pitch_shift', 'n_steps', v)}
            />
          </EffectCard>

          {/* Time Stretch */}
          <EffectCard
            label="Time Stretch"
            icon={<RefreshCw style={{ width: '14px', height: '14px' }} />}
            enabled={effects.time_stretch.enabled}
            onToggle={() => toggleEffect('time_stretch')}
          >
            <SliderRow
              label="Velocidade"
              value={effects.time_stretch.params.rate}
              min={0.5} max={2.0} step={0.05}
              format={v => `${v.toFixed(2)}x`}
              onChange={v => setParam('time_stretch', 'rate', v)}
            />
          </EffectCard>

          {/* Reverb */}
          <EffectCard
            label="Reverb"
            icon={<Wind style={{ width: '14px', height: '14px' }} />}
            enabled={effects.reverb.enabled}
            onToggle={() => toggleEffect('reverb')}
          >
            <SliderRow
              label="Decaimento"
              value={effects.reverb.params.decay}
              min={0.1} max={0.9} step={0.05}
              format={v => v.toFixed(2)}
              onChange={v => setParam('reverb', 'decay', v)}
            />
          </EffectCard>

          {/* Compressor */}
          <EffectCard
            label="Compressor"
            icon={<Layers style={{ width: '14px', height: '14px' }} />}
            enabled={effects.compressor.enabled}
            onToggle={() => toggleEffect('compressor')}
          >
            <SliderRow
              label="Threshold"
              value={effects.compressor.params.threshold}
              min={-60} max={0} step={1}
              format={v => `${v} dB`}
              onChange={v => setParam('compressor', 'threshold', v)}
            />
            <SliderRow
              label="Ratio"
              value={effects.compressor.params.ratio}
              min={1} max={20} step={0.5}
              format={v => `${v.toFixed(1)}:1`}
              onChange={v => setParam('compressor', 'ratio', v)}
            />
          </EffectCard>

          {/* EQ Bass Boost */}
          <EffectCard
            label="EQ Bass Boost"
            icon={<Zap style={{ width: '14px', height: '14px' }} />}
            enabled={effects.eq_bass_boost.enabled}
            onToggle={() => toggleEffect('eq_bass_boost')}
          >
            <SliderRow
              label="Intensidade"
              value={effects.eq_bass_boost.params.amount}
              min={0.5} max={2.0} step={0.05}
              format={v => `${v.toFixed(2)}x`}
              onChange={v => setParam('eq_bass_boost', 'amount', v)}
            />
          </EffectCard>

        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            background: 'rgba(225,29,72,0.08)',
            border: '1px solid rgba(225,29,72,0.25)',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Applied effects pills ─────────────────────────────────────────── */}
      {appliedEffects.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {appliedEffects.map(fx => (
            <span key={fx} className="pill pill-green">
              {fx.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* ── Process Button ───────────────────────────────────────────────── */}
      <button
        onClick={handleProcess}
        disabled={!canProcess}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          fontFamily: 'var(--font-main)',
          fontWeight: 800,
          fontSize: '16px',
          border: 'none',
          cursor: canProcess ? 'pointer' : 'not-allowed',
          background: canProcess ? 'var(--color-primary)' : 'rgba(136,206,17,0.35)',
          color: '#000',
          opacity: canProcess ? 1 : 0.65,
          boxShadow: canProcess ? '0 4px 24px var(--color-primary-glow)' : 'none',
          transition: 'all 200ms',
        }}
        onMouseEnter={e => { if (canProcess) e.currentTarget.style.filter = 'brightness(1.1)' }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
      >
        {loading ? (
          <>
            <Loader style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
            Processando...
          </>
        ) : (
          <>
            <Sliders style={{ width: '20px', height: '20px' }} />
            Processar Áudio
          </>
        )}
      </button>

      {!originalAudio && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '-12px' }}>
          Carregue um arquivo de áudio para começar
        </p>
      )}
      {originalAudio && activeCount === 0 && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '-12px' }}>
          Ative pelo menos um efeito para processar
        </p>
      )}

      {/* ── Download Button ──────────────────────────────────────────────── */}
      {processedAudio && (
        <button
          onClick={handleDownload}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            fontFamily: 'var(--font-main)',
            fontWeight: 700,
            fontSize: '14px',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            background: 'var(--glass-bg-2)',
            color: 'var(--color-text)',
            transition: 'all 200ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          <Download style={{ width: '16px', height: '16px' }} />
          Baixar WAV Processado
        </button>
      )}

      <Toast message={toastMsg} visible={toastVisible} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
