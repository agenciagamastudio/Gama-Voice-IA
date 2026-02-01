
export class TTSService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  getVoices(): SpeechSynthesisVoice[] {
    // Retorna as vozes disponíveis, priorizando as de alta qualidade se existirem
    return this.synth.getVoices().sort((a, b) => {
      const aNatural = a.name.toLowerCase().includes('natural');
      const bNatural = b.name.toLowerCase().includes('natural');
      if (aNatural && !bNatural) return -1;
      if (!aNatural && bNatural) return 1;
      return 0;
    });
  }

  speak(text: string, voice: SpeechSynthesisVoice, options: {
    rate?: number;
    pitch?: number;
    onBoundary?: (event: SpeechSynthesisEvent) => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    onStart?: () => void;
  }) {
    this.cancel();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.voice = voice;
    this.currentUtterance.rate = options.rate || 1.0;
    this.currentUtterance.pitch = options.pitch || 1.0;
    this.currentUtterance.volume = 1.0;

    if (options.onBoundary) this.currentUtterance.onboundary = options.onBoundary;
    if (options.onEnd) this.currentUtterance.onend = options.onEnd;
    if (options.onError) this.currentUtterance.onerror = options.onError;
    if (options.onStart) this.currentUtterance.onstart = options.onStart;

    this.synth.speak(this.currentUtterance);
  }

  pause() {
    this.synth.pause();
  }

  resume() {
    this.synth.resume();
  }

  cancel() {
    this.synth.cancel();
    if (this.currentUtterance) {
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance.onboundary = null;
    }
    this.currentUtterance = null;
  }
}

export const ttsService = new TTSService();
