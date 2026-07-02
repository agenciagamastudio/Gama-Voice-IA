"""
Clone Engine — Stub para integração futura de clonagem de voz zero-shot.

Estado atual: is_available = False (engine não instalada).

Para ativar a clonagem real, implementar:
  1. Instalar KokoClone (https://github.com/hexgrad/kokoro) com suporte a
     referência de áudio zero-shot (modelo koko-clone-v1 ou equivalente).
  2. Substituir `synthesize()` abaixo pela chamada real:
       pipeline = KokoClonePipeline(...)
       audio = pipeline(text, reference_audio=reference_audio_path)
  3. Mudar `is_available` para True (ou tornar dinâmico via try/import).

O ponto de integração em app.py já está preparado: basta `is_available` ser True
para que o pipeline de clonagem seja acionado automaticamente via voice_profile_id.
"""

from .base import TTSEngine


class CloneEngine(TTSEngine):
    """
    Engine de clonagem de voz zero-shot (stub).

    Retorna is_available = False até que o modelo KokoClone seja instalado
    e `synthesize()` seja implementado com a chamada real.
    """

    is_available: bool = False

    def synthesize(
        self,
        text: str,
        voice: str = '',
        language: str = 'pt-BR',
        speed: float = 1.0,
        reference_audio_path: str = '',
    ) -> bytes:
        """
        Sintetiza texto com clonagem de voz zero-shot.

        Args:
            text: Texto para sintetizar.
            voice: Ignorado — a voz é definida pelo reference_audio_path.
            language: Código de idioma (padrão: 'pt-BR').
            speed: Velocidade de fala (0.5–2.0).
            reference_audio_path: Caminho para o arquivo WAV/MP3 de referência
                                  (amostra de 3-5s do falante alvo).

        Returns:
            bytes: WAV audio sintetizado com a voz clonada.

        Raises:
            NotImplementedError: Sempre, enquanto o modelo não estiver instalado.
        """
        raise NotImplementedError(
            "CloneEngine não está disponível. "
            "Instale o modelo KokoClone e implemente synthesize()."
        )
