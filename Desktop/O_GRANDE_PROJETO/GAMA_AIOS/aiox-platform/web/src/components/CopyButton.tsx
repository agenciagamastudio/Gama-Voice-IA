import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="msg-copy"
      title="copiar resposta"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        });
      }}
    >
      {ok ? '✓ copiado' : '⧉ copiar'}
    </button>
  );
}
