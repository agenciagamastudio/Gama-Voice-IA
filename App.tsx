
import React, { useState, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    scheduledSourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    scheduledSourcesRef.current = [];
    setIsPlaying(false);
    setIsGenerating(false);
    setPlaybackTime(0);
    setBufferedDuration(0);
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
  };

  // Função para dividir texto em sentenças para processamento rápido
  const splitIntoChunks = (input: string): string[] => {
    // Divide por pontos, exclamações ou interrogações, mantendo o delimitador
    const chunks = input.match(/[^.!?]+[.!?]*/g) || [input];
    // Se algum chunk for muito grande (> 200 chars), tentamos quebrar por vírgula
    return chunks.flatMap(c => {
      if (c.length > 250) {
        return c.match(/[^,]+,*/g) || [c];
      }
      return c;
    });
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setErrorMessage("O campo de roteiro está vazio.");
      return;
    }

    handleStop();
    setErrorMessage(null);
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    
    // Estimativa de duração (85ms por char é uma média segura para locução natural)
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

      nextStartTimeRef.current = ctx.currentTime + 0.1;
      let totalBuffered = 0;
      let isFirstChunkEver = true;
      const startTime = ctx.currentTime;

      // Inicia timer de progresso visual
      playbackTimerRef.current = window.setInterval(() => {
        setPlaybackTime(ctx.currentTime - startTime);
      }, 50);

      const chunks = splitIntoChunks(text);

      // Processa cada chunk em sequência mas agendando o áudio em pipeline
      for (const chunkText of chunks) {
        if (abortControllerRef.current?.signal.aborted) break;

        const stream = ttsService.synthesizeStream(chunkText, selectedVoice);

        for await (const base64 of stream) {
          if (abortControllerRef.current?.signal.aborted) break;

          if (isFirstChunkEver) {
            setIsGenerating(false);
            setIsPlaying(true);
            isFirstChunkEver = false;
          }

          const audioBytes = decodeBase64(base64);
          const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
          
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          
          // O "pulo do gato": agendar exatamente após o fim do áudio anterior
          const scheduleTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
          source.start(scheduleTime);
          
          scheduledSourcesRef.current.push(source);
          nextStartTimeRef.current = scheduleTime + audioBuffer.duration;
          
          totalBuffered += audioBuffer.duration;
          setBufferedDuration(totalBuffered);

          source.onended = () => {
            scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== source);
            // Se não há mais nada agendado e terminamos os chunks
            if (scheduledSourcesRef.current.length === 0 && !isGenerating && chunks.indexOf(chunkText) === chunks.length - 1) {
              handleStop();
            }
          };
        }
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMessage("Erro na rede ou limite de cota atingido.");
      }
      setIsGenerating(false);
      handleStop();
    }
  };

  const useSample = (sampleText: string) => {
    setText(sampleText);
  };

  const progressPercent = Math.min((playbackTime / estimatedTotal) * 100, 100);
  const bufferPercent = Math.min((bufferedDuration / estimatedTotal) * 100, 100);

  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Gama Engine */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#88CE11] p-1.5 rounded-[6px] shadow-[0_0_15px_rgba(136,206,17,0.3)]">
              <Volume2 size={24} className="text-[#0E1200]" />
            </div>
            <div className="font-extrabold text-2xl tracking-tighter uppercase flex items-baseline">
              GAMA<span className="text-[#88CE11]">ENGINE</span>
            </div>
          </div>
          <p className="text-[#C9CDD2] text-[10px] font-bold uppercase tracking-[0.4em] mt-4 opacity-70">
            Pipeline Low-Latency Synthesis
          </p>
        </div>

        <main className="ge-card p-6 sm:p-10 border-[#2E2E2E] overflow-hidden relative">
          {/* Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-[#C9CDD2] uppercase flex items-center tracking-widest">
                <FileText size={16} className="mr-2 text-[#88CE11]" /> Roteiro de Locução
              </label>
              <div className="flex gap-2">
                {SAMPLE_TEXTS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => useSample(SAMPLE_TEXTS[idx])}
                    disabled={isPlaying || isGenerating}
                    className="text-[10px] px-2 py-1 rounded-[4px] border border-[#2E2E2E] text-[#C9CDD2] hover:bg-[#2E2E2E] hover:text-white transition-all font-bold uppercase focus-ring disabled:opacity-30"
                  >
                    EX {idx + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isPlaying || isGenerating}
              placeholder="Cole seu roteiro longo aqui. O sistema começará a falar os primeiros parágrafos enquanto carrega o resto..."
              className="w-full h-56 bg-[#2E2E2E] border border-[#2E2E2E] rounded-[12px] p-6 text-[18px] leading-[1.6] text-white placeholder-white/20 focus:border-[#88CE11] focus:ring-1 focus:ring-[#88CE11]/30 outline-none transition-all resize-none font-sans disabled:opacity-50"
            />
          </div>

          {/* YouTube Style Stream Progress */}
          {(isPlaying || isGenerating) && (
            <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between text-[10px] font-mono font-bold text-[#88CE11] uppercase tracking-widest">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-[#88CE11] rounded-full mr-2 animate-pulse"></span>
                  {isGenerating ? 'Enfileirando Blocos...' : 'Live Stream Ativo'}
                </span>
                <span className="text-[#C9CDD2]">{playbackTime.toFixed(1)}s de áudio</span>
              </div>
              <div className="relative h-1 w-full bg-[#161616] rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#3A3A3A] transition-all duration-500 ease-out" 
                  style={{ width: `${bufferPercent}%` }}
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-[#88CE11] transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(136,206,17,0.8)]" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Voice Selector */}
          <div className="mt-8 pt-6 border-t border-[#2E2E2E]">
            <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
          </div>

          {/* Erros */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-[12px] text-[#EF4444] text-sm flex items-center font-bold">
              <AlertCircle size={18} className="mr-3 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Botões */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleSynthesize}
              disabled={isGenerating || isPlaying || !text.trim()}
              className={`w-full sm:flex-1 flex items-center justify-center py-5 rounded-[12px] font-bold text-[15px] uppercase tracking-[0.2em] transition-all ${
                isGenerating || isPlaying
                  ? 'bg-[#2E2E2E] text-[#C9CDD2] border border-[#3A3A3A] cursor-not-allowed'
                  : 'bg-[#88CE11] text-[#0E1200] hover:bg-[#66AF00] active:scale-[0.98] shadow-lg shadow-[#88CE11]/10'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-5 w-5" />
                  Conectando...
                </>
              ) : isPlaying ? (
                <>
                  <div className="flex gap-1 mr-3">
                    <span className="w-1 h-4 bg-[#0E1200] animate-[bounce_1s_infinite_0ms]"></span>
                    <span className="w-1 h-4 bg-[#0E1200] animate-[bounce_1s_infinite_200ms]"></span>
                    <span className="w-1 h-4 bg-[#0E1200] animate-[bounce_1s_infinite_400ms]"></span>
                  </div>
                  Transmitindo Voz
                </>
              ) : (
                <>
                  <Mic2 className="mr-2 h-5 w-5" />
                  Iniciar Locução
                </>
              )}
            </button>

            {(isPlaying || isGenerating) && (
              <button
                onClick={handleStop}
                className="w-full sm:w-auto px-10 py-5 bg-[#2E2E2E] text-[#EF4444] border border-[#EF4444]/30 rounded-[12px] font-bold hover:bg-[#EF4444]/10 transition-all flex items-center justify-center uppercase text-xs tracking-[0.2em]"
              >
                <Square size={16} className="mr-2 fill-current" />
                Stop
              </button>
            )}
          </div>
        </main>

        <footer className="flex flex-col items-center space-y-2 opacity-40">
          <p className="text-[#C9CDD2] text-[9px] font-bold uppercase tracking-[0.3em]">
            Chunk-based Delivery • Buffer-Ahead Tech • Gama Engine v1.2
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
