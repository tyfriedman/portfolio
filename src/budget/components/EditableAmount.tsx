"use client";

import { useState } from "react";
import { formatCurrency, parseAmount } from "@/budget/lib/format";

interface EditableAmountProps {
  value: number | null;
  onCommit: (value: number) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Displays a formatted dollar amount; click to edit inline.
 * Commits on blur or Enter, cancels on Escape.
 */
export function EditableAmount({
  value,
  onCommit,
  placeholder = "—",
  className = "",
}: EditableAmountProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEditing() {
    setDraft(value === null ? "" : String(value));
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const parsed = parseAmount(draft);
    if (parsed !== null && parsed !== value) {
      onCommit(parsed);
    }
  }

  if (editing) {
    return (
      <input
        type="text"
        inputMode="decimal"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        onFocus={(e) => e.target.select()}
        className={`w-24 rounded border border-blue-400 bg-white px-1 py-0.5 text-right text-sm outline-none dark:border-blue-500 dark:bg-gray-900 ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={`cursor-text rounded px-1 py-0.5 text-right text-sm tabular-nums hover:bg-black/5 dark:hover:bg-white/10 ${className}`}
      title="Click to edit"
    >
      {value === null ? (
        <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
      ) : (
        formatCurrency(value)
      )}
    </button>
  );
}
