'use client';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}

const buttonClass =
  'flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]';

export const ZoomControls = ({ scale, onZoomIn, onZoomOut, onReset, onFit }: ZoomControlsProps) => {
  return (
    <div className="absolute bottom-6 left-6 z-30 flex items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg backdrop-blur">
      <button onClick={onZoomOut} className={buttonClass} title="Zoom out">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="min-w-12 rounded-md px-1.5 py-1 text-center text-xs font-medium tabular-nums text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
        title="Reset zoom to 100%"
      >
        {Math.round(scale * 100)}%
      </button>
      <button onClick={onZoomIn} className={buttonClass} title="Zoom in">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className="mx-0.5 h-5 w-px bg-[var(--border)]" />
      <button onClick={onFit} className={buttonClass} title="Fit diagram to view">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 1.5H2.5A1 1 0 0 0 1.5 2.5V5M9 1.5h2.5a1 1 0 0 1 1 1V5M5 12.5H2.5a1 1 0 0 1-1-1V9M9 12.5h2.5a1 1 0 0 0 1-1V9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
