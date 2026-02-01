
import { VoiceName, VoiceOption } from './types';

export const VOICES: VoiceOption[] = [
  { id: VoiceName.KORE, name: 'Kore (Ember Style)', description: 'Voz feminina ultra-natural, clara e acolhedora.', gender: 'Female' },
  { id: VoiceName.PUCK, name: 'Puck', description: 'Voz masculina energética e jovem.', gender: 'Male' },
  { id: VoiceName.ZEPHYR, name: 'Zephyr', description: 'Voz neutra suave e profunda.', gender: 'Neutral' },
  { id: VoiceName.CHARON, name: 'Charon', description: 'Voz masculina madura e autoritária.', gender: 'Male' },
  { id: VoiceName.AOEDE, name: 'Aoede', description: 'Voz feminina suave e expressiva.', gender: 'Female' },
];

export const SAMPLE_TEXTS = [
  "Olá, esta é a GamaGit. Transformamos seus roteiros e copies em áudios profissionais com qualidade neural para o Grupo Gama.",
  "A rádio do futuro é digital. Com o nosso sistema, a aprovação de locuções e roteiros acontece em tempo real.",
  "Atenção ouvintes: o Grupo Gama apresenta uma nova experiência sonora. Legibilidade e clareza em cada palavra sintetizada."
];
