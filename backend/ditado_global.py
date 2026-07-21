#!/usr/bin/env python3
"""
GAMA Voz — Ditado Global (estilo Wispr Flow)

Segure Ctrl+Shift+Alt+Espaço em QUALQUER aplicativo do Windows, fale,
solte — o texto transcrito (Groq Whisper via backend GAMA Voz) é colado
onde o cursor estiver.

Requisitos: backend GAMA Voz rodando em http://127.0.0.1:8000
Uso: python ditado_global.py   (ou INICIAR_DITADO.bat na raiz do projeto)

Limitações conhecidas:
- Janelas rodando como Administrador só recebem o ditado se este script
  também rodar como Administrador.
- Se o clipboard tinha uma imagem, ela é perdida (só texto é restaurado).
"""

import io
import sys
import time
import threading

import numpy as np
import sounddevice as sd
import soundfile as sf
import pyperclip
import keyboard
import requests

try:
    import winsound
except ImportError:  # não-Windows: sem beeps
    winsound = None

API_BASE = 'http://127.0.0.1:8000'
HOTKEY_TRIGGER = 'space'                      # tecla final da combinação
HOTKEY_MODS = ('ctrl', 'shift', 'alt')        # modificadores exigidos
SAMPLE_RATE = 16000
MIN_DURATION_S = 0.4                          # descarta toques acidentais
CLIPBOARD_RESTORE_DELAY_S = 0.3


def beep(kind: str):
    if not winsound:
        return
    try:
        if kind == 'start':
            winsound.Beep(880, 80)
        elif kind == 'end':
            winsound.Beep(660, 80)
        elif kind == 'error':
            winsound.Beep(220, 200)
    except Exception:
        pass


class Ditado:
    def __init__(self):
        self.recording = False
        self.frames: list[np.ndarray] = []
        self.stream: sd.InputStream | None = None
        self.started_at = 0.0
        self.lock = threading.Lock()

    def start(self):
        with self.lock:
            if self.recording:
                return  # auto-repeat do Windows
            self.frames = []
            try:
                self.stream = sd.InputStream(
                    samplerate=SAMPLE_RATE, channels=1, dtype='float32',
                    callback=lambda indata, *_: self.frames.append(indata.copy())
                )
                self.stream.start()
            except Exception as e:
                print(f'❌ Erro ao abrir microfone: {e}')
                beep('error')
                self.stream = None
                return
            self.recording = True
            self.started_at = time.time()
            beep('start')
            print('🎙 Gravando... (solte a tecla para transcrever)')

    def stop_and_transcribe(self):
        with self.lock:
            if not self.recording:
                return
            self.recording = False
            duration = time.time() - self.started_at
            try:
                if self.stream:
                    self.stream.stop()
                    self.stream.close()
            except Exception:
                pass
            self.stream = None
            frames = self.frames
            self.frames = []

        beep('end')
        if duration < MIN_DURATION_S or not frames:
            print('⏭ Toque muito curto — ignorado.')
            return

        # processa fora do lock para não travar o hook de teclado
        threading.Thread(target=self._transcribe_and_paste,
                         args=(frames, duration), daemon=True).start()

    def _transcribe_and_paste(self, frames, duration):
        try:
            audio = np.concatenate(frames, axis=0)
            buf = io.BytesIO()
            sf.write(buf, audio, SAMPLE_RATE, format='WAV', subtype='PCM_16')
            buf.seek(0)

            print(f'⏳ Transcrevendo {duration:.1f}s de áudio...')
            resp = requests.post(
                f'{API_BASE}/api/stt/transcribe',
                files={'audio': ('ditado.wav', buf, 'audio/wav')},
                data={'language': 'pt'},
                timeout=120,
            )
            resp.raise_for_status()
            text = (resp.json().get('text') or '').strip()
            if not text:
                print('⚠️ Transcrição vazia.')
                beep('error')
                return

            self._paste(text)
            print(f'✅ Colado: {text[:80]}{"..." if len(text) > 80 else ""}')

            # também vira .md em Documentos/GAMA_VOZ/Transcricoes
            try:
                requests.post(
                    f'{API_BASE}/api/stt/history/save-file',
                    json={'id': f'ditado-{int(time.time()*1000)}',
                          'text': text,
                          'timestamp': int(time.time() * 1000)},
                    timeout=10,
                )
            except Exception:
                pass

        except requests.ConnectionError:
            print('❌ Backend GAMA Voz fora do ar (porta 8000). Inicie com INICIAR_GAMA.bat')
            beep('error')
        except Exception as e:
            print(f'❌ Erro no ditado: {e}')
            beep('error')

    @staticmethod
    def _paste(text: str):
        previous = None
        try:
            previous = pyperclip.paste()
        except Exception:
            pass
        pyperclip.copy(text)
        time.sleep(0.05)
        keyboard.send('ctrl+v')
        time.sleep(CLIPBOARD_RESTORE_DELAY_S)
        if previous is not None:
            try:
                pyperclip.copy(previous)
            except Exception:
                pass


def main():
    ditado = Ditado()

    def mods_pressed() -> bool:
        return all(keyboard.is_pressed(m) for m in HOTKEY_MODS)

    def on_event(event):
        if event.name != HOTKEY_TRIGGER:
            # soltou um modificador no meio da gravação → finaliza também
            if (event.event_type == 'up' and event.name in HOTKEY_MODS
                    and ditado.recording):
                ditado.stop_and_transcribe()
            return
        if event.event_type == 'down' and mods_pressed():
            ditado.start()
        elif event.event_type == 'up' and ditado.recording:
            ditado.stop_and_transcribe()

    keyboard.hook(on_event)
    print('═' * 56)
    print('  GAMA Voz — Ditado Global ativo')
    print('  Segure  Ctrl+Shift+Alt+Espaço  e fale. Solte para colar.')
    print('  Ctrl+C nesta janela para encerrar.')
    print('═' * 56)
    try:
        keyboard.wait()
    except KeyboardInterrupt:
        print('\n👋 Ditado encerrado.')
        sys.exit(0)


if __name__ == '__main__':
    main()
