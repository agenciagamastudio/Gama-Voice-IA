import React, { useState, useEffect, useRef } from 'react'
import { Upload, Play, Pause, Download, X, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { API_BASE_URL } from '../utils/config'
import type { TTSSettings } from '../types'

interface Chunk {
  id: number
  title: string
  charCount: number
}

interface AudiobookTask {
  taskId: string
  chunks: Chunk[]
  estimatedTime: number
}

interface AudiobookStatus {
  status: 'queued' | 'processing' | 'concatenating' | 'completed' | 'error' | 'cancelled'
  progress: number
  total: number
  elapsed: number
  eta: number
  error?: string
  downloadUrl?: string
}

export default function AudiobookGenerator({ settings }: { settings: Pick<TTSSettings, 'voice' | 'speed'> }) {
  const [text, setText] = useState('')
  const [chunkMode, setChunkMode] = useState<'auto' | 'paragraph'>('auto')
  const [isCreating, setIsCreating] = useState(false)
  const [currentTask, setCurrentTask] = useState<AudiobookTask | null>(null)
  const [status, setStatus] = useState<AudiobookStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const statusPollRef = useRef<number | null>(null)

  // Poll status quando há tarefa em andamento
  useEffect(() => {
    if (!currentTask || !['queued', 'processing', 'concatenating'].includes(status?.status || '')) {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/audiobook/status/${currentTask.taskId}`)
        const statusData: AudiobookStatus = await response.json()
        setStatus(statusData)

        if (['completed', 'error', 'cancelled'].includes(statusData.status)) {
          clearInterval(pollInterval)
          if (statusData.error) {
            setError(statusData.error)
          }
        }
      } catch (err) {
        console.error('Poll error:', err)
      }
    }, 1000)

    statusPollRef.current = pollInterval
    return () => clearInterval(pollInterval)
  }, [currentTask, status?.status])

  const handleCreateAudiobook = async () => {
    if (!text.trim()) {
      setError('Por favor, digite ou cole o texto')
      return
    }

    if (text.length > 500000) {
      setError('Texto muito grande (máx 500k caracteres)')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('voice', settings.voice)
      formData.append('speed', settings.speed.toString())
      formData.append('chunkMode', chunkMode)

      const response = await fetch(`${API_BASE_URL}/api/audiobook/create`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao criar audiobook')
      }

      const taskData: AudiobookTask = await response.json()
      setCurrentTask(taskData)
      setStatus({
        status: 'queued',
        progress: 0,
        total: taskData.chunks.length,
        elapsed: 0,
        eta: taskData.estimatedTime
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = async () => {
    if (!currentTask) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/audiobook/cancel/${currentTask.taskId}`, {
        method: 'POST'
      })

      if (response.ok) {
        setCurrentTask(null)
        setStatus(null)
        setError('Audiobook cancelado')
      }
    } catch (err) {
      setError('Erro ao cancelar')
    }
  }

  const handleDownload = async () => {
    if (!status?.downloadUrl) return

    try {
      const response = await fetch(status.downloadUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audiobook_${currentTask?.taskId}.mp3`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Erro ao fazer download')
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const progressPercent = currentTask && status ? (status.progress / status.total) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white block mb-2">Texto para Audiobook</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500000))}
            placeholder="Cole ou digite o texto do seu livro, script, roteiro... (máx 500k caracteres)"
            disabled={currentTask !== null}
            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#88CE11]/50 focus:ring-2 focus:ring-[#88CE11]/20 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{text.length} / 500000</span>
            {currentTask && (
              <span className="text-[#88CE11]">
                Processando {currentTask.chunks.length} capítulo{currentTask.chunks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Options */}
        {!currentTask && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Divisão</label>
              <select
                value={chunkMode}
                onChange={(e) => setChunkMode(e.target.value as 'auto' | 'paragraph')}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#88CE11]/50"
              >
                <option value="auto">Auto-detectar capítulos</option>
                <option value="paragraph">Por parágrafo</option>
              </select>
            </div>

            <button
              onClick={handleCreateAudiobook}
              disabled={isCreating || !text.trim()}
              className="h-[50px] bg-gradient-to-r from-[#88CE11] to-[#6ba50d] text-black font-black rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-6"
            >
              <Upload className="w-4 h-4" />
              {isCreating ? 'Criando...' : 'Criar Audiobook'}
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Processing Status */}
      {currentTask && status && (
        <div className="space-y-6 p-6 bg-white/5 border border-white/10 rounded-xl">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status.status === 'completed' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : status.status === 'error' ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Clock className="w-6 h-6 text-[#88CE11] animate-spin" />
              )}
              <div>
                <p className="text-white font-medium">
                  {status.status === 'completed'
                    ? '✅ Audiobook Pronto!'
                    : status.status === 'error'
                    ? '❌ Erro no Processamento'
                    : `Processando... (${status.status})`}
                </p>
                <p className="text-sm text-gray-400">
                  {status.status === 'concatenating'
                    ? 'Unindo capítulos...'
                    : `Capítulo ${status.progress} de ${status.total}`}
                </p>
              </div>
            </div>

            {status.status === 'completed' && (
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {status.status !== 'completed' && status.status !== 'error' && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progresso</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#88CE11] to-[#6ba50d] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Time Info */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Tempo Decorrido</p>
                  <p className="text-lg font-medium text-white">{formatTime(status.elapsed)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ETA</p>
                  <p className="text-lg font-medium text-[#88CE11]">{formatTime(status.eta)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Velocidade</p>
                  <p className="text-lg font-medium text-white">
                    {status.elapsed > 0 ? (status.progress / (status.elapsed / 60)).toFixed(1) : '0'}
                    /min
                  </p>
                </div>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
              >
                Cancelar
              </button>
            </>
          )}

          {/* Download Section */}
          {status.status === 'completed' && status.downloadUrl && (
            <button
              onClick={handleDownload}
              className="w-full py-3 bg-gradient-to-r from-[#88CE11] to-[#6ba50d] text-black font-black rounded-lg hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Baixar Audiobook
            </button>
          )}

          {/* Chunks Info */}
          {currentTask && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <p className="text-xs font-medium text-gray-400 uppercase">Capítulos</p>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {currentTask.chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className={`p-2 rounded text-xs transition ${
                      chunk.id <= status.progress
                        ? 'bg-green-500/20 text-green-300'
                        : chunk.id === status.progress + 1
                        ? 'bg-[#88CE11]/20 text-[#88CE11]'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {chunk.id <= status.progress && <span className="mr-1">✓</span>}
                    {chunk.title} ({chunk.charCount.toLocaleString()} chars)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
