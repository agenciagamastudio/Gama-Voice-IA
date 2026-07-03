#!/usr/bin/env python3
"""
GAMA Voz — Backend com Kokoro TTS (Humanizado)
TTS: Kokoro (natural, humanizada)
STT: Groq Whisper Turbo
"""

import binascii
import os
import sys
from flask import Flask, request, jsonify, send_file, send_from_directory
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
    AUDIOBOOK_QUEUE,
    AUDIOBOOK_QUEUE_LOCK
)

# Authentication
from auth import AuthDB, require_auth
import time

# License management
from api.license import license_bp
from models import LicenseKeyModel

# Voice clone
from api.voice_clone import voice_clone_bp
from models import VoiceProfileModel

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

# Initialize databases
LicenseKeyModel.init_db()
VoiceProfileModel.init_db()

# Register blueprints
app.register_blueprint(license_bp)
app.register_blueprint(voice_clone_bp)

# Configure static files (React build)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD = os.path.join(os.path.dirname(BASE_DIR), 'frontend', 'dist')

# Check if frontend build exists
if os.path.exists(FRONTEND_BUILD):
    print(f"✅ Frontend build found at {FRONTEND_BUILD}")
else:
    print(f"⚠️  Frontend build not found at {FRONTEND_BUILD} — run 'npm run build' in frontend/")

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

# Initialize TTS engines
from tts_engines import KokoroEngine, PiperEngine, CloneEngine
_kokoro_engine = KokoroEngine()
_piper_engine = PiperEngine()
_clone_engine = CloneEngine()
# Semaphore(1): only one clone synthesis at a time (XTTS-v2 ~57s on CPU).
# Non-blocking acquire returns 503 when occupied so callers get fast feedback.
_clone_semaphore = threading.Semaphore(1)
# Keep kokoro_model as alias used by audiobook_processor (passed directly)
kokoro_model = _kokoro_engine._pipeline


# ============== SERVE REACT FRONTEND (MUST BE BEFORE /api/* ROUTES) ==============

@app.route('/', methods=['GET', 'HEAD'])
def serve_root():
    """Serve React app index.html"""
    if not os.path.exists(FRONTEND_BUILD):
        return jsonify({'error': 'Frontend build not found. Run npm run build in frontend/'}), 404

    index_path = os.path.join(FRONTEND_BUILD, 'index.html')
    if not os.path.exists(index_path):
        return jsonify({'error': 'index.html not found'}), 404

    return send_from_directory(FRONTEND_BUILD, 'index.html')


@app.route('/<path:filename>', methods=['GET', 'HEAD'])
def serve_static(filename):
    """Serve static files from React build"""
    if not os.path.exists(FRONTEND_BUILD):
        return jsonify({'error': 'Frontend build not found'}), 404

    # Try to serve the requested file
    file_path = os.path.join(FRONTEND_BUILD, filename)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_BUILD, filename)

    # If file doesn't exist, return index.html for SPA routing (React Router)
    return send_from_directory(FRONTEND_BUILD, 'index.html')


# ============== API ENDPOINTS ==============

