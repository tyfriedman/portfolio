'use client';

import { useState, useCallback, useRef } from 'react';

export type ToastKind = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const TOAST_DURATION_MS = 3000;

export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return { toasts, showToast };
};

const kindStyles: Record<ToastKind, string> = {
  info: 'border-[var(--border)]',
  success: 'border-emerald-500/50',
  error: 'border-red-500/60',
};

const kindDot: Record<ToastKind, string> = {
  info: 'bg-[var(--accent)]',
  success: 'bg-emerald-500',
  error: 'bg-red-500',
};

export const Toasts = ({ toasts }: { toasts: ToastItem[] }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 rounded-lg border bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] shadow-xl backdrop-blur ${kindStyles[toast.kind]}`}
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${kindDot[toast.kind]}`} />
          {toast.message}
        </div>
      ))}
    </div>
  );
};
