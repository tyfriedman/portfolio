"use client";

import { useState } from "react";
import Link from "next/link";
import type { BudgetMonth, MonthBudgetItem } from "@/budget/lib/db/months";
import type { BudgetTransaction } from "@/budget/lib/db/transactions";
import { DatePicker } from "@/budget/components/DatePicker";
import { ThemeToggle, useDarkMode } from "@/budget/components/ThemeToggle";
import { Toasts, useToasts } from "@/budget/components/Dialog";
import { formatCurrency, formatMonthLabel } from "@/budget/lib/format";

interface QuickTransactionClientProps {
  months: BudgetMonth[];
  initialMonthId: string | null;
  initialItems: MonthBudgetItem[];
}

function monthDateBounds(month: string): { min: string; max: string } {
  const [year, m] = month.split("-").map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  const prefix = month.slice(0, 7);
  return {
    min: `${prefix}-01`,
    max: `${prefix}-${String(lastDay).padStart(2, "0")}`,
  };
}

function defaultDate(month: string): string {
  const { min, max } = monthDateBounds(month);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (today >= min && today <= max) return today;
  return min;
}

export function QuickTransactionClient({
  months,
  initialMonthId,
  initialItems,
}: QuickTransactionClientProps) {
  const [monthId, setMonthId] = useState<string | null>(initialMonthId);
  const [items, setItems] = useState<MonthBudgetItem[]>(initialItems);
  const [loadingItems, setLoadingItems] = useState(false);

  const selectedMonth = months.find((m) => m.id === monthId) ?? null;
  const bounds = selectedMonth ? monthDateBounds(selectedMonth.month) : null;

  const [date, setDate] = useState(
    selectedMonth ? defaultDate(selectedMonth.month) : ""
  );
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState<BudgetTransaction[]>([]);
  const { dark, toggle: toggleDark } = useDarkMode();
  const { toasts, showToast } = useToasts();

  const expenseItems = items.filter((i) => i.section === "expense");
  const incomeItems = items.filter((i) => i.section === "income");

  async function switchMonth(id: string) {
    const month = months.find((m) => m.id === id);
    if (!month) return;
    setMonthId(id);
    setDate(defaultDate(month.month));
    setCategoryId(null);
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/budget/months/${id}/items`);
      if (!res.ok) throw new Error(await res.text());
      setItems((await res.json()) as MonthBudgetItem[]);
    } catch (err) {
      console.error("Failed to load categories", err);
      setItems([]);
      showToast("Couldn't load categories for that month.");
    } finally {
      setLoadingItems(false);
    }
  }

  async function submit() {
    if (!monthId) return;
    const parsed = Number(amount.replace(/[$,\s]/g, ""));
    if (!name.trim() || !Number.isFinite(parsed) || !date) {
      showToast("Enter a name and a valid amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/budget/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month_id: monthId,
          date,
          name: name.trim(),
          amount: parsed,
          category_id: categoryId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const tx = (await res.json()) as BudgetTransaction;
      setAdded((cur) => [tx, ...cur]);
      setName("");
      setAmount("");
    } catch (err) {
      console.error("Failed to add transaction", err);
      showToast("Couldn't add the transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  function categoryChip(item: MonthBudgetItem) {
    const selected = categoryId === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setCategoryId(selected ? null : item.id)}
        className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
          selected
            ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
            : "bg-gray-100 text-gray-700 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:active:bg-gray-700"
        }`}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.color ?? "#d1d5db" }}
        />
        {item.name}
      </button>
    );
  }

  if (months.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <h1 className="text-xl font-bold">No months saved yet</h1>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          Save your budget to a month from the budget home page first, then you
          can add transactions here.
        </p>
        <Link
          href="/budget/"
          className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          Go to budget
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-md px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Add transaction</h1>
        <span className="flex items-center gap-1">
          <Link
            href="/budget/"
            className="text-sm text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
          >
            Budget →
          </Link>
          <ThemeToggle dark={dark} onToggle={toggleDark} />
        </span>
      </header>

      {/* Month + date */}
      <div className="mb-5 flex items-center justify-between gap-2">
        {months.length > 1 ? (
          <select
            value={monthId ?? ""}
            onChange={(e) => switchMonth(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-900"
          >
            {months.map((m) => (
              <option key={m.id} value={m.id}>
                {formatMonthLabel(m.month)}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium">
            {selectedMonth ? formatMonthLabel(selectedMonth.month) : ""}
          </span>
        )}
        {bounds && (
          <DatePicker
            value={date}
            onChange={(d) => {
              if (d) setDate(d);
            }}
            min={bounds.min}
            max={bounds.max}
            align="right"
            buttonClassName="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm tabular-nums text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          />
        )}
      </div>

      {/* Name + amount */}
      <div className="mb-5 flex flex-col gap-3">
        <input
          type="text"
          placeholder="What was it?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-gray-500"
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="$0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base tabular-nums outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-gray-500"
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Category
        </p>
        {loadingItems ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {expenseItems.map(categoryChip)}
            {incomeItems.length > 0 && (
              <>
                <span className="basis-full pt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-300 dark:text-gray-600">
                  Income
                </span>
                {incomeItems.map(categoryChip)}
              </>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={submitting || !monthId}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-base font-semibold text-white transition-colors active:bg-gray-700 disabled:opacity-40 dark:bg-gray-100 dark:text-gray-900 dark:active:bg-gray-300"
      >
        {submitting ? "Adding…" : "Add transaction"}
      </button>

      {/* Session log */}
      {added.length > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Added
          </p>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {added.map((tx) => {
              const category = items.find((i) => i.id === tx.category_id);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: category?.color ?? "#d1d5db",
                      }}
                    />
                    {tx.name}
                  </span>
                  <span className="tabular-nums text-gray-500 dark:text-gray-400">
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
      </div>
      <Toasts toasts={toasts} />
    </>
  );
}
