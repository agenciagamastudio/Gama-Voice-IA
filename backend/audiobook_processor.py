#!/usr/bin/env python3
"""
Audiobook Generator — Processa textos longos em múltiplos chunks
"""

import uuid
import time
import threading
import os
import tempfile
import re
from typing import Dict, List, Tuple
from datetime import datetime

# Global processing queue
AUDIOBOOK_QUEUE: Dict[str, dict] = {}

class AudiobookChunk:
    """Representa um chunk de texto para síntese"""
    def __init__(self, chunk_id: int, text: str, title: str = ""):
        self.chunk_id = chunk_id
        self.text = text
        self.title = title or f"Parte {chunk_id}"
        self.char_count = len(text)

    def to_dict(self):
        return {
            'id': self.chunk_id,
            'title': self.title,
            'charCount': self.char_count
        }

class AudiobookProcessor:
    """Processa textos longos em chunks e gera audiobook"""

    MAX_CHUNK_SIZE = 40000  # Máximo de caracteres por chunk

    @staticmethod
    def detect_chapters(text: str) -> List[Tuple[str, int]]:
        """Detecta capítulos/seções no texto

        Retorna: lista de (título, posição_inicial)
        """
        patterns = [
            (r'^(CAPÍTULO|Capítulo|CHAPTER|Chapter)\s+(\d+)[:\s]', 'capítulo'),
            (r'^(#{1,3})\s+(.+?)$', 'markdown'),
            (r'^(---+)\s*$', 'separador'),
        ]

        chapters = [(None, 0)]  # Início do texto
        lines = text.split('\n')
        current_pos = 0

        for line in lines:
            for pattern, pattern_type in patterns:
                match = re.match(pattern, line, re.IGNORECASE | re.MULTILINE)
                if match:
                    if pattern_type == 'capítulo':
                        title = f"Capítulo {match.group(2)}"
                    elif pattern_type == 'markdown':
                        title = match.group(2).strip()
                    else:
                        title = None

                    if title:
                        chapters.append((title, current_pos))
                    break

            current_pos += len(line) + 1

        return chapters

    @staticmethod
    def split_by_chapters(text: str) -> List[AudiobookChunk]:
        """Divide texto por capítulos"""
        chapters = AudiobookProcessor.detect_chapters(text)
        chunks = []

        for i in range(len(chapters) - 1):
            title, start = chapters[i]
            _, end = chapters[i + 1]

            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append(AudiobookChunk(
                    len(chunks) + 1,
                    chunk_text,
                    title or f"Parte {len(chunks) + 1}"
                ))

        # Último capítulo
        title, start = chapters[-1]
        chunk_text = text[start:].strip()
        if chunk_text:
            chunks.append(AudiobookChunk(
                len(chunks) + 1,
                chunk_text,
                title or f"Parte {len(chunks) + 1}"
            ))

        return chunks

    @staticmethod
    def split_by_paragraphs(text: str, max_size: int = MAX_CHUNK_SIZE) -> List[AudiobookChunk]:
        """Divide texto por parágrafos com limite de tamanho"""
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""
        chunk_id = 1

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Se adicionar parágrafo ultrapassa o limite
            if len(current_chunk) + len(para) + 2 > max_size and current_chunk:
                chunks.append(AudiobookChunk(chunk_id, current_chunk.strip(), f"Parte {chunk_id}"))
                chunk_id += 1
                current_chunk = para + "\n\n"
            else:
                current_chunk += para + "\n\n"

        # Último chunk
        if current_chunk.strip():
            chunks.append(AudiobookChunk(chunk_id, current_chunk.strip(), f"Parte {chunk_id}"))

        return chunks

    @staticmethod
    def optimize_chunks(chunks: List[AudiobookChunk], max_size: int = MAX_CHUNK_SIZE) -> List[AudiobookChunk]:
        """Otimiza chunks: mescla pequenos, divide grandes"""
        optimized = []
        accumulated = ""
        accumulated_title = ""
        accumulated_id = 1

        for chunk in chunks:
            # Se adicionar chunk ultrapassa limite
            if len(accumulated) + len(chunk.text) + 1 > max_size and accumulated:
                optimized.append(AudiobookChunk(
                    accumulated_id,
                    accumulated.strip(),
                    accumulated_title
                ))
                accumulated_id += 1
                accumulated = chunk.text
                accumulated_title = chunk.title
            else:
                if accumulated and accumulated_title != chunk.title:
                    accumulated += f"\n\n[{chunk.title}]\n\n"
                else:
                    accumulated += "\n\n"
                accumulated += chunk.text
                if not accumulated_title:
                    accumulated_title = chunk.title

        # Último chunk
        if accumulated:
            optimized.append(AudiobookChunk(
                accumulated_id,
                accumulated.strip(),
                accumulated_title
            ))

        return optimized


