import React, { useState, useEffect } from 'react'
import { Volume2, Mic, Settings } from 'lucide-react'
import TTSComponent from './components/TTS'
import STTComponent from './components/STT'
import SettingsModal from './components/SettingsModal'
import { useAPI } from './hooks/useAPI'
import type { Voice, TTSSettings } from './types'

export default function App() {
  const [activeTab, setActiveTab] = useState<'tts' | 'stt'>('tts')
  const [showSettings, setShowSettings] = useState(false)
  const [voices, setVoices] = useState<Voice[]>([])
  const [settings, setSettings] = useState<TTSSettings>({
    voice: 'antonio',
    speed: 1.0,
    saveHistory: false,
    analyticsEnabled: false
  })
  const [health, setHealth] = useState<any>(null)

  const { fetchVoices, checkHealth } = useAPI()

  useEffect(() => {
    const init = async () => {
      try {
        // Load voices
        const voicesData = await fetchVoices()
        setVoices(voicesData)

        // Check health
        const healthData = await checkHealth()
        setHealth(healthData)

        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('gama_tts_settings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      } catch (error) {
        console.error('Init error:', error)
      }
    }

    init()
  }, [])

  const handleSettingChange = (newSettings: Partial<TTSSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('gama_tts_settings', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#161616] to-[#1a1a1a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#161616]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#88CE11] to-[#6ba50d] rounded-lg flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-black text-white">GAMA Voz</h1>
            {health?.version && (
              <span className="text-xs text-gray-500 ml-2">v{health.version}</span>
            )}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Banner */}
        {health && (
          <div className="mb-6 p-4 bg-white/5 border border-[#88CE11]/30 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {health.gpu_available ? '🟢' : '🟡'} {health.gpu_available ? 'GPU Available' : 'CPU Mode'} • TTS: Kokoro + Edge-TTS
              </span>
              <span className="text-gray-500 text-xs">
                Circuit Breaker: {health.circuit_breaker?.state || 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('tts')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'tts'
                ? 'text-[#88CE11] border-b-2 border-[#88CE11]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-5 h-5" /> Text to Speech
          </button>
          <button
            onClick={() => setActiveTab('stt')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === 'stt'
                ? 'text-[#88CE11] border-b-2 border-[#88CE11]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-5 h-5" /> Speech to Text
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tts' && (
          <TTSComponent voices={voices} settings={settings} onSettingsChange={handleSettingChange} />
        )}

        {activeTab === 'stt' && (
          <STTComponent />
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={handleSettingChange}
          voices={voices}
        />
      )}
    </div>
  )
}
