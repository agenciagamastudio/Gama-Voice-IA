import React, { useState, useRef } from 'react'
import { Mic, Copy, Download, Trash2, Loader, Clock } from 'lucide-react'
import { API_BASE_URL } from '../utils/config'
import { HistoryManager } from '../utils/history'
import HistoryPanel from './HistoryPanel'

export default function STTComponent() {
  console.log('🎙️ STTComponent mounted - History feature available')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
      setIsRecording(true)
      setRecordingStartTime(Date.now())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Acesso ao microfone negado')
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
      const duration = recordingStartTime ? Date.now() - recordingStartTime : 0
      HistoryManager.addTranscription(data.text, duration, 'pt')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
      setRecordingStartTime(null)
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
    setHistoryOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="space-y-4">
        {/* História Button */}
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full py-2 rounded-xl font-medium transition flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white"
        >
          <Clock className="w-5 h-5" />
          {historyOpen ? 'Fechar Histórico' : 'Ver Histórico'}
        </button>

        {/* History Panel */}
        {historyOpen && (
          <HistoryPanel isOpen={historyOpen} onSelectTranscription={handleSelectFromHistory} />
        )}
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-black transition flex items-center justify-center gap-2 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-[#88CE11] to-[#6ba50d] text-black hover:brightness-110'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Transcrevendo...
            </>
          ) : isRecording ? (
            <>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              Parar Gravação
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Começar a Gravar
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-400">✅ Transcrição Completa</p>
            <p className="text-white leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>

            <button
              onClick={handleClear}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
