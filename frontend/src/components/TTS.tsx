import React, { useState } from 'react'
import { Volume2, Copy, Download, Loader } from 'lucide-react'
import { API_BASE_URL } from '../utils/config'
import type { Voice, TTSSettings } from '../types'

interface Props {
  voices: Voice[]
  settings: TTSSettings
  onSettingsChange: (settings: Partial<TTSSettings>) => void
}

export default function TTSComponent({ voices, settings, onSettingsChange }: Props) {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setError('Text cannot be empty')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.voice,
          speed: settings.speed,
          engine: 'kokoro'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Synthesis failed')
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Copy failed')
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return

    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `synthesis_${Date.now()}.mp3`
    a.click()
  }

  const handlePreview = async () => {
    const previewText = "Teste de qualidade com voz " + settings.voice
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewText,
          voice: settings.voice,
          speed: settings.speed,
          engine: 'edge-tts'
        })
      })

      if (!response.ok) throw new Error('Preview failed')

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)
      audio.play()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    onSettingsChange({ voice: 'antonio', speed: 1.0 })
  }

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Text to Synthesize</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#88CE11]/50 focus:ring-2 focus:ring-[#88CE11]/20"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{text.length} / 5000</span>
          {text.length > 0 && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[#88CE11] hover:text-white transition"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Voice</label>
            <select
              value={settings.voice}
              onChange={(e) => onSettingsChange({ voice: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#88CE11]/50"
            >
              {['antonio', 'francisca', 'brenda', 'paulo', 'maria'].map((voice) => (
                <option key={voice} value={voice}>
                  {voice.charAt(0).toUpperCase() + voice.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Speed ({settings.speed.toFixed(1)}x)</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.speed}
              onChange={(e) => onSettingsChange({ speed: parseFloat(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #88CE11 0%, #88CE11 ${((settings.speed - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.1) ${((settings.speed - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            disabled={isLoading || !text.trim()}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Voice
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Synthesize Button */}
      <button
        onClick={handleSynthesize}
        disabled={isLoading || !text.trim()}
        className="w-full bg-gradient-to-r from-[#88CE11] to-[#6ba50d] text-black font-black py-4 rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Synthesizing...
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5" />
            Synthesize
          </>
        )}
      </button>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-400">✅ Synthesis Complete</p>
            <audio
              controls
              src={audioUrl}
              className="w-full bg-white/5 rounded-lg"
            />
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Audio
          </button>
        </div>
      )}
    </div>
  )
}
