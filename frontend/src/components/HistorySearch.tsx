import React, { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { TranscriptionRecord } from '../utils/history'

interface HistorySearchProps {
  history: TranscriptionRecord[]
  onResultsChange: (filtered: TranscriptionRecord[]) => void
}

type SortOption = 'newest' | 'oldest' | 'duration-longest' | 'duration-shortest' | 'alphabetic'

export default function HistorySearch({ history, onResultsChange }: HistorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [dateRange, setDateRange] = useState<{ start?: number; end?: number }>({})

  const filtered = useMemo(() => {
    let results = [...history]

    // Filtro por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter((r) => r.text.toLowerCase().includes(query))
    }

    // Filtro por data (últimos N dias)
    if (dateRange.start) {
      results = results.filter((r) => r.timestamp >= dateRange.start!)
    }
    if (dateRange.end) {
      results = results.filter((r) => r.timestamp <= dateRange.end!)
    }

    // Ordenação
    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => b.timestamp - a.timestamp)
        break
      case 'oldest':
        results.sort((a, b) => a.timestamp - b.timestamp)
        break
      case 'duration-longest':
        results.sort((a, b) => b.duration - a.duration)
        break
      case 'duration-shortest':
        results.sort((a, b) => a.duration - b.duration)
        break
      case 'alphabetic':
        results.sort((a, b) => a.text.localeCompare(b.text))
        break
    }

    return results
  }, [history, searchQuery, sortBy, dateRange])

  React.useEffect(() => {
    onResultsChange(filtered)
  }, [filtered, onResultsChange])

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
    setDateRange({})
  }

  const setLastDays = (days: number) => {
    const now = Date.now()
    const start = now - days * 24 * 60 * 60 * 1000
    setDateRange({ start })
  }

  return (
    <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar transcrição..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-[#88CE11] focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Sort and Filter Controls */}
      <div className="grid grid-cols-2 gap-2">
        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-1.5 bg-white/10 border border-white/10 rounded text-sm text-white focus:border-[#88CE11] focus:outline-none"
        >
          <option value="newest">Mais Recentes</option>
          <option value="oldest">Mais Antigos</option>
          <option value="duration-longest">Duração (Maior)</option>
          <option value="duration-shortest">Duração (Menor)</option>
          <option value="alphabetic">Alfabético</option>
        </select>

        {/* Date Range Quick Filter */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              setLastDays(parseInt(e.target.value))
            } else {
              setDateRange({})
            }
            e.target.value = ''
          }}
          defaultValue=""
          className="px-3 py-1.5 bg-white/10 border border-white/10 rounded text-sm text-white focus:border-[#88CE11] focus:outline-none"
        >
          <option value="">Todas as Datas</option>
          <option value="1">Últimas 24h</option>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
        </select>
      </div>

      {/* Results Info and Clear Button */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <p className="text-xs text-gray-400">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
        {(searchQuery || sortBy !== 'newest' || Object.keys(dateRange).length > 0) && (
          <button
            onClick={clearFilters}
            className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded transition"
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  )
}
