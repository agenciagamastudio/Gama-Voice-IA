import { useEffect, useRef, useState } from 'react';
import { transcribeAudio } from '../lib/api';

type MicState = 'idle' | 'recording' | 'transcribing';

const MAX_SECONDS = 120;

function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

interface MicButtonProps {
  disabled?: boolean;
  onText: (text: string) => void;
}

export default function MicButton({ disabled, onText }: MicButtonProps) {
  const [state, setState] = useState<MicState>('idle');
  const [secs, setSecs] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { stopTimer(); recRef.current?.stream.getTracks().forEach(t => t.stop()); }, []);

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        if (blob.size < 1000) { setState('idle'); return; } // gravação vazia/acidental
        setState('transcribing');
        try {
          const text = await transcribeAudio(blob);
          if (text) onText(text);
        } catch (e: any) {
          alert(`Transcrição falhou: ${e?.message || e}`);
        } finally {
          setState('idle');
        }
      };
      rec.start();
      recRef.current = rec;
      setSecs(0);
      setState('recording');
      timerRef.current = setInterval(() => {
        setSecs(s => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      alert('Não consegui acessar o microfone. Verifique a permissão do navegador.');
    }
  }

  function stop() {
    stopTimer();
    if (recRef.current?.state === 'recording') recRef.current.stop();
  }

  const mm = String(Math.floor(secs / 60)).padStart(1, '0');
  const ss = String(secs % 60).padStart(2, '0');

  if (state === 'recording') {
    return (
      <button className="mic-btn recording" title="parar e transcrever" onClick={stop}>
        ■ {mm}:{ss}
      </button>
    );
  }
  return (
    <button
      className="mic-btn"
      title={state === 'transcribing' ? 'transcrevendo…' : 'ditar por voz (Whisper)'}
      disabled={disabled || state === 'transcribing'}
      onClick={start}
    >
      {state === 'transcribing' ? '…' : '🎙'}
    </button>
  );
}
