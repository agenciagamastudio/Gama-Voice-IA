
import React, { useState, useRef, useEffect } from 'react';
import { VoiceName } from './types';
import { SAMPLE_TEXTS, VOICES } from './constants';
import { ttsService } from './services/ttsService';
import { decodeBase64, decodeAudioData } from './services/audioUtils';
import { VoiceSelector } from './components/VoiceSelector';
import { 
  Square, 
  AlertCircle,
  FileText,
  Loader2,
  Mic2,
  Volume2
} from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.KORE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Progress tracking
  const [bufferedDuration, setBufferedDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playbackTimerRef = useRef<number | null>(null);

  const handleStop = () => {
    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    scheduledSourcesRef.current = [];
    setIsPlaying(false);
    setPlaybackTime(0);
    setBufferedDuration(0);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setErrorMessage("O campo de roteiro está vazio.");
      return;
    }

    handleStop();
    setErrorMessage(null);
    setIsGenerating(true);
    
    // Estimativa grosseira para a barra de progresso (80ms por caractere)
    const estTotal = Math.max(text.length * 0.085, 2);
    setEstimatedTotal(estTotal);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
        });
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      nextStartTimeRef.current = ctx.currentTime + 0.1; // Pequeno buffer inicial
      let totalBuffered = 0;
      let firstChunk = true;

      const stream = ttsService.synthesizeStream(text, selectedVoice);

      // Timer para a barra de progresso do playback
      const startTime = ctx.currentTime;
      playbackTimerRef.current = window.setInterval(() => {
        setPlaybackTime(ctx.currentTime - startTime);
      }, 50);

      for await (const base64 of stream) {
        if (firstChunk) {
          setIsGenerating(false);
          setIsPlaying(true);
          firstChunk = false;
        }

        const audioBytes = decodeBase64(base64);
        const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        const scheduleTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
        source.start(scheduleTime);
        
        scheduledSourcesRef.current.push(source);
        nextStartTimeRef.current = scheduleTime + audioBuffer.duration;
        
        totalBuffered += audioBuffer.duration;
        setBufferedDuration(totalBuffered);

        source.onended = () => {
          scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== source);
          if (scheduledSourcesRef.current.length === 0 && !isGenerating) {
            handleStop();
          }
        };
      }

    } catch (err: any) {
      setErrorMessage(err.message || "Erro na geração neural.");
      setIsGenerating(false);
      handleStop();
    }
  };

  const useSample = (sampleText: string) => {
    setText(sampleText);
  };

  // Porcentagens para a barra de progresso
  const progressPercent = Math.min((playbackTime / estimatedTotal) * 100, 100);
  const bufferPercent = Math.min((bufferedDuration / estimatedTotal) * 100, 100);

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo Gama Engine */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="bg-[#88CE11] p-1.5 rounded-[6px]">
              <Volume2 size={24} className="text-[#0E1200]" />
            </div>
            <div className="font-extrabold text-2xl tracking-tighter uppercase flex items-baseline">
              GAMA<span className="text-[#88CE11]">ENGINE</span>
            </div>
          </div>
          <p className="text-[#C9CDD2] text-[10px] font-bold uppercase tracking-[0.4em] mt-4">
            Real-time Voice Streamer
          </p>
        </div>

        <main className="ge-card p-6 sm:p-10 border-[#2E2E2E] overflow-hidden">
          {/* Editor Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#C9CDD2] uppercase flex items-center tracking-widest">
                <FileText size={16} className="mr-2 text-[#88CE11]" /> Roteiro Principal
              </label>
              <div className="flex gap-2">
                {SAMPLE_TEXTS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => useSample(SAMPLE_TEXTS[idx])}
                    className="text-[10px] px-2 py-1 rounded-[4px] border border-[#2E2E2E] text-[#C9CDD2] hover:bg-[#2E2E2E] hover:text-white transition-all font-bold uppercase focus-ring"
                  >
                    V{idx + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o roteiro para locução imediata..."
              className="w-full h-48 bg-[#2E2E2E] border border-[#2E2E2E] rounded-[12px] p-6 text-[18px] leading-[1.6] text-white placeholder-white/20 focus:border-[#88CE11] focus:ring-1 focus:ring-[#88CE11]/30 outline-none transition-all resize-none font-sans"
            />
          </div>

          {/* YouTube Style Progress Bar */}
          {(isPlaying || isGenerating) && (
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-[#C9CDD2] uppercase">
                <span>{isGenerating ? 'Carregando buffer...' : 'Reproduzindo stream'}</span>
                <span>{playbackTime.toFixed(1)}s / {bufferedDuration.toFixed(1)}s carregados</span>
              </div>
              <div className="relative h-1.5 w-full bg-[#161616] rounded-full overflow-hidden">
                {/* Buffer (Loaded) Bar */}
                <div 
                  className="absolute top-0 left-0 h-full bg-[#3A3A3A] transition-all duration-300" 
                  style={{ width: `${bufferPercent}%` }}
                />
                {/* Playback Progress Bar */}
                <div 
                  className="absolute top-0 left-0 h-full bg-[#88CE11] transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(136,206,17,0.5)]" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Voice Selector */}
          <div className="mt-8 pt-6 border-t border-[#2E2E2E]">
            <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
          </div>

          {/* Feedback Area */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-[12px] text-[#EF4444] text-sm flex items-center font-medium">
              <AlertCircle size={18} className="mr-3 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleSynthesize}
              disabled={isGenerating || isPlaying || !text.trim()}
              className={`w-full sm:flex-1 flex items-center justify-center py-5 rounded-[12px] font-bold text-[15px] uppercase tracking-[0.15em] transition-all shadow-lg ${
                isGenerating || isPlaying
                  ? 'bg-[#2E2E2E] text-[#C9CDD2] cursor-not-allowed border border-[#3A3A3A]'
                  : 'bg-[#88CE11] text-[#0E1200] hover:bg-[#66AF00] active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-5 w-5" />
                  Conectando Stream...
                </>
              ) : isPlaying ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-5 w-5" />
                  Falando agora...
                </>
              ) : (
                <>
                  <Mic2 className="mr-2 h-5 w-5" />
                  Locução Imediata
                </>
              )}
            </button>

            {(isPlaying || isGenerating) && (
              <button
                onClick={handleStop}
                className="w-full sm:w-auto px-10 py-5 bg-transparent text-[#EF4444] border border-[#EF4444]/30 rounded-[12px] font-bold hover:bg-[#EF4444]/5 transition-all flex items-center justify-center uppercase text-xs tracking-widest"
              >
                <Square size={16} className="mr-2 fill-current" />
                Parar
              </button>
            )}
          </div>
        </main>

        <footer className="flex flex-col items-center space-y-2 opacity-50">
          <p className="text-[#C9CDD2] text-[10px] font-bold uppercase tracking-[0.2em]">
            Zero-Wait Buffer • 24kHz Native PCM • Gama Engine v1.1
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
