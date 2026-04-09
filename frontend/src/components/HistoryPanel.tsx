import React, { useState, useEffect } from 'react'
import {
  Trash2,
  Download,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import type { TranscriptionRecord } from '../utils/history'
import { HistoryManager } from '../utils/history'
import HistorySearch from './HistorySearch'
import HistoryStats from './HistoryStats'

interface HistoryPanelProps {
  isOpen: boolean
  onSelectTranscription: (text: string) => void
}

export default function HistoryPanel({ isOpen, onSelectTranscription }: HistoryPanelProps) {
  const [history, setHistory] = useState<TranscriptionRecord[]>([])
  const [filteredHistory, setFilteredHistory] = useState<TranscriptionRecord[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [stats, setStats] = useState(HistoryManager.getStats())

  useEffect(() => {
    if (isOpen) {
      const allHistory = HistoryManager.getHistory()
      setHistory(allHistory)
      setFilteredHistory(allHistory)
      setStats(HistoryManager.getStats())
    }
  }, [isOpen])

  const handleRemove = (id: string) => {
    HistoryManager.remove(id)
    setHistory(HistoryManager.getHistory())
    setStats(HistoryManager.getStats())
  }

  const handleClear = () => {
    if (window.confirm('Tem certeza que quer limpar todo o histórico?')) {
      HistoryManager.clear()
      setHistory([])
      setStats(HistoryManager.getStats())
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    const content = format === 'json' ? HistoryManager.exportAsJSON() : HistoryManager.exportAsCSV()
    const type = format === 'json' ? 'application/json' : 'text/csv'
    const filename = `stt_history_${Date.now()}.${format}`

    const element = document.createElement('a')
    element.href = URL.createObjectURL(new Blob([content], { type }))
    element.download = filename
    element.click()
  }

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      console.error('Copy failed')
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-full space-y-4 p-6 bg-white/5 border border-white/10 rounded-xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">📜 Histórico STT</h2>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
            >
              Limpar Tudo
            </button>
          )}
        </div>

        {/* Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3 bg-white/5 p-3 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-lg font-black text-[#88CE11]">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Média (ms)</p>
              <p className="text-lg font-black text-[#88CE11]">{Math.round(stats.avgDuration)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Total (ms)</p>
              <p className="text-lg font-black text-[#88CE11]">{stats.totalDuration}</p>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        {history.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('json')}
              className="flex-1 text-sm bg-white/10 hover:bg-white/20 text-white py-2 rounded transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex-1 text-sm bg-white/10 hover:bg-white/20 text-white py-2 rounded transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      {history.length > 0 && (
        <HistorySearch history={history} onResultsChange={setFilteredHistory} />
      )}

      {/* Detailed Stats */}
      {history.length > 0 && <HistoryStats history={history} />}

      {/* History List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhuma transcrição no histórico</p>
        ) : filteredHistory.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhuma transcrição encontrada com estes filtros</p>
        ) : (
          filteredHistory.map((record) => (
            <div
              key={record.id}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition space-y-2"
            >
              {/* Header */}
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === record.id ? null : record.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 line-clamp-2">{record.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(record.timestamp).toLocaleString('pt-BR')} • {record.duration}ms
                  </p>
                </div>
                <div className="ml-2">
                  {expandedId === record.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Actions */}
              {expandedId === record.id && (
                <div className="pt-2 border-t border-white/10 flex gap-2">
                  <button
                    onClick={() => onSelectTranscription(record.text)}
                    className="flex-1 text-xs bg-[#88CE11]/20 hover:bg-[#88CE11]/30 text-[#88CE11] py-1.5 rounded transition font-medium"
                  >
                    Usar
                  </button>
                  <button
                    onClick={() => handleCopyText(record.text)}
                    className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 rounded transition flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </button>
                  <button
                    onClick={() => handleRemove(record.id)}
                    className="flex-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 py-1.5 rounded transition flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remover
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
