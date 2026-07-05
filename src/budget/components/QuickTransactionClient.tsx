"use client";

import { useState } from "react";
import Link from "next/link";
import type { BudgetMonth, MonthBudgetItem } from "@/budget/lib/db/months";
import type { BudgetTransaction } from "@/budget/lib/db/transactions";
import { DatePicker } from "@/budget/components/DatePicker";
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
      alert("Failed to load categories for that month.");
    } finally {
      setLoadingItems(false);
    }
  }

  async function submit() {
    if (!monthId) return;
    const parsed = Number(amount.replace(/[$,\s]/g, ""));
    if (!name.trim() || !Number.isFinite(parsed) || !date) {
      alert("Enter a name and a valid amount.");
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
      alert("Failed to add transaction.");
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
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-700 active:bg-gray-200"
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
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-bold">No months saved yet</h1>
        <p className="text-sm text-gray-500">
          Save your budget to a month from the budget home page first, then you
          can add transactions here.
        </p>
        <Link
          href="/budget/"
          className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Go to budget
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 py-8">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-bold tracking-tight">Add transaction</h1>
        <Link
          href="/budget/"
          className="text-sm text-gray-400 transition-colors hover:text-gray-700"
        >
          Budget →
        </Link>
      </header>

      {/* Month + date */}
      <div className="mb-5 flex items-center justify-between gap-2">
        {months.length > 1 ? (
          <select
            value={monthId ?? ""}
            onChange={(e) => switchMonth(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium"
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
            buttonClassName="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm tabular-nums text-gray-700"
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
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:border-gray-400"
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="$0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base tabular-nums outline-none focus:border-gray-400"
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Category
        </p>
        {loadingItems ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {expenseItems.map(categoryChip)}
            {incomeItems.length > 0 && (
              <>
                <span className="basis-full pt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-300">
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
        className="w-full rounded-xl bg-gray-900 py-3.5 text-base font-semibold text-white transition-colors active:bg-gray-700 disabled:opacity-40"
      >
        {submitting ? "Adding…" : "Add transaction"}
      </button>

      {/* Session log */}
      {added.length > 0 && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Added
          </p>
          <div className="divide-y divide-gray-100">
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
                  <span className="tabular-nums text-gray-500">
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