@app.route('/health', methods=['GET'])
def health():
    if _kokoro_engine.is_available:
        tts_status = "kokoro"
    elif _piper_engine.is_available:
        tts_status = "piper"
    else:
        tts_status = "unavailable"
    return jsonify({
        'status': 'ok',
        'service': 'GAMA Voz',
        'tts': tts_status,
        'kokoro': _kokoro_engine.is_available,
        'piper': _piper_engine.is_available,
    }), 200

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
        engine_preference = data.get('engine', 'auto')  # 'auto' | 'kokoro' | 'piper'
        voice_profile_id = data.get('voice_profile_id')  # optional int — triggers clone path

        print(f"🎙️ TTS Request: text='{text[:50]}...', voice={voice}, speed={speed}, engine={engine_preference}, voice_profile_id={voice_profile_id}")

        # Validations
        if not text or len(text) > 50000:
            return jsonify({'error': 'Invalid text (max 50000 characters)'}), 400
        if voice not in VOICES_PT_BR:
            return jsonify({'error': 'Invalid voice'}), 400
        if not (0.5 <= speed <= 2.0):
            return jsonify({'error': 'Invalid speed'}), 400
        if engine_preference not in ('auto', 'kokoro', 'piper'):
            return jsonify({'error': 'Invalid engine (use: auto, kokoro, piper)'}), 400

        # --- Voice profile / clone path ---
        if voice_profile_id is not None:
            # Require authentication to prevent IDOR
            auth_header = request.headers.get('Authorization', '')
            token = auth_header.split(' ', 1)[1] if auth_header.startswith('Bearer ') else None
            if not token:
                return jsonify({'error': 'Autenticação necessária para usar perfil de voz'}), 401

            auth_info = AuthDB.verify_token(token)
            if not auth_info['valid']:
                return jsonify({'error': auth_info['error']}), 401

            user_id = auth_info['user_id']

            # Validate profile ownership (prevents IDOR)
            try:
                voice_profile_id_int = int(voice_profile_id)
            except (ValueError, TypeError):
                return jsonify({'error': 'voice_profile_id inválido'}), 400
            profile = VoiceProfileModel.get_by_id(voice_profile_id_int, user_id)
            if not profile:
                return jsonify({'error': 'Perfil de voz não encontrado'}), 404

            # Clone engine stub — returns 501 until model is installed
            if not _clone_engine.is_available:
                return jsonify({'error': 'Clonagem de voz ainda não disponível nesta versão'}), 501

            # Concurrency guard: XTTS-v2 synthesis takes ~57s on CPU.
            # Only one request may synthesize at a time; others get 503.
            if not _clone_semaphore.acquire(blocking=False):
                return jsonify({
                    'error': 'clonagem em andamento, tente novamente em alguns instantes'
                }), 503
            try:
                wav_bytes = _clone_engine.synthesize(
                    text,
                    speed=speed,
                    reference_audio_path=profile['reference_audio_path'],
                )
            finally:
                _clone_semaphore.release()
            audio_buffer = io.BytesIO(wav_bytes)
            response = send_file(audio_buffer, mimetype='audio/wav')
            response.headers['X-TTS-Source'] = 'clone'
            return response, 200

        # TTS via engine abstraction — supports forced engine or auto fallback
        wav_bytes = None
        source = None

        if engine_preference == 'kokoro':
            # Force Kokoro — no fallback
            if not _kokoro_engine.is_available:
                return jsonify({'error': 'Kokoro engine not available'}), 503
            try:
                print(f"  → Generating with Kokoro (forced)...")
                wav_bytes = _kokoro_engine.synthesize(text, voice=voice, speed=speed)
                source = "kokoro"
                print(f"  ✅ Kokoro audio ready: {len(wav_bytes)} bytes")
            except Exception as e:
                print(f"  ❌ Kokoro synthesis error: {e}")
                traceback.print_exc()
                return jsonify({'error': f'Kokoro synthesis failed: {e}'}), 500

        elif engine_preference == 'piper':
            # Force Piper — no fallback
            if not _piper_engine.is_available:
                return jsonify({'error': 'Piper engine not available'}), 503
            try:
                print(f"  → Generating with Piper (forced)...")
                wav_bytes = _piper_engine.synthesize(text, speed=speed)
                source = "piper"
                print(f"  ✅ Piper audio ready: {len(wav_bytes)} bytes")
            except Exception as e:
                print(f"  ❌ Piper synthesis error: {e}")
                traceback.print_exc()
                return jsonify({'error': f'Piper synthesis failed: {e}'}), 500

        else:
            # Auto: Kokoro primary, Piper fallback
            if _kokoro_engine.is_available:
                try:
                    print(f"  → Generating with Kokoro...")
                    wav_bytes = _kokoro_engine.synthesize(text, voice=voice, speed=speed)
                    source = "kokoro"
                    print(f"  ✅ Kokoro audio ready: {len(wav_bytes)} bytes")
                except Exception as e:
                    print(f"  ⚠️ Kokoro failed, trying Piper fallback: {e}")
                    traceback.print_exc()

            if wav_bytes is None and _piper_engine.is_available:
                try:
                    print(f"  → Generating with Piper (fallback)...")
                    wav_bytes = _piper_engine.synthesize(text, speed=speed)
                    source = "piper"
                    print(f"  ✅ Piper audio ready: {len(wav_bytes)} bytes")
                except Exception as e:
                    print(f"  ❌ Piper synthesis error: {e}")
                    traceback.print_exc()

        if wav_bytes is None:
            print(f"  ❌ No TTS engine available")
            return jsonify({'error': 'No TTS engine available'}), 503

        audio_buffer = io.BytesIO(wav_bytes)
        response = send_file(audio_buffer, mimetype='audio/wav')
        response.headers['X-TTS-Source'] = source
        return response, 200

    except Exception as e:
        print(f"❌ Synthesize error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/audio/process', methods=['POST'])
@require_auth
def process_audio_effects():
    """Apply post-processing effects to audio (pitch, reverb, compressor, EQ)"""
    from audio_effects import AudioEffects
    from base64 import b64decode, b64encode

    try:
        data = request.json or {}
        audio_base64 = data.get('audio')
        effects = data.get('effects', {})

        if not audio_base64:
            return jsonify({'error': 'audio is required (base64 encoded WAV)'}), 400

        if not isinstance(effects, dict):
            return jsonify({'error': 'effects must be a JSON object'}), 400

        if len(audio_base64) > 10_000_000:  # ~7.5MB WAV
            return jsonify({'error': 'Áudio muito grande (limite ~7.5MB)'}), 413

        try:
            wav_bytes = b64decode(audio_base64)
        except binascii.Error:
            return jsonify({'error': 'base64 inválido'}), 400

        processed, skipped = AudioEffects.process(wav_bytes, effects)

        return jsonify({
            'audio': b64encode(processed).decode(),
            'effects_applied': list(effects.keys()),
            'skipped_effects': skipped,
        }), 200

    except Exception as e:
        print(f"❌ Audio effects error: {e}")
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

        # Optional audio effects chain (JSON-encoded string in form data)
        import json as _json
        effects_raw = request.form.get('effects', '')
        effects = _json.loads(effects_raw) if effects_raw else {}

        print(f"📚 Audiobook Request: {len(text)} chars, voice={voice}, mode={chunk_mode}, effects={list(effects.keys())}")

        if not text or len(text) > 500000:
            return jsonify({'error': 'Texto inválido (máx 500k caracteres)'}), 400

        if voice not in VOICES_PT_BR:
            return jsonify({'error': 'Voz inválida'}), 400

        if not (0.5 <= speed <= 2.0):
            return jsonify({'error': 'Velocidade inválida'}), 400

        # Criar tarefa
        task_id = create_audiobook_task(text, voice, speed, chunk_mode, effects=effects or None)
        task = AUDIOBOOK_QUEUE[task_id]
        task['user_id'] = request.user_id

        print(f"  → Task {task_id}: {len(task['chunks'])} chunks")

        # Aguardar Kokoro estar carregado (máx 60 segundos)
        wait_count = 0
        while not _kokoro_engine.is_available and wait_count < 60:
            time.sleep(1)
            wait_count += 1

        if not _kokoro_engine.is_available:
            return jsonify({'error': 'Kokoro não conseguiu carregar. Tente novamente'}), 503

        # Iniciar processamento em thread
        # audiobook_processor still expects the raw KPipeline object
        thread = threading.Thread(
            target=process_audiobook_queue,
            args=(task_id, _kokoro_engine._pipeline),
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
    with AUDIOBOOK_QUEUE_LOCK:
        task = AUDIOBOOK_QUEUE.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        if task.get('user_id') != request.user_id:
            return jsonify({'error': 'Task not found'}), 404

    status = get_audiobook_status(task_id)
    if 'error' in status and status.get('error') == 'Task not found':
        return jsonify(status), 404

    return jsonify(status), 200


@app.route('/api/audiobook/download/<task_id>', methods=['GET'])
@require_auth
def download_audiobook(task_id):
    """Download do audiobook final"""
    # Use lock para evitar race condition com background thread
    with AUDIOBOOK_QUEUE_LOCK:
        task = AUDIOBOOK_QUEUE.get(task_id)

        if not task:
            print(f"❌ DOWNLOAD: Task {task_id} não encontrada em AUDIOBOOK_QUEUE")
            return jsonify({'error': 'Tarefa não encontrada'}), 404

        if task.get('user_id') != request.user_id:
            return jsonify({'error': 'Tarefa não encontrada'}), 404

        status = task.get('status')
        print(f"✅ DOWNLOAD: Task encontrada. Status={status}")

        if task['status'] != 'completed':
            return jsonify({'error': f'Audiobook ainda não está pronto (status: {task["status"]})'}), 400

        if 'final_file' not in task:
            print(f"❌ DOWNLOAD: final_file não está em task. Keys: {list(task.keys())}")
            print(f"   Task dict: status={task.get('status')}, temp_dir={task.get('temp_dir')}")
            return jsonify({'error': 'Arquivo não foi criado (final_file não setado)'}), 404

        final_file = task['final_file']
        print(f"✅ DOWNLOAD: final_file={final_file}")

    # Verificar fora do lock (não bloqueia durante I/O)
    if not os.path.exists(final_file):
        print(f"❌ DOWNLOAD: Arquivo não existe em: {final_file}")
        # Debug: check parent directory
        parent_dir = os.path.dirname(final_file)
        if os.path.exists(parent_dir):
            print(f"   Parent dir exists. Contents: {os.listdir(parent_dir)}")
        return jsonify({'error': 'Arquivo não encontrado no servidor'}), 500

    try:
        print(f"📥 DOWNLOAD: Servindo audiobook: {final_file}")
        return send_file(
            final_file,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name=f'audiobook_{task_id}.mp3'
        )
    except Exception as e:
        print(f"❌ DOWNLOAD error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/audiobook/cancel/<task_id>', methods=['POST'])
@require_auth
def cancel_audiobook(task_id):
    """Cancela processamento de audiobook"""
    with AUDIOBOOK_QUEUE_LOCK:
        task = AUDIOBOOK_QUEUE.get(task_id)

        if not task:
            return jsonify({'error': 'Tarefa não encontrada'}), 404

        if task.get('user_id') != request.user_id:
            return jsonify({'error': 'Tarefa não encontrada'}), 404

        if task['status'] in ['completed', 'error', 'cancelled']:
            return jsonify({'error': 'Tarefa não pode ser cancelada'}), 400

        task['status'] = 'cancelled'
        task['finished_at'] = time.time()

    return jsonify({'status': 'cancelled'}), 200


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=False, threaded=True)
