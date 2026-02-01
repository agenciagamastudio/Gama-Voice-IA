
import React from 'react';
import { VOICES } from '../constants';
import { VoiceName } from '../types';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => {
  return (
    <div className="flex flex-col space-y-4">
      <label className="text-[11px] font-bold text-[#C9CDD2] uppercase tracking-[0.2em]">Configuração de Voz</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOICES.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className={`flex flex-col p-4 rounded-[12px] border transition-all text-left group focus-ring ${
              selectedVoice === voice.id
                ? 'bg-[#2E2E2E] border-[#88CE11] shadow-[0_0_12px_rgba(136,206,17,0.15)]'
                : 'bg-[#272727] border-[#2E2E2E] hover:border-[#3A3A3A] hover:bg-[#2E2E2E]'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold text-sm ${selectedVoice === voice.id ? 'text-[#88CE11]' : 'text-white'}`}>
                {voice.name}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter ${
                selectedVoice === voice.id 
                  ? 'bg-[#88CE11]/10 text-[#88CE11] border border-[#88CE11]/30' 
                  : 'bg-[#2E2E2E] text-[#C9CDD2]'
              }`}>
                {voice.gender === 'Female' ? 'Feminino' : voice.gender === 'Male' ? 'Masculino' : 'Neutro'}
              </span>
            </div>
            <p className={`text-[11px] leading-tight ${selectedVoice === voice.id ? 'text-white/70' : 'text-[#C9CDD2]'}`}>
              {voice.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
