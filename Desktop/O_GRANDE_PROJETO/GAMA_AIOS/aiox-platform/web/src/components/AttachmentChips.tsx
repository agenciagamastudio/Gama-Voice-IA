import type { Attachment } from '../lib/api';

export type PendingAttachment = Attachment & { loading?: boolean };

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface AttachmentChipsProps {
  items: PendingAttachment[];
  onRemove: (name: string) => void;
}

export default function AttachmentChips({ items, onRemove }: AttachmentChipsProps) {
  if (!items.length) return null;
  return (
    <div className="attach-chips">
      {items.map(a => (
        <span key={a.name} className={`chip${a.loading ? ' loading' : ''}`}>
          <span className="chip-icon">📄</span>
          <span className="chip-name" title={a.name}>{a.name}</span>
          <span className="chip-size">{a.loading ? 'extraindo…' : fmtSize(a.size)}</span>
          {!a.loading && <button className="chip-x" title="remover anexo" onClick={() => onRemove(a.name)}>✕</button>}
        </span>
      ))}
    </div>
  );
}
