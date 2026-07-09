import { useEffect, useState } from 'react';

interface ThinkingBlockProps {
  text: string;
  /** true enquanto o raciocínio ainda está chegando (antes do 1º delta de resposta) */
  streaming: boolean;
}

export default function ThinkingBlock({ text, streaming }: ThinkingBlockProps) {
  const [open, setOpen] = useState(streaming);

  // auto-colapsa quando a resposta começa; reabre se novo streaming iniciar
  useEffect(() => { setOpen(streaming); }, [streaming]);

  if (!text) return null;
  return (
    <div className={`thinking-block${open ? ' open' : ''}`}>
      <button className="thinking-head" onClick={() => setOpen(o => !o)}>
        <span className={`chev${open ? ' down' : ''}`}>▸</span>
        {streaming ? <>Pensando<span className="typing"><i /><i /><i /></span></> : 'Raciocínio'}
      </button>
      {open && <div className="thinking-body">{text}</div>}
    </div>
  );
}
