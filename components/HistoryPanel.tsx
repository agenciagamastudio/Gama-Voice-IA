
import React from 'react';
import { TTSHistoryItem } from '../types';
import { History, Download } from 'lucide-react';

interface HistoryPanelProps {
  history: TTSHistoryItem[];
  onDownload: (item: TTSHistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onDownload }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center space-x-2 mb-6">
        <History size={20} className="text-black" />
        <h3 className="text-[18px] font-bold text-black tracking-tight">Histórico de Assets</h3>
      </div>
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="gama-card p-4 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="flex-1 mr-4 overflow-hidden">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded uppercase">RELEASE</span>
                <p className="text-sm font-medium text-black truncate">{item.text}</p>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                <span className="uppercase">{item.voice}</span>
                <span>•</span>
                <span>{new Date(item.timestamp).toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
            <button
              onClick={() => onDownload(item)}
              className="p-2 text-slate-400 hover:text-black transition-colors rounded-[8px] hover:bg-slate-100"
              title="Baixar Asset"
            >
              <Download size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
