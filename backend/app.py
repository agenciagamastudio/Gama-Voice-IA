#!/usr/bin/env python3
"""
GAMA Voz — Backend com Kokoro TTS
TTS: Kokoro (humanizada)
STT: Groq Whisper Turbo
"""

import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from groq import Groq
import io

# Load API key from environment only
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

app = Flask(__name__)
CORS(app)

# Voice registry (5 PT-BR voices with Kokoro)
VOICES_PT_BR = {
    "antonio": {"id": "pt-BR-antonio", "gender": "male", "description": "Male voice"},
    "francisca": {"id": "pt-BR-francisca", "gender": "female", "description": "Female voice"},
    "brenda": {"id": "pt-BR-brenda", "gender": "female", "description": "Female voice"},
    "paulo": {"id": "pt-BR-paulo", "gender": "male", "description": "Male voice"},
    "maria": {"id": "pt-BR-maria", "gender": "female", "description": "Female voice"}
}

# Kokoro model
try:
    from kokoro import KokoroTTS
    kokoro = KokoroTTS()
except Exception as e:
    print(f"Kokoro init warning: {e}")
    kokoro = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'GAMA Voz'}), 200

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
        'default': 'antonio'
    }), 200

@app.route('/api/tts/synthesize', methods=['POST'])
def synthesize():
    try:
        data = request.json or {}
        text = data.get('text', '').strip()
        voice = data.get('voice', 'antonio')
        speed = float(data.get('speed', 1.0))

        # Validations
        if not text or len(text) > 5000:
            return jsonify({'error': 'Invalid text'}), 400
        if voice not in VOICES_PT_BR:
            return jsonify({'error': 'Invalid voice'}), 400
        if not (0.5 <= speed <= 2.0):
            return jsonify({'error': 'Invalid speed'}), 400

        # TTS com Kokoro
        if kokoro:
            try:
                # Kokoro synthesize returns (audio_data, sample_rate)
                audio_data, sr = kokoro.synthesize(text, voice=voice, speed=speed, lang='pt')

                # Convert to WAV bytes
                import soundfile as sf
                import numpy as np

                wav_buffer = io.BytesIO()
                sf.write(wav_buffer, audio_data, sr, format='WAV')
                wav_buffer.seek(0)

                return send_file(wav_buffer, mimetype='audio/wav'), 200
            except Exception as e:
                return jsonify({'error': f'Synthesis failed: {str(e)}'}), 500
        else:
            return jsonify({'error': 'TTS not available'}), 503

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stt/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Audio required'}), 400

        audio = request.files['audio']
        lang = request.form.get('language', 'pt')

        groq = Groq(api_key=GROQ_API_KEY)
        result = groq.audio.transcriptions.create(
            file=(audio.filename, audio.stream, audio.content_type),
            model='whisper-large-v3-turbo',
            language=lang
        )

        return jsonify({'text': result.text, 'language': lang}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=False)
