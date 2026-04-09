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
import threading

# Audiobook processor
from audiobook_processor import (
    create_audiobook_task,
    get_audiobook_status,
    process_audiobook_queue,
    AUDIOBOOK_QUEUE
)

# Authentication
from auth import AuthDB, require_auth
import time

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

# Increase timeout for large text synthesis (client-side timeout in frontend should be increased)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 600


# Voice registry - Kokoro Portuguese voices
VOICES_PT_BR = {
    "pm_alex": {"id": "pm_alex", "gender": "male", "description": "Male voice (Portuguese)"},
    "pm_santa": {"id": "pm_santa", "gender": "male", "description": "Male voice (Portuguese)"},
    "pf_dora": {"id": "pf_dora", "gender": "female", "description": "Female voice (Portuguese)"}
}

# Initialize Auth DB
AuthDB.init_db()

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

# ============== AUTHENTICATION ENDPOINTS ==============

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Registra novo usuário"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '')

        if not email or not password or len(password) < 6:
            return jsonify({'error': 'Email e senha (mín 6 caracteres) são obrigatórios'}), 400

        result = AuthDB.register_user(email, password, name)

        if not result['success']:
            return jsonify({'error': result['error']}), 400

        return jsonify({
            'message': 'Usuário registrado com sucesso',
            'user_id': result['user_id'],
            'email': email
        }), 201

    except Exception as e:
        print(f"❌ Register error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Faz login e retorna token JWT"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400

        user = AuthDB.get_user(email)

        if not user or not AuthDB.verify_password(password, user['password_hash']):
            return jsonify({'error': 'Email ou senha incorretos'}), 401

        token = AuthDB.create_token(user['id'], user['email'])

        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200

    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_user_info():
    """Retorna informações do usuário autenticado"""
    try:
        user = AuthDB.get_user(request.user_email)

        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name']
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
        if not text or len(text) > 50000:
            return jsonify({'error': 'Invalid text (max 50000 characters)'}), 400
        if voice not in VOICES_PT_BR:
            return jsonify({'error': 'Invalid voice'}), 400
        if not (0.5 <= speed <= 2.0):
            return jsonify({'error': 'Invalid speed'}), 400

        # TTS com Kokoro
        if kokoro_model:
            try:
                print(f"  → Generating with Kokoro...")

                # Preserve line breaks and normalize text for Kokoro
                # Replace multiple spaces with single space but keep line breaks
                text_normalized = '\n'.join([line.strip() for line in text.split('\n') if line.strip()])

                # Kokoro returns a generator that yields Result objects
                result_gen = kokoro_model(text_normalized, voice=voice, speed=speed)

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

# ============== AUDIOBOOK ENDPOINTS ==============

@app.route('/api/audiobook/create', methods=['POST'])
@require_auth
def create_audiobook():
    """Cria nova tarefa de audiobook"""
    try:
        text = request.form.get('text', '').strip()
        voice = request.form.get('voice', 'pm_alex')
        speed = float(request.form.get('speed', 1.0))
        chunk_mode = request.form.get('chunkMode', 'auto')

        print(f"📚 Audiobook Request: {len(text)} chars, voice={voice}, mode={chunk_mode}")

        if not text or len(text) > 500000:
            return jsonify({'error': 'Texto inválido (máx 500k caracteres)'}), 400

        if voice not in VOICES_PT_BR:
            return jsonify({'error': 'Voz inválida'}), 400

        if not (0.5 <= speed <= 2.0):
            return jsonify({'error': 'Velocidade inválida'}), 400

        # Criar tarefa
        task_id = create_audiobook_task(text, voice, speed, chunk_mode)
        task = AUDIOBOOK_QUEUE[task_id]

        print(f"  → Task {task_id}: {len(task['chunks'])} chunks")

        # Aguardar Kokoro estar carregado (máx 60 segundos)
        wait_count = 0
        while not kokoro_model and wait_count < 60:
            time.sleep(1)
            wait_count += 1

        if not kokoro_model:
            return jsonify({'error': 'Kokoro não conseguiu carregar. Tente novamente'}), 503

        # Iniciar processamento em thread
        thread = threading.Thread(
            target=process_audiobook_queue,
            args=(task_id, kokoro_model),
            daemon=True
        )
        thread.start()

        return jsonify({
            'taskId': task_id,
            'chunks': [chunk.to_dict() for chunk in task['chunks']],
            'estimatedTime': task['estimated_time']
        }), 201

    except Exception as e:
        print(f"❌ Audiobook create error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/audiobook/status/<task_id>', methods=['GET'])
@require_auth
def get_audiobook_status_endpoint(task_id):
    """Get status de processamento"""
    status = get_audiobook_status(task_id)

    if 'error' in status and status.get('error') == 'Task not found':
        return jsonify(status), 404

    return jsonify(status), 200


@app.route('/api/audiobook/download/<task_id>', methods=['GET'])
@require_auth
def download_audiobook(task_id):
    """Download do audiobook final"""
    task = AUDIOBOOK_QUEUE.get(task_id)

    if not task:
        return jsonify({'error': 'Tarefa não encontrada'}), 404

    if task['status'] != 'completed':
        return jsonify({'error': 'Audiobook não está pronto'}), 400

    if not hasattr(task, 'final_file') or not os.path.exists(task.get('final_file', '')):
        return jsonify({'error': 'Arquivo não encontrado'}), 404

    try:
        return send_file(
            task['final_file'],
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name=f'audiobook_{task_id}.mp3'
        )
    except Exception as e:
        print(f"❌ Download error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/audiobook/cancel/<task_id>', methods=['POST'])
@require_auth
def cancel_audiobook(task_id):
    """Cancela processamento de audiobook"""
    task = AUDIOBOOK_QUEUE.get(task_id)

    if not task:
        return jsonify({'error': 'Tarefa não encontrada'}), 404

    if task['status'] in ['completed', 'error', 'cancelled']:
        return jsonify({'error': 'Tarefa não pode ser cancelada'}), 400

    task['status'] = 'cancelled'
    return jsonify({'status': 'cancelled'}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=False, threaded=True)
