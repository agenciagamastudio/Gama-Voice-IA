import React, { useState, useRef, useEffect } from 'react'
import { Mic, Copy, Download, Trash2, Loader, Clock } from 'lucide-react'
import { API_BASE_URL } from '../utils/config'
import { HistoryManager } from '../utils/history'
import HistoryPanel from './HistoryPanel'
import AudioVisualizer from './AudioVisualizer'
import Toast from './Toast'

export default function STTComponent() {
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2200)
  }
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioStreamRef = useRef<MediaStream | null>(null)
  const permissionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)
  const volumeAnimRef = useRef<number>(0)
  const volumeCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      if (permissionTimeoutRef.current) clearTimeout(permissionTimeoutRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // Real-time volume → particles
  useEffect(() => {
    if (!isRecording || !audioStreamRef.current) {
      cancelAnimationFrame(volumeAnimRef.current)
      try { volumeCtxRef.current?.close() } catch {}
      volumeCtxRef.current = null
      window.dispatchEvent(new CustomEvent('gama:volume', { detail: { volume: 0 } }))
      return
    }

    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      volumeCtxRef.current = new AudioCtx()
      const ac = volumeCtxRef.current as AudioContext
      const source = ac.createMediaStreamSource(audioStreamRef.current)
      const analyser = ac.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.75
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)

      const measure = () => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        const volume = sum / (data.length * 255)
        window.dispatchEvent(new CustomEvent('gama:volume', { detail: { volume } }))
        volumeAnimRef.current = requestAnimationFrame(measure)
      }
      volumeAnimRef.current = requestAnimationFrame(measure)

      return () => {
        cancelAnimationFrame(volumeAnimRef.current)
        try { source.disconnect() } catch {}
        try { ac.close() } catch {}
        window.dispatchEvent(new CustomEvent('gama:volume', { detail: { volume: 0 } }))
      }
    } catch {}
  }, [isRecording])

  const handleStartRecording = async () => {
    try {
      setIsRequestingPermission(true)
      setError(null)
      const permissionTimeout = setTimeout(() => {
        setIsRequestingPermission(false)
        setError('⏱️ Timeout: permissão de microfone não respondeu. Verifique suas configurações de privacidade.')
      }, 10000)
      permissionTimeoutRef.current = permissionTimeout
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (permissionTimeoutRef.current) clearTimeout(permissionTimeoutRef.current)
      audioStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => { audioChunksRef.current.push(event.data) }
      mediaRecorder.onstop = () => { handleTranscribe() }
      mediaRecorder.start()
      recordingStartTimeRef.current = Date.now()
      setIsRecording(true)
      setIsRequestingPermission(false)
      setError(null)
    } catch (err) {
      setIsRequestingPermission(false)
      if (permissionTimeoutRef.current) clearTimeout(permissionTimeoutRef.current)
      let errorMsg = 'Acesso ao microfone negado'
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') errorMsg = '🔒 Permissão negada. Clique no ícone de microfone na barra de endereço.'
        else if (err.name === 'NotFoundError') errorMsg = '🎤 Nenhum microfone detectado.'
        else if (err.name === 'NotReadableError') errorMsg = '⚠️ Microfone em uso por outro aplicativo.'
        else errorMsg = err.message
      }
      setError(errorMsg)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
    }
  }

  const handleTranscribe = async () => {
    if (audioChunksRef.current.length === 0) return
    setIsLoading(true)
    setError(null)
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', 'pt')
      const response = await fetch(`${API_BASE_URL}/api/stt/transcribe`, { method: 'POST', body: formData })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha na transcrição')
      }
      const data = await response.json()
      setTranscript(data.text)
      const duration = recordingStartTimeRef.current ? Date.now() - recordingStartTimeRef.current : 0
      HistoryManager.addTranscription(data.text, duration, 'pt')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
      recordingStartTimeRef.current = null
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      showToast('Texto copiado!')
    } catch { setError('Falha ao copiar') }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([transcript], { type: 'text/plain' }))
    a.download = `transcript_${Date.now()}.txt`
    a.click()
  }

  const handleClear = () => { setTranscript(''); audioChunksRef.current = [] }

  const handleToggleRecording = () => {
    if (isRecording) handleStopRecording()
    else handleStartRecording()
  }

  const ghostBtn: React.CSSProperties = {
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '8px 12px', borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)',
    color: 'var(--color-text)', fontFamily: 'var(--font-main)',
    fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 200ms',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* LEFT: History */}
        <div>
          <h3 style={{
            fontSize: '13px', fontWeight: 700, color: 'var(--color-text)',
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
          }}>
            <Clock style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
            Histórico
          </h3>
          <HistoryPanel isOpen={true} onSelectTranscription={(t) => setTranscript(t)} />
        </div>

        {/* RIGHT: Visualizer + transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {isRequestingPermission && (
            <div style={{ fontSize: '13px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              Permitir microfone...
            </div>
          )}
          {isLoading && (
            <div style={{ fontSize: '13px', color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              Transcrevendo...
            </div>
          )}

          <AudioVisualizer
            isRecording={isRecording}
            audioStream={audioStreamRef.current || undefined}
            onToggleRecording={handleToggleRecording}
          />

          {error && (
            <div style={{
              width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.3)',
              display: 'flex', justifyContent: 'space-between', gap: '8px',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--color-error)', flex: 1, lineHeight: 1.5 }}>
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>
          )}

          {transcript && (
            <div style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
              background: 'var(--glass-bg-2)', border: '1px solid var(--color-border)',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>
                ✅ Transcrição
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                {transcript}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCopy} style={ghostBtn}>
                  <Copy style={{ width: '12px', height: '12px' }} /> Copiar
                </button>
                <button onClick={handleDownload} style={ghostBtn}>
                  <Download style={{ width: '12px', height: '12px' }} /> Baixar
                </button>
                <button onClick={handleClear} style={ghostBtn}>
                  <Trash2 style={{ width: '12px', height: '12px' }} /> Limpar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toastMsg} visible={toastVisible} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
