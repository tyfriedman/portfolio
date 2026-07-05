"use client";

import { useState } from "react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Default display: "3/10/27" */
function defaultFormat(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${m}/${d}/${String(y).slice(2)}`;
}

const popoverClass =
  "absolute z-50 mt-1.5 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg";
const navButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700";

interface DatePickerProps {
  value: string | null; // ISO date (YYYY-MM-DD)
  onChange: (value: string | null) => void;
  min?: string;
  max?: string;
  clearable?: boolean;
  align?: "left" | "right";
  placeholder?: string;
  formatDisplay?: (iso: string) => string;
  buttonClassName?: string;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  clearable = false,
  align = "left",
  placeholder = "Set date",
  formatDisplay = defaultFormat,
  buttonClassName = "rounded px-1 py-0.5 text-sm tabular-nums hover:bg-black/5",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => initialView(value, min));

  function initialView(v: string | null, minDate?: string) {
    const base = v ?? minDate ?? todayISO();
    return { year: Number(base.slice(0, 4)), month: Number(base.slice(5, 7)) };
  }

  function openPicker() {
    setView(initialView(value, min));
    setOpen(true);
  }

  function shiftMonth(delta: number) {
    setView((cur) => {
      let month = cur.month + delta;
      let year = cur.year;
      if (month < 1) {
        month = 12;
        year -= 1;
      } else if (month > 12) {
        month = 1;
        year += 1;
      }
      return { year, month };
    });
  }

  const daysInMonth = new Date(view.year, view.month, 0).getDate();
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const today = todayISO();

  const cells: Array<number | null> = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={buttonClassName}
      >
        {value ? (
          formatDisplay(value)
        ) : (
          <span className="text-gray-400">{placeholder}</span>
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
            <span className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className={navButtonClass}
              >
                ‹
              </button>
              <span className="text-sm font-semibold">
                {MONTH_NAMES[view.month - 1]} {view.year}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className={navButtonClass}
              >
                ›
              </button>
            </span>

            <span className="grid grid-cols-7 gap-y-0.5 text-center">
              {DAY_LABELS.map((d) => (
                <span
                  key={d}
                  className="py-0.5 text-[10px] font-medium uppercase text-gray-400"
                >
                  {d}
                </span>
              ))}
              {cells.map((day, idx) => {
                if (day === null) {
                  return <span key={`empty-${idx}`} />;
                }
                const iso = `${view.year}-${pad(view.month)}-${pad(day)}`;
                const disabled =
                  (min !== undefined && iso < min) ||
                  (max !== undefined && iso > max);
                const selected = iso === value;
                const isToday = iso === today;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                      selected
                        ? "bg-gray-900 font-semibold text-white"
                        : disabled
                          ? "text-gray-300"
                          : isToday
                            ? "font-semibold text-blue-600 hover:bg-gray-100"
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </span>

            {clearable && value && (
              <span className="mt-2 block border-t border-gray-100 pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="text-xs text-gray-400 transition-colors hover:text-red-500"
                >
                  Clear date
                </button>
              </span>
            )}
          </span>
        </>
      )}
    </span>
  );
}

interface MonthPickerProps {
  value: string; // "YYYY-MM"
  onChange: (value: string) => void;
  align?: "left" | "right";
  buttonClassName?: string;
}

export function MonthPicker({
  value,
  onChange,
  align = "left",
  buttonClassName = "rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50",
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(value.slice(0, 4)));

  const selectedYear = Number(value.slice(0, 4));
  const selectedMonth = Number(value.slice(5, 7));
  const now = new Date();

  function openPicker() {
    setYear(Number(value.slice(0, 4)));
    setOpen(true);
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={buttonClassName}
      >
        {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
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
            <span className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setYear((y) => y - 1)}
                className={navButtonClass}
              >
                ‹
              </button>
              <span className="text-sm font-semibold">{year}</span>
              <button
                type="button"
                onClick={() => setYear((y) => y + 1)}
                className={navButtonClass}
              >
                ›
              </button>
            </span>

            <span className="grid grid-cols-3 gap-1">
              {MONTH_SHORT.map((label, idx) => {
                const month = idx + 1;
                const selected =
                  year === selectedYear && month === selectedMonth;
                const isCurrent =
                  year === now.getFullYear() && month === now.getMonth() + 1;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      onChange(`${year}-${pad(month)}`);
                      setOpen(false);
                    }}
                    className={`rounded-lg py-1.5 text-xs transition-colors ${
                      selected
                        ? "bg-gray-900 font-semibold text-white"
                        : isCurrent
                          ? "font-semibold text-blue-600 hover:bg-gray-100"
                          : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </span>
          </span>
        </>
      )}
    </span>
  );
}
