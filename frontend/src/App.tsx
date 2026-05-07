import React, { useState, useEffect } from 'react'
import { Volume2, Mic, Settings, BookOpen, LogOut } from 'lucide-react'
import { Login } from './components/Login'
import TTSComponent from './components/TTS'
import STTComponent from './components/STT'
import AudiobookGenerator from './components/AudiobookGenerator'
import SettingsModal from './components/SettingsModal'
import ParticleBackground from './components/ParticleBackground'
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
        const voicesData = await fetchVoices()
        setVoices(voicesData)
        const healthData = await checkHealth()
        setHealth(healthData)
        const savedSettings = localStorage.getItem('gama_tts_settings')
        if (savedSettings) setSettings(JSON.parse(savedSettings))
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

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  const tabs = [
    { id: 'tts' as const, label: 'Texto para Fala', icon: <Volume2 className="w-5 h-5" /> },
    { id: 'stt' as const, label: 'Fala para Texto', icon: <Mic className="w-5 h-5" /> },
    { id: 'audiobook' as const, label: 'Audiobook', icon: <BookOpen className="w-5 h-5" /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', position: 'relative' }}>
      <ParticleBackground />

      {/* All content above canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <header className="topnav">
          <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className="pulse-green"
                style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--color-primary), #6fa80a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Volume2 style={{ width: '22px', height: '22px', color: '#000' }} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }} className="gradient-text">
                GAMA Voz
              </h1>
              {health?.version && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                  v{health.version}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                👤 {user?.name || user?.email}
              </span>
              <button
                onClick={() => setShowSettings(true)}
                title="Configurações"
                style={{
                  padding: '8px', borderRadius: '8px', background: 'transparent',
                  border: 'none', cursor: 'pointer', color: 'var(--color-text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 200ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Settings style={{ width: '22px', height: '22px' }} />
              </button>
              <button
                onClick={handleLogout}
                title="Sair"
                style={{
                  padding: '8px', borderRadius: '8px', background: 'transparent',
                  border: 'none', cursor: 'pointer', color: 'var(--color-error)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 200ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,29,72,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut style={{ width: '22px', height: '22px' }} />
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 24px' }}>

          {/* Status Banner */}
          {health && (
            <div
              className="glass-card fade-up"
              style={{
                padding: '14px 20px',
                marginBottom: '24px',
                borderColor: 'var(--color-border-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {health.gpu_available ? '🟢' : '🟡'}{' '}
                {health.gpu_available ? 'GPU Disponível' : 'Modo CPU'} · TTS: Kokoro + Edge-TTS
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Circuit Breaker: {health.circuit_breaker?.state || 'N/A'}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '32px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {tabs.map(({ id, label, icon }) => {
              const active = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '14px',
                    fontFamily: 'var(--font-main)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 200ms',
                    marginBottom: '-1px',
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.color = 'var(--color-text)'
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }}
                >
                  {icon}
                  {label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div key={activeTab} style={{ animation: 'tabEnter 220ms ease both' }}>
            {activeTab === 'tts' && (
              <div className="glass-card" style={{ padding: '32px' }}>
                <TTSComponent voices={voices} settings={settings} onSettingsChange={handleSettingChange} />
              </div>
            )}
            {activeTab === 'stt' && (
              <div className="glass-card" style={{ padding: '32px' }}>
                <STTComponent />
              </div>
            )}
            {activeTab === 'audiobook' && (
              <div className="glass-card" style={{ padding: '32px' }}>
                <AudiobookGenerator settings={{ voice: settings.voice, speed: settings.speed }} />
              </div>
            )}
          </div>
          <style>{`
            @keyframes tabEnter {
              from { opacity: 0; transform: translateY(10px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </main>
      </div>

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
