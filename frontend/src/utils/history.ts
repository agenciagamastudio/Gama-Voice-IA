/**
 * Histórico de Transcrições (STT)
 * Persistente via localStorage
 */

export interface TranscriptionRecord {
  id: string
  text: string
  timestamp: number
  duration: number
  language: string
}

const STORAGE_KEY = 'gama_stt_history'
const MAX_HISTORY = 50

export const HistoryManager = {
  /**
   * Adiciona transcrição ao histórico
   */
  addTranscription(text: string, durationMs: number, language = 'pt'): TranscriptionRecord {
    const record: TranscriptionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      timestamp: Date.now(),
      duration: durationMs,
      language
    }

    const history = this.getHistory()
    history.unshift(record)

    // Manter apenas os últimos MAX_HISTORY
    if (history.length > MAX_HISTORY) {
      history.pop()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return record
  },

  /**
   * Obtém todo o histórico
   */
  getHistory(): TranscriptionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  /**
   * Obtém uma transcrição pelo ID
   */
  getById(id: string): TranscriptionRecord | null {
    const history = this.getHistory()
    return history.find((r) => r.id === id) || null
  },

  /**
   * Remove uma transcrição
   */
  remove(id: string): void {
    const history = this.getHistory()
    const filtered = history.filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  },

  /**
   * Limpa todo o histórico
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },

  /**
   * Exporta histórico como JSON
   */
  exportAsJSON(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  },

  /**
   * Exporta histórico como CSV
   */
  exportAsCSV(): string {
    const history = this.getHistory()
    const headers = ['ID', 'Texto', 'Data', 'Duração (ms)', 'Idioma']
    const rows = history.map((r) => [
      r.id,
      `"${r.text.replace(/"/g, '""')}"`, // Escape quotes
      new Date(r.timestamp).toLocaleString('pt-BR'),
      r.duration,
      r.language
    ])

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  },

  /**
   * Obtém estatísticas do histórico
   */
  getStats() {
    const history = this.getHistory()
    const totalTranscriptions = history.length
    const totalDuration = history.reduce((sum, r) => sum + r.duration, 0)
    const avgDuration = totalTranscriptions > 0 ? totalDuration / totalTranscriptions : 0

    return {
      total: totalTranscriptions,
      totalDuration,
      avgDuration,
      oldestEntry: history[history.length - 1]?.timestamp || null,
      newestEntry: history[0]?.timestamp || null
    }
  }
}
