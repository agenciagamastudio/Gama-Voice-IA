
import React, { useState, useEffect, useMemo } from 'react';
import { ttsService } from './services/ttsService';
import { SAMPLE_TEXTS, VOICES } from './constants';
import { VoiceName } from './types';
import { 
  Square, 
  FileText,
  Volume2,
  Play,
  RotateCcw,
  Zap,
  MousePointer2,
  Settings2,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface WordToken {
  word: string;
  start: number;
  end: number;
  index: number;
}

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.KORE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  
  const tokens = useMemo(() => {
    if (!text) return [];
    const wordRegex = /\S+/g;
    const result: WordToken[] = [];
    let match;
    let i = 0;

    while ((match = wordRegex.exec(text)) !== null) {
      result.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        index: i++
      });
    }
    return result;
  }, [text]);

  const handleStop = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsLoading(false);
    setActiveWordIndex(-1);
  };

  const handlePlay = async (fromIndex: number = 0) => {
    if (!text) return;

    handleStop();
    setIsLoading(true);

    const textToSpeak = text.substring(tokens[fromIndex]?.start || 0);

    await ttsService.generateAndPlay(textToSpeak, selectedVoice, {
      onStart: () => {
        setIsLoading(false);
        setIsPlaying(true);
      },
      onEnd: () => {
        setIsPlaying(false);
        setActiveWordIndex(-1);
      },
      onError: (err) => {
        console.error(err);
        setIsLoading(false);
        setIsPlaying(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-6xl w-full space-y-6 animate-in fade-in duration-700">
        
        {/* Header Engine */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="bg-[#88CE11] p-2 rounded-lg shadow-[0_0_40px_rgba(136,206,17,0.3)]">
              <Volume2 size={24} className="text-[#0E1200]" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">
                GAMA<span className="text-[#88CE11]">ENGINE</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-[#88CE11] font-bold uppercase tracking-[0.3em] bg-[#88CE11]/10 px-1.5 py-0.5 rounded">AI Neural TTS 2.5</span>
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
                Draft {i + 1}
              </button>
            ))}
          </div>
        </div>

        <main className="ge-card border-[#1E1E1E] overflow-hidden flex flex-col lg:flex-row h-[700px] lg:h-[600px] shadow-2xl">
          
          {/* Lado Esquerdo: Composer */}
          <div className="w-full lg:w-5/12 p-8 border-b lg:border-b-0 lg:border-r border-[#1E1E1E] flex flex-col bg-[#141414]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-[#88CE11] uppercase tracking-[0.2em] flex items-center">
                <FileText size={14} className="mr-2" /> Script Composer
              </h3>
              <div className="flex items-center gap-2">
                <Zap size={14} className={`${isLoading ? 'text-[#88CE11] animate-pulse' : 'text-white/10'}`} />
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o roteiro para processamento neural..."
              className="flex-1 bg-transparent text-lg leading-relaxed text-white/90 placeholder-white/5 resize-none outline-none font-medium scrollbar-hide"
            />

            <div className="mt-6 pt-6 border-t border-[#1E1E1E] space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#C9CDD2] uppercase tracking-widest mb-3 flex items-center gap-2">
                   <Settings2 size={12} /> Neural Voice Profile
                </label>
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[120px] custom-scrollbar pr-2">
                  {VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                        selectedVoice === v.id
                          ? 'bg-[#88CE11]/10 border-[#88CE11] text-[#88CE11]'
                          : 'bg-transparent border-[#2E2E2E] text-white/60 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{v.name}</span>
                        <span className="text-[9px] uppercase opacity-50">{v.gender} • Neural</span>
                      </div>
                      {selectedVoice === v.id && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Preview */}
          <div className="w-full lg:w-7/12 p-8 flex flex-col bg-[#0A0A0A] relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-bold text-[#C9CDD2] uppercase tracking-[0.2em] flex items-center">
                <MousePointer2 size={14} className="mr-2" /> Live Prompt View
              </h3>
              <div className="flex items-center gap-3">
                <div className={`text-[9px] font-bold flex items-center gap-1 px-2 py-1 rounded ${isLoading ? 'bg-[#88CE11]/20 text-[#88CE11]' : 'bg-white/5 text-white/30'}`}>
                  {isLoading ? 'GENERATING...' : 'READY'}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {tokens.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#1E1E1E] opacity-30">
                  <Volume2 size={80} strokeWidth={1} />
                  <p className="font-black text-2xl uppercase tracking-tighter mt-4">Waiting for Input</p>
                </div>
              ) : (
                <div className="flex flex-wrap content-start gap-x-1.5 gap-y-3">
                  {tokens.map((token) => (
                    <span
                      key={token.index}
                      onClick={() => handlePlay(token.index)}
                      className={`cursor-pointer px-1.5 py-0.5 rounded-md transition-all duration-300 text-2xl lg:text-3xl leading-snug select-none ${
                        isPlaying 
                          ? 'text-[#88CE11] font-bold opacity-100' 
                          : 'text-[#2A2A2A] hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      {token.word}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="mt-8 pt-8 border-t border-[#1E1E1E] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => isPlaying ? handleStop() : handlePlay(0)}
                    disabled={tokens.length === 0 || isLoading}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isPlaying 
                        ? 'bg-[#EF4444] text-white hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                        : 'bg-[#88CE11] text-[#0E1200] hover:scale-110 shadow-[0_0_40px_rgba(136,206,17,0.3)]'
                    } disabled:opacity-20`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : isPlaying ? (
                      <Square size={24} fill="currentColor" />
                    ) : (
                      <Play size={28} className="ml-1" fill="currentColor" />
                    )}
                  </button>
                  
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Processing Engine</p>
                    <p className={`text-sm font-bold uppercase tracking-widest ${isPlaying || isLoading ? 'text-[#88CE11]' : 'text-[#2E2E2E]'}`}>
                      {isLoading ? 'Synthesizing Neural Voice...' : isPlaying ? 'Transmitting Audio...' : 'System Standby'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleStop}
                    className="p-4 bg-[#1A1A1A] rounded-2xl hover:bg-[#2E2E2E] transition-all border border-[#2E2E2E] text-[#C9CDD2]"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="flex flex-col sm:flex-row justify-between items-center px-4 gap-4 opacity-20">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Gemini 2.5 Flash Preview • PCM Output • Zero Latency Core</p>
          <div className="h-[1px] flex-1 bg-white/10 hidden sm:block mx-8"></div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em]">GRUPO GAMA © 2024</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
