
export enum VoiceName {
  KORE = 'Kore',
  PUCK = 'Puck',
  CHARON = 'Charon',
  FENRIR = 'Fenrir',
  ZEPHYR = 'Zephyr',
  AOEDE = 'Aoede'
}

export interface TTSHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  audioBlob: Blob;
  voice: VoiceName;
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  description: string;
  gender: 'Male' | 'Female' | 'Neutral';
}
