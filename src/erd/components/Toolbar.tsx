'use client';

import { useState, useRef, useEffect } from 'react';
import { ElementType, DiagramMeta } from '../types/diagram';
import { ThemeMode } from '../theme';

/* ------------------------------- icons ------------------------------- */

const EntityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const AttributeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <ellipse cx="8" cy="8" rx="6.5" ry="4.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RelationshipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5 14.5 8 8 14.5 1.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 3.5 3 6.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6.5h6.5a3.5 3.5 0 0 1 0 7H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const RedoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 6.5H6.5a3.5 3.5 0 0 0 0 7H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 10V2M5 4.5 8 1.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 9.5v3a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11 3.05 3.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.75 9.5a1 1 0 0 0 1 .92h4.5a1 1 0 0 0 1-.92L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="3" cy="3" r="1" fill="currentColor" />
    <circle cx="8" cy="3" r="1" fill="currentColor" />
    <circle cx="13" cy="3" r="1" fill="currentColor" />
    <circle cx="3" cy="8" r="1" fill="currentColor" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
    <circle cx="13" cy="8" r="1" fill="currentColor" />
    <circle cx="3" cy="13" r="1" fill="currentColor" />
    <circle cx="8" cy="13" r="1" fill="currentColor" />
    <circle cx="13" cy="13" r="1" fill="currentColor" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 4.5 6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ----------------------------- primitives ----------------------------- */

const iconButtonClass = (active = false, disabled = false) =>
  `relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
    active
      ? 'bg-[var(--accent)] text-white'
      : disabled
        ? 'cursor-default text-[var(--text-muted)] opacity-40'
        : 'text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]'
  }`;

const Tooltip = ({ label, kbd }: { label: string; kbd?: string }) => (
  <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 hidden -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--surface-solid)] px-2 py-1 text-xs text-[var(--text)] shadow-lg group-hover:flex">
    {label}
    {kbd && (
      <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1 font-sans text-[10px] text-[var(--text-muted)]">
        {kbd}
      </kbd>
    )}
  </span>
);

/* ------------------------------- toolbar ------------------------------ */

interface ToolbarProps {
  pendingAction: ElementType | null;
  onSetPendingAction: (action: ElementType) => void;
}

export const Toolbar = ({ pendingAction, onSetPendingAction }: ToolbarProps) => {
  const tools: { type: ElementType; label: string; kbd: string; icon: React.ReactNode }[] = [
    { type: 'entity', label: 'Add entity', kbd: 'E', icon: <EntityIcon /> },
    { type: 'attribute', label: 'Add attribute', kbd: 'A', icon: <AttributeIcon /> },
    { type: 'relationship', label: 'Add relationship', kbd: 'R', icon: <RelationshipIcon /> },
  ];

  return (
    <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg backdrop-blur">
      {tools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => onSetPendingAction(tool.type)}
          className={`group ${iconButtonClass(pendingAction === tool.type)}`}
        >
          {tool.icon}
          <Tooltip label={tool.label} kbd={tool.kbd} />
        </button>
      ))}
    </div>
  );
};

/* ------------------------------ action bar ---------------------------- */

export type ExportFormat = 'png' | 'svg' | 'json' | 'sql';

interface ActionBarProps {
  mode: ThemeMode;
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleSnap: () => void;
  onExport: (format: ExportFormat) => void;
  onImport: () => void;
  onToggleTheme: () => void;
  onClear: () => void;
}

