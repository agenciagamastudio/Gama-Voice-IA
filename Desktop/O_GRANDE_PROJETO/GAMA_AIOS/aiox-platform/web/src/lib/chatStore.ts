/* Armazenamento de conversas do chat (localStorage, múltiplas conversas). */

export type StoredMsg = { role: 'user' | 'assistant'; content: string; thinking?: string; attachNames?: string[] };
export type Conv = { id: string; title: string; messages: StoredMsg[]; updatedAt: number };

const KEY = 'aiox-chats';
const LEGACY_KEY = 'aiox-chat';
const MAX_CONVS = 20;
const MAX_MSGS = 60;

export function newId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function titleFrom(messages: StoredMsg[]): string {
  const first = messages.find(m => m.role === 'user')?.content || '';
  return first.slice(0, 44) + (first.length > 44 ? '…' : '') || 'nova conversa';
}

export function loadConvs(): { convs: Conv[]; activeId: string } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data?.convs) && data.convs.length) {
        return { convs: data.convs, activeId: data.activeId || data.convs[0].id };
      }
    }
    // migração do formato antigo (conversa única)
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const messages = JSON.parse(legacy);
      if (Array.isArray(messages) && messages.length) {
        const conv: Conv = { id: newId(), title: titleFrom(messages), messages, updatedAt: Date.now() };
        localStorage.removeItem(LEGACY_KEY);
        saveConvs([conv], conv.id);
        return { convs: [conv], activeId: conv.id };
      }
    }
  } catch { /* corrompido → começa limpo */ }
  const conv: Conv = { id: newId(), title: 'nova conversa', messages: [], updatedAt: Date.now() };
  return { convs: [conv], activeId: conv.id };
}

export function saveConvs(convs: Conv[], activeId: string): void {
  try {
    const trimmed = convs
      .slice(0, MAX_CONVS)
      .map(c => ({ ...c, messages: c.messages.slice(-MAX_MSGS) }));
    localStorage.setItem(KEY, JSON.stringify({ convs: trimmed, activeId }));
  } catch { /* quota */ }
}
