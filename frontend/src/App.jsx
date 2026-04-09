import React, { useState } from 'react';
import { Volume2, Mic } from 'lucide-react';
import TextToSpeech from './pages/TextToSpeech';
import SpeechToText from './pages/SpeechToText';

export default function App() {
  const [activeTab, setActiveTab] = useState('tts'); // 'tts' or 'stt'

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col">

      {/* Header */}
      <div className="border-b border-[#2E2E2E] bg-[#0F0F0F] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Volume2 size={32} className="text-[#88CE11]" />
              <h1 className="text-3xl font-black text-white tracking-tighter">
                GAMA <span className="text-[#88CE11]">Voz</span>
              </h1>
            </div>
            <p className="text-sm text-[#C9CDD2]">Comunicação Clara e Ressonante</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-[#2E2E2E]">
            <button
              onClick={() => setActiveTab('tts')}
              className={`px-6 py-3 font-black uppercase text-sm tracking-widest transition-all border-b-2 ${
                activeTab === 'tts'
                  ? 'text-[#88CE11] border-[#88CE11]'
                  : 'text-[#C9CDD2] border-transparent hover:text-white'
              }`}
            >
              <Volume2 size={16} className="inline mr-2" />
              Texto → Voz
            </button>
            <button
              onClick={() => setActiveTab('stt')}
              className={`px-6 py-3 font-black uppercase text-sm tracking-widest transition-all border-b-2 ${
                activeTab === 'stt'
                  ? 'text-[#88CE11] border-[#88CE11]'
                  : 'text-[#C9CDD2] border-transparent hover:text-white'
              }`}
            >
              <Mic size={16} className="inline mr-2" />
              Voz → Texto
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'tts' && <TextToSpeech />}
        {activeTab === 'stt' && <SpeechToText />}
      </div>

      {/* Footer */}
      <div className="border-t border-[#2E2E2E] bg-[#0F0F0F] py-4">
        <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
          GAMA VOZ • 100% Free Forever
        </p>
      </div>
    </div>
  );
}