export const ActionBar = ({
  mode,
  canUndo,
  canRedo,
  snapToGrid,
  onUndo,
  onRedo,
  onToggleSnap,
  onExport,
  onImport,
  onToggleTheme,
  onClear,
}: ActionBarProps) => {
  const [exportOpen, setExportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [exportOpen]);

  const exportItems: { format: ExportFormat; label: string; hint: string }[] = [
    { format: 'png', label: 'PNG image', hint: '2x resolution' },
    { format: 'svg', label: 'SVG vector', hint: 'Scalable' },
    { format: 'json', label: 'JSON file', hint: 'Re-importable' },
    { format: 'sql', label: 'SQL schema', hint: 'PostgreSQL DDL' },
  ];

  return (
    <div className="absolute top-4 right-4 z-30 flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg backdrop-blur">
      <button onClick={onUndo} disabled={!canUndo} className={`group ${iconButtonClass(false, !canUndo)}`}>
        <UndoIcon />
        <Tooltip label="Undo" kbd="⌘Z" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={`group ${iconButtonClass(false, !canRedo)}`}>
        <RedoIcon />
        <Tooltip label="Redo" kbd="⌘⇧Z" />
      </button>
      <div className="mx-0.5 h-5 w-px bg-[var(--border)]" />
      <button onClick={onToggleSnap} className={`group ${iconButtonClass(snapToGrid)}`}>
        <GridIcon />
        <Tooltip label={snapToGrid ? 'Snap to grid: on' : 'Snap to grid: off'} />
      </button>
      <div className="relative" ref={menuRef}>
        <button onClick={() => setExportOpen((o) => !o)} className={`group ${iconButtonClass(exportOpen)}`}>
          <ExportIcon />
          {!exportOpen && <Tooltip label="Export / import" />}
        </button>
        {exportOpen && (
          <div className="absolute top-full right-0 z-50 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] p-1.5 shadow-xl">
            <div className="px-2 pt-1 pb-1.5 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Export
            </div>
            {exportItems.map((item) => (
              <button
                key={item.format}
                onClick={() => {
                  setExportOpen(false);
                  onExport(item.format);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-[var(--text)] transition-colors hover:bg-[var(--hover)]"
              >
                {item.label}
                <span className="text-xs text-[var(--text-muted)]">{item.hint}</span>
              </button>
            ))}
            <div className="my-1 h-px bg-[var(--border)]" />
            <button
              onClick={() => {
                setExportOpen(false);
                onImport();
              }}
              className="flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm text-[var(--text)] transition-colors hover:bg-[var(--hover)]"
            >
              Import JSON…
            </button>
          </div>
        )}
      </div>
      <button onClick={onToggleTheme} className={`group ${iconButtonClass()}`}>
        {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        <Tooltip label={mode === 'dark' ? 'Light mode' : 'Dark mode'} />
      </button>
      <div className="mx-0.5 h-5 w-px bg-[var(--border)]" />
      <button onClick={onClear} className={`group ${iconButtonClass()} hover:!text-red-500`}>
        <TrashIcon />
        <Tooltip label="Clear canvas" />
      </button>
    </div>
  );
};

/* --------------------------- diagram name pill ------------------------ */

interface DiagramPillProps {
  activeMeta: DiagramMeta | null;
  onRename: (name: string) => void;
  onOpenManager: () => void;
}

export const DiagramPill = ({ activeMeta, onRename, onOpenManager }: DiagramPillProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEditing = () => {
    setValue(activeMeta?.name || '');
    setEditing(true);
  };

  const commitRename = () => {
    setEditing(false);
    if (value.trim() && value.trim() !== activeMeta?.name) {
      onRename(value.trim());
    }
  };

  return (
    <div className="absolute top-4 left-4 z-30 flex items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg backdrop-blur">
      {editing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="h-9 w-44 rounded-lg bg-[var(--hover)] px-3 text-sm font-medium text-[var(--text)] outline-none ring-1 ring-[var(--accent)]"
        />
      ) : (
        <button
          onDoubleClick={startEditing}
          onClick={startEditing}
          className="h-9 max-w-52 truncate rounded-lg px-3 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--hover)]"
          title="Rename diagram"
        >
          {activeMeta?.name || 'Untitled diagram'}
        </button>
      )}
      <button
        onClick={onOpenManager}
        className="flex h-9 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
        title="All diagrams"
      >
        <ChevronIcon />
      </button>
    </div>
  );
};
