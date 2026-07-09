import ChatPanel from './ChatPanel';

interface ChatWidgetProps {
  open: boolean;
  onToggle: () => void;
}

export default function ChatWidget({ open, onToggle }: ChatWidgetProps) {
  return (
    <>
      {/* Floating action button — always visible */}
      <button
        className="chat-fab"
        onClick={onToggle}
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente AIOX'}
        title="Assistente AIOX"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Panel — always mounted so history persists; hidden via CSS when closed */}
      <div className={`chat-popup${open ? ' chat-popup--open' : ''}`} aria-hidden={!open}>
        <div className="chat-popup-head">
          <span>Assistente AIOX</span>
          <button onClick={onToggle} aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="chat-popup-body">
          <ChatPanel compact />
        </div>
      </div>
    </>
  );
}
