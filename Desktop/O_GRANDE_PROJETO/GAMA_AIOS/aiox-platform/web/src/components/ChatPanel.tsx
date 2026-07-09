import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import { streamChat, extractFile, type Attachment } from '../lib/api';
import MarkdownMessage from './MarkdownMessage';
import CopyButton from './CopyButton';
import ThinkingBlock from './ThinkingBlock';
import AttachmentChips, { type PendingAttachment } from './AttachmentChips';
import MicButton from './MicButton';

type Msg = { role: 'user' | 'assistant'; content: string; thinking?: string; attachNames?: string[] };

const SUGGESTIONS = [
  'Qual agente pode fazer git push?',
  'Como começo um projeto que já tem código?',
  'O que é o ADE e como ativo o modo autônomo?',
  'Quais squads tenho instalados e pra que servem?',
  'Como funciona o ciclo de vida de uma story?',
];

interface ChatPanelProps {
  compact?: boolean;
}

const STORE_KEY = 'aiox-chat';
const STORE_CAP = 50;

function loadStored(): Msg[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(m => m && m.role && typeof m.content === 'string') : [];
  } catch { return []; }
}

export default function ChatPanel({ compact }: ChatPanelProps) {
  const { ai } = useApp();
  const [messages, setMessages] = useState<Msg[]>(loadStored);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (attachments.some(a => a.name === file.name)) continue;
      setAttachments(prev => [...prev, { name: file.name, size: file.size, text: '', loading: true }]);
      try {
        const att = await extractFile(file);
        setAttachments(prev => prev.map(a => (a.name === file.name ? { ...att, loading: false } : a)));
      } catch (e: any) {
        setAttachments(prev => prev.filter(a => a.name !== file.name));
        alert(`Anexo "${file.name}": ${e?.message || e}`);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  useEffect(() => {
    if (stickRef.current) logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-STORE_CAP))); } catch { /* quota */ }
  }, [messages]);

  function onLogScroll() {
    const el = logRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  }

  function autoResize() {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy || attachments.some(a => a.loading)) return;
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    stickRef.current = true;
    const atts: Attachment[] = attachments.map(({ name, size, text: t }) => ({ name, size, text: t }));
    setAttachments([]);
    const next: Msg[] = [...messages, { role: 'user', content: q, attachNames: atts.length ? atts.map(a => a.name) : undefined }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setBusy(true);
    try {
      let acc = '';
      let think = '';
      await streamChat(next.map(({ role, content }) => ({ role, content })), {
        onDelta: delta => {
          acc += delta;
          setMessages([...next, { role: 'assistant', content: acc, thinking: think || undefined }]);
        },
        onThinking: t => {
          think += t;
          setMessages([...next, { role: 'assistant', content: acc, thinking: think }]);
        },
      }, atts);
    } catch (e: any) {
      const msg = e?.message === 'no_api_key'
        ? 'IA não configurada. Preencha ANTHROPIC_API_KEY ou GROQ_API_KEY no arquivo .env e reinicie o servidor.'
        : `Erro ao consultar a IA: ${e?.message || e}`;
      setMessages([...next, { role: 'assistant', content: `⚠ ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!compact && (
        <>
          <p className="eyebrow">Assistente AIOX</p>
          <h1 className="lead" style={{ fontSize: 'clamp(26px,4vw,38px)' }}>Pergunta. A <em>documentação responde</em>.</h1>
          <p className="sub">Chat com IA alimentado pela documentação AIOX indexada (agentes, workflows, squads, guias do .aiox-core). Responde em português com as fontes citadas.</p>
        </>
      )}

      {!ai.ai && (
        <div className="ai-off">
          <b>IA offline.</b> Copie <code>.env.example</code> para <code>.env</code>, preencha <code>ANTHROPIC_API_KEY</code> (ou <code>GROQ_API_KEY</code> + <code>AI_PROVIDER=groq</code>) e reinicie o <code>npm run dev</code>. O restante da plataforma funciona normalmente sem IA.
        </div>
      )}

      <div className={compact ? 'chat-wrap chat-wrap--compact' : 'chat-wrap'}>
        {messages.length > 0 && !busy && (
          <button
            className="chat-clear"
            title="apagar histórico da conversa"
            onClick={() => { setMessages([]); try { localStorage.removeItem(STORE_KEY); } catch { /* noop */ } }}
          >✕ limpar conversa</button>
        )}
        <div className="chat-log" ref={logRef} onScroll={onLogScroll}>
          {messages.length === 0 ? (
            <div className="chat-empty">
              <h3>Central de dúvidas do AIOX</h3>
              <p>Pergunte qualquer coisa sobre agentes, comandos, workflows ou squads.</p>
              <div className="sugg">
                {SUGGESTIONS.map(s => <button key={s} onClick={() => send(s)} disabled={!ai.ai}>{s}</button>)}
              </div>
            </div>
          ) : messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === 'user' && m.attachNames && (
                <div className="msg-attach">{m.attachNames.map(n => <span key={n} className="chip chip--sent">📄 {n}</span>)}</div>
              )}
              {m.role === 'assistant' && (m.content || m.thinking)
                ? <>
                    {m.thinking && (
                      <ThinkingBlock text={m.thinking} streaming={busy && i === messages.length - 1 && !m.content} />
                    )}
                    {m.content && <MarkdownMessage content={m.content} />}
                    {m.content && !(busy && i === messages.length - 1) && (
                      <div className="msg-actions"><CopyButton text={m.content} /></div>
                    )}
                  </>
                : m.content || (busy && i === messages.length - 1 ? <span className="typing"><i /><i /><i /></span> : '')}
            </div>
          ))}
        </div>
        <AttachmentChips items={attachments} onRemove={name => setAttachments(prev => prev.filter(a => a.name !== name))} />
        <div className="chat-input">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.markdown,.ts,.tsx,.js,.jsx,.py,.json,.yaml,.yml,.css,.html,.sql,.sh,.csv,.log,.xml,.toml"
            style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)}
          />
          <button
            className="attach-btn"
            title="anexar documento (texto, código ou PDF)"
            disabled={!ai.ai || busy}
            onClick={() => fileRef.current?.click()}
          >📎</button>
          <MicButton
            disabled={!ai.ai || busy}
            onText={t => { setInput(prev => (prev ? prev + ' ' : '') + t); taRef.current?.focus(); setTimeout(autoResize, 0); }}
          />
          <textarea
            ref={taRef}
            value={input}
            rows={1}
            placeholder={ai.ai ? 'ex.: qual workflow uso pra evoluir uma API existente?' : 'configure a chave de API no .env pra ativar o assistente'}
            disabled={!ai.ai || busy}
            onChange={e => { setInput(e.target.value); autoResize(); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button onClick={() => send()} disabled={!ai.ai || busy || !input.trim()}>{busy ? '…' : 'enviar'}</button>
        </div>
      </div>
      {!compact && ai.ai && <p className="src-note">provedor: {ai.provider} · modelo: {ai.model} · contexto: RAG lexical sobre o índice local</p>}
    </>
  );
}
