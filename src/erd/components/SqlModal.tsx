'use client';

import React from 'react';

interface SqlModalProps {
  open: boolean;
  sql: string;
  onClose: () => void;
  onDownload: () => void;
  onCopied: () => void;
}

const SQL_KEYWORDS =
  /\b(CREATE TABLE|ALTER TABLE|ADD COLUMN|PRIMARY KEY|REFERENCES|NOT NULL|UNIQUE|SERIAL|INT|BIGINT|BOOLEAN|DATE|TIMESTAMP|UUID|TEXT|VARCHAR|DECIMAL)\b/g;

/** Lightweight keyword/comment tinting for the SQL preview. */
const highlightSql = (sql: string): React.ReactNode[] =>
  sql.split('\n').map((lineText, i) => {
    if (lineText.trimStart().startsWith('--')) {
      return (
        <div key={i} className="text-emerald-500/80">
          {lineText || '\u00A0'}
        </div>
      );
    }
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(SQL_KEYWORDS.source, 'g');
    while ((match = regex.exec(lineText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(lineText.slice(lastIndex, match.index));
      }
      parts.push(
        <span key={`${i}-${match.index}`} className="font-medium text-[var(--accent-hover)]">
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < lineText.length) {
      parts.push(lineText.slice(lastIndex));
    }
    return <div key={i}>{parts.length > 0 ? parts : '\u00A0'}</div>;
  });

export const SqlModal = ({ open, sql, onClose, onDownload, onCopied }: SqlModalProps) => {
  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    onCopied();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">Generated SQL schema</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition-colors hover:bg-[var(--hover)]"
            >
              Copy
            </button>
            <button
              onClick={onDownload}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Download .sql
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              title="Close (Esc)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-[var(--text)]">
          {highlightSql(sql)}
        </pre>
      </div>
    </div>
  );
};