def create_audiobook_task(text: str, voice: str, speed: float, chunk_mode: str = 'auto') -> str:
    """Cria nova tarefa de audiobook

    Returns: task_id
    """
    task_id = str(uuid.uuid4())

    # Dividir em chunks
    if chunk_mode == 'auto':
        chunks = AudiobookProcessor.split_by_chapters(text)
        if len(chunks) <= 1:
            chunks = AudiobookProcessor.split_by_paragraphs(text)
    else:
        chunks = AudiobookProcessor.split_by_paragraphs(text)

    # Otimizar
    chunks = AudiobookProcessor.optimize_chunks(chunks)

    # Criar tarefa
    AUDIOBOOK_QUEUE[task_id] = {
        'status': 'queued',
        'chunks': chunks,
        'processed': 0,
        'audio_files': [],
        'start_time': time.time(),
        'voice': voice,
        'speed': speed,
        'temp_dir': tempfile.mkdtemp(prefix=f'audiobook_{task_id}_'),
        'error': None,
        'estimated_time': len(chunks) * 45  # segundos (aprox)
    }

    return task_id


def get_audiobook_status(task_id: str) -> dict:
    """Get status de uma tarefa de audiobook"""
    task = AUDIOBOOK_QUEUE.get(task_id)
    if not task:
        return {'error': 'Task not found'}

    elapsed = time.time() - task['start_time']
    progress = task['processed']
    total = len(task['chunks'])

    # Calcular ETA
    if progress > 0:
        avg_time_per_chunk = elapsed / progress
        remaining_chunks = total - progress
        eta = int(avg_time_per_chunk * remaining_chunks)
    else:
        eta = task['estimated_time']

    return {
        'status': task['status'],
        'progress': progress,
        'total': total,
        'elapsed': int(elapsed),
        'eta': eta,
        'error': task['error'],
        'downloadUrl': f'/api/audiobook/download/{task_id}' if task['status'] == 'completed' else None
    }


def process_audiobook_queue(task_id: str, kokoro_model, import_soundfile=True):
    """Processa fila de audiobook (roda em thread separada)"""
    import soundfile as sf
    import numpy as np
    import io

    task = AUDIOBOOK_QUEUE[task_id]
    task['status'] = 'processing'

    try:
        for idx, chunk in enumerate(task['chunks']):
            try:
                task['status'] = f'processing_chunk_{idx+1}'
                task['current_chunk'] = idx + 1

                # Gerar áudio com Kokoro
                result_gen = kokoro_model(
                    chunk.text,
                    voice=task['voice'],
                    speed=task['speed']
                )
                result = next(result_gen)
                samples = result.audio
                sample_rate = 24000

                # Converter tensor pra numpy
                if hasattr(samples, 'numpy'):
                    samples = samples.numpy()
                elif not isinstance(samples, np.ndarray):
                    samples = np.array(samples, dtype=np.float32)

                # Salvar WAV
                wav_file = os.path.join(task['temp_dir'], f'chunk_{idx:03d}.wav')
                sf.write(wav_file, samples, sample_rate, format='WAV')
                task['audio_files'].append(wav_file)

                task['processed'] += 1

            except Exception as e:
                task['status'] = 'error'
                task['error'] = f'Chunk {idx+1}: {str(e)}'
                return

        # Todos chunks prontos → concatenar
        task['status'] = 'concatenating'
        final_file = concatenate_audiobook(task['audio_files'], task_id)

        if final_file:
            task['status'] = 'completed'
            task['final_file'] = final_file
        else:
            task['status'] = 'error'
            task['error'] = 'Falha na concatenação'

    except Exception as e:
        task['status'] = 'error'
        task['error'] = str(e)


def concatenate_audiobook(audio_files: List[str], task_id: str) -> str:
    """Concatena arquivos WAV com ffmpeg"""
    import subprocess

    if not audio_files:
        return None

    task = AUDIOBOOK_QUEUE[task_id]
    temp_dir = task['temp_dir']

    try:
        # Criar lista para ffmpeg
        list_file = os.path.join(temp_dir, 'concat_list.txt')
        with open(list_file, 'w') as f:
            for wav_file in audio_files:
                f.write(f"file '{wav_file}'\n")

        # Output final
        output_file = os.path.join(temp_dir, 'audiobook_final.mp3')

        # ffmpeg concat
        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', list_file,
            '-acodec', 'libmp3lame',
            '-q:a', '5',  # Qualidade MP3 (5 = boa qualidade)
            '-y',  # Sobrescrever
            output_file
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)

        if result.returncode == 0 and os.path.exists(output_file):
            # Limpar WAVs temporários
            for wav_file in audio_files:
                try:
                    os.remove(wav_file)
                except:
                    pass

            return output_file
        else:
            print(f"❌ FFmpeg error: {result.stderr}")
            return None

    except Exception as e:
        print(f"❌ Concatenation error: {e}")
        return None


def cleanup_audiobook_task(task_id: str, keep_days: int = 1):
    """Remove arquivos temporários de uma tarefa (após X dias)"""
    task = AUDIOBOOK_QUEUE.get(task_id)
    if not task:
        return

    elapsed_seconds = time.time() - task['start_time']
    elapsed_days = elapsed_seconds / (24 * 3600)

    if elapsed_days >= keep_days:
        temp_dir = task.get('temp_dir')
        if temp_dir and os.path.exists(temp_dir):
            try:
                import shutil
                shutil.rmtree(temp_dir)
                task['status'] = 'cleaned'
            except:
                pass
