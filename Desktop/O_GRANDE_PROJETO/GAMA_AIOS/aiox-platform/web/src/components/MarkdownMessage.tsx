import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Substitui marcadores [fonte: x] por chips estilizados dentro dos nós de texto. */
function withSourceTags(children: ReactNode): ReactNode {
  const walk = (node: ReactNode, key = 0): ReactNode => {
    if (typeof node === 'string') {
      const parts = node.split(/(\[fontes?:[^\]]+\])/gi);
      if (parts.length === 1) return node;
      return parts.map((p, i) =>
        /^\[fontes?:/i.test(p)
          ? <span key={`${key}-${i}`} className="src-tag">{p.slice(1, -1)}</span>
          : p,
      );
    }
    if (Array.isArray(node)) return node.map((n, i) => walk(n, i));
    return node;
  };
  return walk(children);
}

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{withSourceTags(children)}</p>,
          li: ({ children }) => <li>{withSourceTags(children)}</li>,
          a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer">{children}</a>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
