
import React from 'react';
import { VOICES } from '../constants';
import { VoiceName } from '../types';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => {
  return (
    <div className="flex flex-col space-y-3">
      <label className="text-[10px] font-bold text-[#C9CDD2] uppercase tracking-[0.2em]">Voice Profile</label>
      <div className="grid grid-cols-1 gap-2">
        {VOICES.slice(0, 3).map((voice) => (
          <button
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className={`flex items-center justify-between p-3 rounded-[8px] border transition-all text-left focus-ring ${
              selectedVoice === voice.id
                ? 'bg-[#2E2E2E] border-[#88CE11]'
                : 'bg-transparent border-[#2E2E2E] hover:border-[#3A3A3A]'
            }`}
          >
            <div className="flex flex-col">
              <span className={`font-bold text-[12px] ${selectedVoice === voice.id ? 'text-[#88CE11]' : 'text-white'}`}>
                {voice.name}
              </span>
              <span className="text-[9px] text-[#C9CDD2] uppercase tracking-tighter">{voice.gender}</span>
            </div>
            {selectedVoice === voice.id && (
              <div className="w-1.5 h-1.5 bg-[#88CE11] rounded-full shadow-[0_0_8px_#88CE11]"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
