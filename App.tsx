
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ttsService } from './services/ttsService';
import { SAMPLE_TEXTS } from './constants';
import { 
  Square, 
  AlertCircle,
  FileText,
  Volume2,
  Play,
  RotateCcw,
  Zap,
  MousePointer2,
  Settings2
} from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(-1);
  const [rate, setRate] = useState(1);
  
  // Divide o texto em frases para o player interativo
  const chunks = useMemo(() => {
    if (!text) return [];
    // Divide por pontuação mantendo o contexto para o locutor
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    return sentences.map((s, i) => ({
      id: i,
      text: s.trim(),
    })).filter(c => c.text.length > 0);
  }, [text]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = ttsService.getVoices();
      // Priorizar vozes "Natural" em Português ou Inglês
      const ptVoices = availableVoices.filter(v => v.lang.startsWith('pt'));
      setVoices(availableVoices);
      
      if (ptVoices.length > 0) {
        // Tenta pegar a mais natural primeiro
        const natural = ptVoices.find(v => v.name.toLowerCase().includes('natural'));
        setSelectedVoiceURI(natural ? natural.voiceURI : ptVoices[0].voiceURI);
      } else if (availableVoices.length > 0) {
        setSelectedVoiceURI(availableVoices[0].voiceURI);
      }
    };

    loadVoices();
    // Alguns navegadores demoram para carregar a lista de vozes
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => { ttsService.cancel(); };
  }, []);

  const handleStop = () => {
    ttsService.cancel();
    setIsPlaying(false);
    setActiveChunkIndex(-1);
  };

  const playFromIndex = (index: number) => {
    const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (!voice) return;

    handleStop();
    setActiveChunkIndex(index);
    setIsPlaying(true);

    // Concatenar o texto a partir do índice selecionado
    const remainingText = chunks.slice(index).map(c => c.text).join(' ');

    ttsService.speak(remainingText, voice, {
      rate: rate,
      onStart: () => setIsPlaying(true),
      onEnd: () => {
        setIsPlaying(false);
        setActiveChunkIndex(-1);
      },
      onBoundary: (event) => {
        if (event.name === 'word') {
          // Lógica de destaque por caractere (mais precisa para o motor local)
          let charCount = 0;
          for (let i = index; i < chunks.length; i++) {
            const chunkLen = chunks[i].text.length + 1; // +1 pelo espaço/delimitador
            if (event.charIndex >= charCount && event.charIndex < charCount + chunkLen) {
              setActiveChunkIndex(i);
              break;
            }
            charCount += chunkLen;
          }
        }
      },
      onError: () => handleStop()
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    playFromIndex(idx);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-6xl w-full space-y-6 animate-in fade-in duration-500">
        
        {/* Header Profissional */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#88CE11] p-2 rounded-lg shadow-[0_0_30px_rgba(136,206,17,0.2)]">
              <Volume2 size={24} className="text-[#0E1200]" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">
                GAMA<span className="text-[#88CE11]">ENGINE</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-[#88CE11] font-bold uppercase tracking-[0.3em] bg-[#88CE11]/10 px-1.5 py-0.5 rounded">Unlimited Offline Engine</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 bg-[#1A1A1A] p-1.5 rounded-xl border border-[#2E2E2E]">
            {SAMPLE_TEXTS.map((_, i) => (
              <button 
                key={i}
                onClick={() => setText(SAMPLE_TEXTS[i])}
                className="text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-[#2E2E2E] transition-all uppercase tracking-widest text-[#C9CDD2]"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>
        </div>

        <main className="ge-card border-[#1E1E1E] overflow-hidden flex flex-col lg:flex-row h-[700px] lg:h-[600px] shadow-2xl">
          
          {/* Editor de Texto (Lado Esquerdo) */}
          <div className="w-full lg:w-5/12 p-8 border-b lg:border-b-0 lg:border-r border-[#1E1E1E] flex flex-col bg-[#141414]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-[#88CE11] uppercase tracking-[0.2em] flex items-center">
                <FileText size={14} className="mr-2" /> Script Composer
              </h3>
              <Zap size={14} className="text-[#88CE11] animate-pulse" />
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole seu roteiro para locução instantânea..."
              className="flex-1 bg-transparent text-lg leading-relaxed text-white/90 placeholder-white/5 resize-none outline-none font-medium scrollbar-hide"
            />

            <div className="mt-6 pt-6 border-t border-[#1E1E1E] space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#C9CDD2] uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Settings2 size={12} /> Configurações de Voz
                </label>
                <select 
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-[#88CE11] transition-colors"
                >
                  {voices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-[#C9CDD2]">
                  <span>Velocidade</span>
                  <span className="text-[#88CE11]">{rate}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2" step="0.1" 
                  value={rate} 
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#1E1E1E] rounded-full appearance-none accent-[#88CE11]"
                />
              </div>
            </div>
          </div>

          {/* Player Interativo (Lado Direito) */}
          <div className="w-full lg:w-7/12 p-8 flex flex-col bg-[#0A0A0A] relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-[#C9CDD2] uppercase tracking-[0.2em] flex items-center">
                <MousePointer2 size={14} className="mr-2" /> Live Prompt View
              </h3>
              <div className="text-[10px] font-mono text-[#88CE11] bg-[#88CE11]/5 px-2 py-1 rounded">
                READY • LOCAL ENGINE
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-2 custom-scrollbar">
              {chunks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#1E1E1E] opacity-30">
                  <Volume2 size={80} strokeWidth={1} />
                  <p className="font-black text-2xl uppercase tracking-tighter mt-4">Waiting for Script</p>
                </div>
              ) : (
                <div className="flex flex-wrap content-start gap-x-2 gap-y-4">
                  {chunks.map((chunk, idx) => (
                    <span
                      key={idx}
                      onClick={() => playFromIndex(idx)}
                      className={`cursor-pointer px-3 py-2 rounded-xl transition-all duration-300 text-2xl lg:text-3xl leading-snug select-none ${
                        activeChunkIndex === idx 
                          ? 'bg-[#88CE11] text-[#0E1200] font-black shadow-[0_0_30px_rgba(136,206,17,0.4)] scale-105 z-10' 
                          : 'text-[#333] hover:text-white/80'
                      }`}
                    >
                      {chunk.text}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Barra de Progresso e Controles */}
            <div className="mt-8 pt-8 border-t border-[#1E1E1E] space-y-6">
              <div className="relative group">
                <input 
                  type="range"
                  min="0"
                  max={Math.max(0, chunks.length - 1)}
                  value={activeChunkIndex === -1 ? 0 : activeChunkIndex}
                  onChange={handleSeek}
                  className="w-full h-2 bg-[#1E1E1E] rounded-full appearance-none cursor-pointer accent-[#88CE11] group-hover:h-3 transition-all"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => isPlaying ? handleStop() : playFromIndex(0)}
                    disabled={chunks.length === 0}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isPlaying 
                        ? 'bg-[#EF4444] text-white hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                        : 'bg-[#88CE11] text-[#0E1200] hover:scale-110 shadow-[0_0_30px_rgba(136,206,17,0.3)]'
                    } disabled:opacity-10`}
                  >
                    {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
                  </button>
                  
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Locution Status</p>
                    <p className={`text-sm font-bold uppercase tracking-widest ${isPlaying ? 'text-[#88CE11]' : 'text-[#2E2E2E]'}`}>
                      {isPlaying ? 'Synthesizing Audio...' : 'Idle / Standby'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleStop}
                    title="Reiniciar"
                    className="p-4 bg-[#1A1A1A] rounded-2xl hover:bg-[#2E2E2E] transition-all border border-[#2E2E2E] text-[#C9CDD2]"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex flex-col sm:flex-row justify-between items-center px-4 gap-4 opacity-30">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Zero API Calls • No Billing • Local Browser Engine</p>
          <div className="h-[1px] flex-1 bg-white/10 hidden sm:block mx-8"></div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Gama Engine v2.1 • 100% Free Forever</p>
        </footer>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E1E1E; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #88CE11; }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #88CE11;
          box-shadow: 0 0 10px rgba(136,206,17,0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default App;
