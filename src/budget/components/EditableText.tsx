"use client";

import { useState } from "react";

interface EditableTextProps {
  value: string;
  onCommit: (value: string) => void;
  className?: string;
}

/** Displays text; click to edit inline. Commits on blur or Enter. */
export function EditableText({
  value,
  onCommit,
  className = "",
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onCommit(trimmed);
    }
  }

  if (editing) {
    return (
      <input
        type="text"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        onFocus={(e) => e.target.select()}
        className={`w-full rounded border border-blue-400 bg-white px-1 py-0.5 text-sm outline-none ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={`cursor-text rounded px-1 py-0.5 text-left text-sm hover:bg-black/5 ${className}`}
      title="Click to edit"
    >
      {value}
    </button>
  );
}
