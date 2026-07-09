import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import { streamChat } from '../lib/api';

type Msg = { role: 'user' | 'assistant'; content: string };

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

export default function ChatPanel({ compact }: ChatPanelProps) {
  const { ai } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [messages]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setBusy(true);
    try {
      let acc = '';
      await streamChat(next, delta => {
        acc += delta;
        setMessages([...next, { role: 'assistant', content: acc }]);
      });
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
        <div className="chat-log" ref={logRef}>
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
              {m.content || (busy && i === messages.length - 1 ? <span className="typing"><i /><i /><i /></span> : '')}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <textarea
            value={input}
            placeholder={ai.ai ? 'ex.: qual workflow uso pra evoluir uma API existente?' : 'configure a chave de API no .env pra ativar o assistente'}
            disabled={!ai.ai || busy}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button onClick={() => send()} disabled={!ai.ai || busy || !input.trim()}>{busy ? '…' : 'enviar'}</button>
        </div>
      </div>
      {!compact && ai.ai && <p className="src-note">provedor: {ai.provider} · modelo: {ai.model} · contexto: RAG lexical sobre o índice local</p>}
    </>
  );
}
