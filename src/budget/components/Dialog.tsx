"use client";

import { useState } from "react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  action: () => void;
}

export function ConfirmDialog({
  confirm,
  onClose,
}: {
  confirm: ConfirmOptions | null;
  onClose: () => void;
}) {
  if (!confirm) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-transparent bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">
          {confirm.title}
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {confirm.message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              confirm.action();
              onClose();
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors ${
              confirm.danger
                ? "bg-red-600 hover:bg-red-500"
                : "bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            }`}
          >
            {confirm.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ToastItem {
  id: number;
  message: string;
}

export function useToasts(): {
  toasts: ToastItem[];
  showToast: (message: string) => void;
} {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function showToast(message: string) {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, message }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, 3500);
  }

  return { toasts, showToast };
}

export function Toasts({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
