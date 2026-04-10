import React, { useState, useRef, useEffect } from 'react'
import { Mic, Copy, Download, Trash2, Loader, Clock } from 'lucide-react'
import { API_BASE_URL } from '../utils/config'
import { HistoryManager } from '../utils/history'
import HistoryPanel from './HistoryPanel'
import AudioVisualizer from './AudioVisualizer'

export default function STTComponent() {
  console.log('🎙️ STTComponent mounted - History feature available')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioStreamRef = useRef<MediaStream | null>(null)
  const permissionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (permissionTimeoutRef.current) {
        clearTimeout(permissionTimeoutRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleStartRecording = async () => {
    try {
      setIsRequestingPermission(true)
      setError(null)

      // Timeout de 10 segundos para permissão de microfone
      const permissionTimeout = setTimeout(() => {
        setIsRequestingPermission(false)
        setError('⏱️ Timeout: permissão de microfone não respondeu. Verifique suas configurações de privacidade.')
      }, 10000)

      permissionTimeoutRef.current = permissionTimeout

      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Se chegou aqui, permissão foi concedida - limpar timeout
      if (permissionTimeoutRef.current) {
        clearTimeout(permissionTimeoutRef.current)
      }

      audioStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        handleTranscribe()
      }

      mediaRecorder.start()
      recordingStartTimeRef.current = Date.now()
      setIsRecording(true)
      setIsRequestingPermission(false)
      setError(null)
    } catch (err) {
      setIsRequestingPermission(false)
      if (permissionTimeoutRef.current) {
        clearTimeout(permissionTimeoutRef.current)
      }

      let errorMsg = 'Acesso ao microfone negado'
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMsg = '🔒 Permissão negada. Clique no ícone de câmera/microfone na barra de endereço para permitir acesso.'
        } else if (err.name === 'NotFoundError') {
          errorMsg = '🎤 Nenhum microfone detectado. Verifique sua conexão de áudio.'
        } else if (err.name === 'NotReadableError') {
          errorMsg = '⚠️ Microfone está sendo usado por outro aplicativo. Feche outros programas.'
        } else {
          errorMsg = err.message
        }
      }
      setError(errorMsg)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
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

      const response = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha na transcrição')
      }

      const data = await response.json()
      setTranscript(data.text)

      // Salvar no histórico
      const duration = recordingStartTimeRef.current ? Date.now() - recordingStartTimeRef.current : 0
      console.log('💾 Salvando no histórico - Duration:', duration, 'ms (', (duration / 1000).toFixed(2), 's )')
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
    } catch (err) {
      setError('Falha ao copiar')
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    element.href = URL.createObjectURL(
      new Blob([transcript], { type: 'text/plain' })
    )
    element.download = `transcript_${Date.now()}.txt`
    element.click()
  }

  const handleClear = () => {
    setTranscript('')
    audioChunksRef.current = []
  }

  const handleSelectFromHistory = (text: string) => {
    setTranscript(text)
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording()
    } else {
      handleStartRecording()
    }
  }

  return (
    <div className="space-y-6">
      {/* Layout: Histórico + Círculo lado a lado */}
      <div className="grid grid-cols-2 gap-6">
        {/* ESQUERDA: Histórico */}
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            Histórico
          </h3>
          <HistoryPanel isOpen={true} onSelectTranscription={handleSelectFromHistory} />
        </div>

        {/* DIREITA: Círculo + Status + Transcrição */}
        <div className="flex flex-col items-center gap-4">
          {/* Status de carregamento */}
          {isRequestingPermission && (
            <div className="text-yellow-400 text-sm flex items-center gap-2 animate-pulse">
              <Loader className="w-4 h-4 animate-spin" />
              Permitir microfone...
            </div>
          )}

          {isLoading && (
            <div className="text-blue-400 text-sm flex items-center gap-2 animate-pulse">
              <Loader className="w-4 h-4 animate-spin" />
              Transcrevendo...
            </div>
          )}

          {/* Círculo Waveform Clicável */}
          <AudioVisualizer
            isRecording={isRecording}
            audioStream={audioStreamRef.current || undefined}
            onToggleRecording={handleToggleRecording}
          />

          {/* Erro */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg w-full">
              <div className="flex justify-between items-start gap-2">
                <div className="text-red-300 text-xs leading-relaxed flex-1">
                  {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 flex-shrink-0 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Transcrição Completa */}
          {transcript && (
            <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium">✅ Transcrição</p>
                <p className="text-white text-sm leading-relaxed">
                  {transcript}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-1 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>

                <button
                  onClick={handleDownload}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-1 text-xs"
                >
                  <Download className="w-3 h-3" />
                  Baixar
                </button>

                <button
                  onClick={handleClear}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-1 text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
