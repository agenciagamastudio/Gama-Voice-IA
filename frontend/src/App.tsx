import React, { useState, useEffect } from 'react'
import { Volume2, Mic, Settings, BookOpen, LogOut } from 'lucide-react'
import { Login } from './components/Login'
import TTSComponent from './components/TTS'
import STTComponent from './components/STT'
import AudiobookGenerator from './components/AudiobookGenerator'
import SettingsModal from './components/SettingsModal'
import { useAPI } from './hooks/useAPI'
import type { Voice, TTSSettings } from './types'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'tts' | 'stt' | 'audiobook'>('tts')
  const [showSettings, setShowSettings] = useState(false)
  const [voices, setVoices] = useState<Voice[]>([])
  const [settings, setSettings] = useState<TTSSettings>({
    voice: 'pm_alex',
    speed: 1.0,
    saveHistory: false,
    analyticsEnabled: false
  })
  const [health, setHealth] = useState<any>(null)

  const { fetchVoices, checkHealth } = useAPI()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('gama_voz_token')
    const userData = localStorage.getItem('gama_voz_user')

    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

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
  }, [isAuthenticated])

  const handleLoginSuccess = (token: string, userData: any) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('gama_voz_token')
    localStorage.removeItem('gama_voz_user')
    setIsAuthenticated(false)
    setUser(null)
  }

  const handleSettingChange = (newSettings: Partial<TTSSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('gama_tts_settings', JSON.stringify(updated))
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
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
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              👤 {user?.name || user?.email}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title="Configurações"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 hover:text-red-300"
              title="Sair"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Banner */}
        {health && (
          <div className="mb-6 p-4 bg-white/5 border border-[#88CE11]/30 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {health.gpu_available ? '🟢' : '🟡'} {health.gpu_available ? 'GPU Disponível' : 'Modo CPU'} • TTS: Kokoro + Edge-TTS
              </span>
              <span className="text-gray-500 text-xs">
                Circuit Breaker: {health.circuit_breaker?.state || 'N/A'}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tts')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tts'
                ? 'text-[#88CE11] border-b-2 border-[#88CE11]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-5 h-5" /> Texto para Fala
          </button>
          <button
            onClick={() => setActiveTab('stt')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stt'
                ? 'text-[#88CE11] border-b-2 border-[#88CE11]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-5 h-5" /> Fala para Texto
          </button>
          <button
            onClick={() => setActiveTab('audiobook')}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audiobook'
                ? 'text-[#88CE11] border-b-2 border-[#88CE11]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" /> Audiobook
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tts' && (
          <TTSComponent voices={voices} settings={settings} onSettingsChange={handleSettingChange} />
        )}

        {activeTab === 'stt' && (
          <STTComponent />
        )}

        {activeTab === 'audiobook' && (
          <AudiobookGenerator settings={{ voice: settings.voice, speed: settings.speed }} />
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
