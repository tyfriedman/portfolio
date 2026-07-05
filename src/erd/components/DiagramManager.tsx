'use client';

import { useState, useRef, useEffect } from 'react';
import { DiagramMeta } from '../types/diagram';

interface DiagramManagerProps {
  open: boolean;
  diagrams: DiagramMeta[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const DiagramManager = ({
  open,
  diagrams,
  activeId,
  onOpen,
  onCreate,
  onRename,
  onDuplicate,
  onDelete,
  onClose,
}: DiagramManagerProps) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId) {
      renameRef.current?.focus();
      renameRef.current?.select();
    }
  }, [renamingId]);

  if (!open) return null;

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const sorted = [...diagrams].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[70vh] w-[26rem] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--text)]">Diagrams</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreate}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              New diagram
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

        <div className="flex-1 overflow-y-auto p-2">
          {sorted.map((meta) => (
            <div
              key={meta.id}
              className={`group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                meta.id === activeId ? 'bg-[var(--hover)]' : 'hover:bg-[var(--hover)]'
              }`}
            >
              <div className="min-w-0 flex-1">
                {renamingId === meta.id ? (
                  <input
                    ref={renameRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    className="w-full rounded-md bg-[var(--surface-solid)] px-2 py-0.5 text-sm font-medium text-[var(--text)] outline-none ring-1 ring-[var(--accent)]"
                  />
                ) : (
                  <button
                    onClick={() => {
                      onOpen(meta.id);
                      onClose();
                    }}
                    className="block w-full truncate text-left text-sm font-medium text-[var(--text)]"
                  >
                    {meta.name}
                    {meta.id === activeId && (
                      <span className="ml-2 rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                        open
                      </span>
                    )}
                  </button>
                )}
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {meta.entityCount} {meta.entityCount === 1 ? 'entity' : 'entities'} · edited {formatDate(meta.updatedAt)}
                </div>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setRenamingId(meta.id);
                    setRenameValue(meta.name);
                  }}
                  className="rounded-md px-1.5 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-solid)] hover:text-[var(--text)]"
                  title="Rename"
                >
                  Rename
                </button>
                <button
                  onClick={() => onDuplicate(meta.id)}
                  className="rounded-md px-1.5 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-solid)] hover:text-[var(--text)]"
                  title="Duplicate"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => onDelete(meta.id)}
                  className="rounded-md px-1.5 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-solid)] hover:text-red-500"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
