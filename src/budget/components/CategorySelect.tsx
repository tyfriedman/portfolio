"use client";

import { useState } from "react";
import type { MonthBudgetItem } from "@/budget/lib/db/months";

const FALLBACK_COLOR = "#d1d5db";

const popoverClass =
  "absolute z-50 mt-1.5 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-900";
const groupLabelClass =
  "block px-2 pb-0.5 pt-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500";

interface CategorySelectProps {
  value: string | null;
  onChange: (id: string | null) => void;
  expenseItems: MonthBudgetItem[];
  incomeItems: MonthBudgetItem[];
  align?: "left" | "right";
  buttonClassName?: string;
}

export function CategorySelect({
  value,
  onChange,
  expenseItems,
  incomeItems,
  align = "left",
  buttonClassName = "max-w-[7.5rem] rounded-full px-2 py-0.5 text-xs",
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);

  const selected =
    value !== null
      ? [...expenseItems, ...incomeItems].find((i) => i.id === value) ?? null
      : null;

  function select(id: string | null) {
    onChange(id);
    setOpen(false);
  }

  function optionRow(item: MonthBudgetItem) {
    const isSelected = item.id === value;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => select(item.id)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isSelected ? "font-semibold" : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color ?? FALLBACK_COLOR }}
        />
        <span className="truncate">{item.name}</span>
      </button>
    );
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((cur) => !cur)}
        className={`flex items-center gap-1.5 ${
          selected ? "" : "bg-gray-100 dark:bg-gray-800"
        } ${buttonClassName}`}
        style={
          selected
            ? { backgroundColor: `${selected.color ?? FALLBACK_COLOR}44` }
            : undefined
        }
      >
        {selected ? (
          <>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: selected.color ?? FALLBACK_COLOR }}
            />
            <span className="truncate">{selected.name}</span>
          </>
        ) : (
          <span className="truncate text-gray-500 dark:text-gray-400">
            Uncategorized
          </span>
        )}
      </button>

      {open && (
        <>
          <span
            className="fixed inset-0 z-40 block cursor-default"
            onClick={() => setOpen(false)}
          />
          <span
            className={`${popoverClass} block ${align === "right" ? "right-0" : "left-0"}`}
          >
            <span className="block max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => select(null)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  value === null
                    ? "font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600" />
                <span className="truncate">Uncategorized</span>
              </button>

              {expenseItems.length > 0 && (
                <>
                  <span className={groupLabelClass}>Expenses</span>
                  {expenseItems.map(optionRow)}
                </>
              )}

              {incomeItems.length > 0 && (
                <>
                  <span className={groupLabelClass}>Income</span>
                  {incomeItems.map(optionRow)}
                </>
              )}
            </span>
          </span>
        </>
      )}
    </span>
  );
}
