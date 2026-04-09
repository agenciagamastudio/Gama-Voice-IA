#!/usr/bin/env python3
"""
GAMA Voz — Backend com Kokoro TTS (Humanizado)
TTS: Kokoro (natural, humanizada)
STT: Groq Whisper Turbo
"""

import os
import sys
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from groq import Groq
import io
import numpy as np
import traceback

# Try to load .env using python-dotenv, fallback to manual loading
try:
    from dotenv import load_dotenv
    # Load from parent directory (.env is in GAMA_VOZ/, backend is in GAMA_VOZ/backend/)
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        load_dotenv(env_path)
except ImportError:
    # Fallback: manual loading if python-dotenv not available
    env_paths = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'),
        '.env'
    ]
    for env_file in env_paths:
        if os.path.exists(env_file):
            try:
                with open(env_file) as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            os.environ[key] = value
                print(f"✅ Loaded .env from {env_file}")
                break
            except Exception as e:
                print(f"❌ Error loading {env_file}: {e}")

# Load API key from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

app = Flask(__name__)
CORS(app)


# Voice registry - Kokoro Portuguese voices
VOICES_PT_BR = {
    "pm_alex": {"id": "pm_alex", "gender": "male", "description": "Male voice (Portuguese)"},
    "pm_santa": {"id": "pm_santa", "gender": "male", "description": "Male voice (Portuguese)"},
    "pf_dora": {"id": "pf_dora", "gender": "female", "description": "Female voice (Portuguese)"}
}

# Initialize Kokoro
kokoro_model = None
try:
    from kokoro import KPipeline
    kokoro_model = KPipeline(lang_code='p')  # 'p' para português
    print("✅ Kokoro TTS loaded successfully")
except Exception as e:
    print(f"❌ Kokoro init failed: {e}")
    traceback.print_exc()

@app.route('/health', methods=['GET'])
def health():
    tts_status = "kokoro" if kokoro_model else "fallback"
    return jsonify({'status': 'ok', 'service': 'GAMA Voz', 'tts': tts_status}), 200

@app.route('/api/config', methods=['GET'])
def config():
    return jsonify({
        'app': 'GAMA Voz',
        'tts': 'kokoro',
        'stt': 'groq-whisper',
        'voices': list(VOICES_PT_BR.keys())
    }), 200

@app.route('/api/tts/voices', methods=['GET'])
def get_voices():
    return jsonify({
        'voices': list(VOICES_PT_BR.keys()),
        'details': VOICES_PT_BR,
        'default': 'pm_alex'
    }), 200

@app.route('/api/tts/synthesize', methods=['POST'])
def synthesize():
    try:
        data = request.json or {}
        text = data.get('text', '').strip()
        voice = data.get('voice', 'pm_alex')
        speed = float(data.get('speed', 1.0))

        print(f"🎙️ TTS Request: text='{text[:50]}...', voice={voice}, speed={speed}")

        # Validations
        if not text or len(text) > 5000:
            return jsonify({'error': 'Invalid text'}), 400
        if voice not in VOICES_PT_BR:
            return jsonify({'error': 'Invalid voice'}), 400
        if not (0.5 <= speed <= 2.0):
            return jsonify({'error': 'Invalid speed'}), 400

        # TTS com Kokoro
        if kokoro_model:
            try:
                print(f"  → Generating with Kokoro...")

                # Kokoro returns a generator that yields Result objects
                result_gen = kokoro_model(text, voice=voice, speed=speed)

                # Get the first (and usually only) result
                result = next(result_gen)

                # Extract audio samples (tensor) from result
                samples = result.audio

                # Kokoro sample rate is 24000 Hz
                sample_rate = 24000

                # Convert to WAV format
                import soundfile as sf
                audio_buffer = io.BytesIO()

                # Convert torch tensor to numpy array if necessary
                if hasattr(samples, 'numpy'):
                    samples = samples.numpy()  # torch.Tensor → numpy
                elif not isinstance(samples, np.ndarray):
                    samples = np.array(samples, dtype=np.float32)

                # Write WAV
                sf.write(audio_buffer, samples, sample_rate, format='WAV')
                audio_buffer.seek(0)

                print(f"  ✅ Audio ready: {audio_buffer.getbuffer().nbytes} bytes")
                return send_file(audio_buffer, mimetype='audio/wav'), 200

            except Exception as e:
                print(f"  ❌ Kokoro synthesis error: {e}")
                traceback.print_exc()
                return jsonify({'error': f'Kokoro failed: {str(e)}'}), 500
        else:
            print(f"  ❌ Kokoro not loaded")
            return jsonify({'error': 'Kokoro TTS not available'}), 503

    except Exception as e:
        print(f"❌ Synthesize error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/stt/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Audio required'}), 400

        audio = request.files['audio']
        lang = request.form.get('language', 'pt')

        if not GROQ_API_KEY:
            return jsonify({'error': 'STT not configured'}), 503

        groq = Groq(api_key=GROQ_API_KEY)
        result = groq.audio.transcriptions.create(
            file=(audio.filename, audio.stream, audio.content_type),
            model='whisper-large-v3-turbo',
            language=lang
        )

        return jsonify({'text': result.text, 'language': lang}), 200

    except Exception as e:
        print(f"❌ Transcribe error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=False)
