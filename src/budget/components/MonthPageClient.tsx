"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  BudgetMonth,
  MonthBudgetItem,
  MonthAccount,
} from "@/budget/lib/db/months";
import type { BudgetTransaction } from "@/budget/lib/db/transactions";
import { EditableAmount } from "@/budget/components/EditableAmount";
import { EditableText } from "@/budget/components/EditableText";
import { DatePicker } from "@/budget/components/DatePicker";
import { CategorySelect } from "@/budget/components/CategorySelect";
import { SpendingPieChart } from "@/budget/components/SpendingPieChart";
import { ThemeToggle, useDarkMode } from "@/budget/components/ThemeToggle";
import { Toasts, useToasts } from "@/budget/components/Dialog";
import { formatCurrency, formatMonthLabel } from "@/budget/lib/format";

interface MonthPageClientProps {
  month: BudgetMonth;
  initialItems: MonthBudgetItem[];
  initialAccounts: MonthAccount[];
  initialTransactions: BudgetTransaction[];
}

const FALLBACK_COLOR = "#d1d5db";

function monthDateBounds(month: string): { min: string; max: string } {
  const [year, m] = month.split("-").map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  const prefix = month.slice(0, 7);
  return {
    min: `${prefix}-01`,
    max: `${prefix}-${String(lastDay).padStart(2, "0")}`,
  };
}

/** "2026-07-03" -> "07/03" */
function formatDayInMonth(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

/** The seeded gray used for fixed categories (rent, utilities, etc.) */
const FIXED_COLOR = "#d9d9d9";

const YELLOW_THRESHOLD = 50;

/**
 * Color for an actual-spent amount vs its budget:
 * - over budget: red (all categories)
 * - fixed (gray) categories: no highlight otherwise
 * - others: yellow within $50 of budget, green below that
 */
function actualStatusClass(
  actual: number,
  budget: number,
  color: string | null
): string {
  if (actual > budget) return "font-semibold text-red-600 dark:text-red-400";
  const isFixed = !color || color.toLowerCase() === FIXED_COLOR;
  if (isFixed) return "";
  if (budget - actual <= YELLOW_THRESHOLD)
    return "font-medium text-amber-500 dark:text-amber-400";
  return "font-medium text-green-600 dark:text-green-400";
}

function defaultTransactionDate(month: string): string {
  const { min, max } = monthDateBounds(month);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (today >= min && today <= max) return today;
  return min;
}

export function MonthPageClient({
  month,
  initialItems,
  initialAccounts,
  initialTransactions,
}: MonthPageClientProps) {
  const [items, setItems] = useState<MonthBudgetItem[]>(initialItems);
  const [accounts, setAccounts] = useState<MonthAccount[]>(initialAccounts);
  const [transactions, setTransactions] =
    useState<BudgetTransaction[]>(initialTransactions);

  const bounds = monthDateBounds(month.month);
  const [newTx, setNewTx] = useState({
    date: defaultTransactionDate(month.month),
    name: "",
    amount: "",
    category_id: "",
  });
  const [addingTx, setAddingTx] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();
  const { toasts, showToast } = useToasts();

  const expenseItems = useMemo(
    () => items.filter((i) => i.section === "expense"),
    [items]
  );
  const incomeItems = useMemo(
    () => items.filter((i) => i.section === "income"),
    [items]
  );

  const actualsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (!tx.category_id) continue;
      map.set(tx.category_id, (map.get(tx.category_id) ?? 0) + tx.amount);
    }
    return map;
  }, [transactions]);

  const expenseBudgetTotal = expenseItems.reduce((s, i) => s + i.amount, 0);
  const expenseActualTotal = expenseItems.reduce(
    (s, i) => s + (actualsByCategory.get(i.id) ?? 0),
    0
  );
  const incomeBudgetTotal = incomeItems.reduce((s, i) => s + i.amount, 0);
  const incomeActualTotal = incomeItems.reduce(
    (s, i) => s + (actualsByCategory.get(i.id) ?? 0),
    0
  );
  const netBudget = incomeBudgetTotal - expenseBudgetTotal;
  const netActual = incomeActualTotal - expenseActualTotal;

  const startBalances = accounts.filter((a) => a.start_balance !== null);
  const endBalances = accounts.filter((a) => a.end_balance !== null);
  const netWorthStart =
    startBalances.length > 0
      ? startBalances.reduce((s, a) => s + (a.start_balance ?? 0), 0)
      : null;
  const netWorthEnd =
    endBalances.length > 0
      ? endBalances.reduce((s, a) => s + (a.end_balance ?? 0), 0)
      : null;

  const pieSlices = expenseItems.map((item) => ({
    name: item.name,
    value: actualsByCategory.get(item.id) ?? 0,
    color: item.color ?? FALLBACK_COLOR,
  }));

  // ----- mutations (optimistic) -----

  async function patchMonthItem(id: string, input: { amount?: number }) {
    const prev = items;
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...input } : i)));
    try {
      const res = await fetch(`/api/budget/months/${month.id}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...input }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to update month item", err);
      setItems(prev);
      showToast("Couldn't save that change.");
    }
  }

  async function patchMonthAccount(
    id: string,
    input: { start_balance?: number | null; end_balance?: number | null }
  ) {
    const prev = accounts;
    setAccounts((cur) =>
      cur.map((a) => (a.id === id ? { ...a, ...input } : a))
    );
    try {
      const res = await fetch(`/api/budget/months/${month.id}/accounts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...input }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to update month account", err);
      setAccounts(prev);
      showToast("Couldn't save that change.");
    }
  }

  async function addTransaction() {
    const amount = Number(newTx.amount.replace(/[$,\s]/g, ""));
    if (!newTx.name.trim() || !Number.isFinite(amount) || !newTx.date) {
      showToast("Enter a date, name, and valid amount.");
      return;
    }
    setAddingTx(true);
    try {
      const res = await fetch("/api/budget/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month_id: month.id,
          date: newTx.date,
          name: newTx.name.trim(),
          amount,
          category_id: newTx.category_id || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const tx = (await res.json()) as BudgetTransaction;
      setTransactions((cur) =>
        [...cur, tx].sort((a, b) => a.date.localeCompare(b.date))
      );
      setNewTx({
        date: newTx.date,
        name: "",
        amount: "",
        category_id: newTx.category_id,
      });
    } catch (err) {
      console.error("Failed to add transaction", err);
      showToast("Couldn't add the transaction.");
    } finally {
      setAddingTx(false);
    }
  }

  async function patchTransaction(
    id: string,
    input: Partial<
      Pick<BudgetTransaction, "date" | "name" | "amount" | "category_id">
    >
  ) {
    const prev = transactions;
    setTransactions((cur) =>
      cur
        .map((t) => (t.id === id ? { ...t, ...input } : t))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
    try {
      const res = await fetch("/api/budget/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...input }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to update transaction", err);
      setTransactions(prev);
      showToast("Couldn't save that change.");
    }
  }

  async function removeTransaction(id: string) {
    const prev = transactions;
    setTransactions((cur) => cur.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/budget/transactions?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to delete transaction", err);
      setTransactions(prev);
      showToast("Couldn't delete the transaction.");
    }
  }

  // ----- render -----

  const sectionHeading =
    "mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500";
  const colLabel =
    "text-right text-[11px] font-medium text-gray-400 dark:text-gray-500";

  return (
    <>
      <div className="min-h-screen bg-white px-6 py-8 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-5 dark:border-gray-800">
          <h1 className="text-2xl font-bold tracking-tight">
            {formatMonthLabel(month.month)}
          </h1>
          <span className="flex items-center gap-2">
            <Link
              href="/budget/"
              className="text-sm text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200"
            >
              ← Budget
            </Link>
            <ThemeToggle dark={dark} onToggle={toggleDark} />
          </span>
        </header>

        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1.15fr_1fr_1fr]">
          {/* Column 1: Transactions */}
          <section className="lg:row-span-2">
            <h2 className={sectionHeading}>Transactions</h2>

            {/* Add form */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
              <DatePicker
                value={newTx.date}
                onChange={(date) => {
                  if (date) setNewTx({ ...newTx, date });
                }}
                min={bounds.min}
                max={bounds.max}
                buttonClassName="rounded-md border border-gray-200 dark:border-gray-700 bg-white px-2 py-1 text-xs tabular-nums text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              />
              <input
                type="text"
                placeholder="Name"
                value={newTx.name}
                onChange={(e) => setNewTx({ ...newTx, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTransaction();
                }}
                className="w-24 flex-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white px-1.5 py-1 text-xs dark:bg-gray-800"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="$"
                value={newTx.amount}
                onChange={(e) =>
                  setNewTx({ ...newTx, amount: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTransaction();
                }}
                className="w-16 rounded-md border border-gray-200 dark:border-gray-700 bg-white px-1.5 py-1 text-right text-xs dark:bg-gray-800"
              />
              <CategorySelect
                value={newTx.category_id || null}
                onChange={(id) =>
                  setNewTx({ ...newTx, category_id: id ?? "" })
                }
                expenseItems={expenseItems}
                incomeItems={incomeItems}
                align="left"
                buttonClassName="max-w-[7.5rem] rounded-full px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={addTransaction}
                disabled={addingTx}
                className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-40 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
              >
                Add
              </button>
            </div>

            {/* List */}
            {transactions.length === 0 ? (
              <p className="py-3 text-sm text-gray-400 dark:text-gray-500">
                No transactions yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="group flex items-center gap-1.5 py-[3px] text-sm"
                  >
                    <span className="w-12 shrink-0">
                      <DatePicker
                        value={tx.date}
                        onChange={(date) => {
                          if (date) patchTransaction(tx.id, { date });
                        }}
                        min={bounds.min}
                        max={bounds.max}
                        formatDisplay={formatDayInMonth}
                        buttonClassName="rounded px-1 py-0.5 text-xs tabular-nums text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <EditableText
                        value={tx.name}
                        onCommit={(name) => patchTransaction(tx.id, { name })}
                      />
                    </span>
                    <EditableAmount
                      value={tx.amount}
                      onCommit={(amount) =>
                        patchTransaction(tx.id, { amount })
                      }
                    />
                    <CategorySelect
                      value={tx.category_id}
                      onChange={(category_id) =>
                        patchTransaction(tx.id, { category_id })
                      }
                      expenseItems={expenseItems}
                      incomeItems={incomeItems}
                      align="left"
                      buttonClassName="max-w-[7.5rem] shrink-0 rounded-full px-1.5 py-0.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeTransaction(tx.id)}
                      className="w-4 text-gray-300 transition-colors hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                      title="Delete transaction"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Column 2: Expenses */}
          <section>
            <div className="flex items-center justify-between">
              <h2 className={sectionHeading}>Expenses</h2>
              <div className="mb-1 flex gap-4">
                <span className={`${colLabel} w-20`}>Budget</span>
                <span className={`${colLabel} w-20`}>Actual</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenseItems.map((item) => {
                const actual = actualsByCategory.get(item.id) ?? 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 py-[3px] text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: item.color ?? FALLBACK_COLOR,
                        }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="flex shrink-0 gap-4">
                      <span className="w-20 text-right">
                        <EditableAmount
                          value={item.amount}
                          onCommit={(amount) =>
                            patchMonthItem(item.id, { amount })
                          }
                        />
                      </span>
                      <span
                        className={`w-20 text-right tabular-nums ${actualStatusClass(
                          actual,
                          item.amount,
                          item.color
                        )}`}
                      >
                        {formatCurrency(actual)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 text-sm font-semibold">
              <span>Total</span>
              <span className="flex gap-4 tabular-nums">
                <span className="w-20 text-right">
                  {formatCurrency(expenseBudgetTotal)}
                </span>
                <span
                  className={`w-20 text-right ${actualStatusClass(
                    expenseActualTotal,
                    expenseBudgetTotal,
                    "#000000"
                  )}`}
                >
                  {formatCurrency(expenseActualTotal)}
                </span>
              </span>
            </div>
          </section>

          {/* Column 3: Income + Accounts */}
          <div className="flex flex-col gap-10">
            <section>
              <div className="flex items-center justify-between">
                <h2 className={sectionHeading}>Income</h2>
                <div className="mb-1 flex gap-4">
                  <span className={`${colLabel} w-20`}>Budget</span>
                  <span className={`${colLabel} w-20`}>Actual</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {incomeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 py-[3px] text-sm"
                  >
                    <span>{item.name}</span>
                    <span className="flex shrink-0 gap-4">
                      <span className="w-20 text-right">
                        <EditableAmount
                          value={item.amount}
                          onCommit={(amount) =>
                            patchMonthItem(item.id, { amount })
                          }
                        />
                      </span>
                      <span className="w-20 text-right tabular-nums">
                        {formatCurrency(actualsByCategory.get(item.id) ?? 0)}
                      </span>
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-[3px] text-sm font-medium">
                  <span>Gross</span>
                  <span className="flex gap-4 tabular-nums">
                    <span className="w-20 text-right">
                      {formatCurrency(incomeBudgetTotal)}
                    </span>
                    <span className="w-20 text-right">
                      {formatCurrency(incomeActualTotal)}
                    </span>
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 text-sm font-semibold">
                <span>Net</span>
                <span className="flex gap-4 tabular-nums">
                  <span
                    className={`w-20 text-right ${
                      netBudget < 0 ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  >
                    {formatCurrency(netBudget)}
                  </span>
                  <span
                    className={`w-20 text-right ${
                      netActual < 0 ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  >
                    {formatCurrency(netActual)}
                  </span>
                </span>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className={sectionHeading}>Accounts</h2>
                <div className="mb-1 flex gap-4">
                  <span className={`${colLabel} w-20`}>Start</span>
                  <span className={`${colLabel} w-20`}>End</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between gap-2 py-[3px] text-sm"
                  >
                    <span>{account.name}</span>
                    <span className="flex shrink-0 gap-4">
                      <span className="w-20 text-right">
                        <EditableAmount
                          value={account.start_balance}
                          onCommit={(start_balance) =>
                            patchMonthAccount(account.id, { start_balance })
                          }
                          className={
                            (account.start_balance ?? 0) < 0
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          }
                        />
                      </span>
                      <span className="w-20 text-right">
                        <EditableAmount
                          value={account.end_balance}
                          onCommit={(end_balance) =>
                            patchMonthAccount(account.id, { end_balance })
                          }
                          className={
                            (account.end_balance ?? 0) < 0
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          }
                        />
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 text-sm font-semibold">
                <span>Net Worth</span>
                <span className="flex gap-4 tabular-nums">
                  <span
                    className={`w-20 text-right ${
                      (netWorthStart ?? 0) < 0 ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  >
                    {netWorthStart === null
                      ? "—"
                      : formatCurrency(netWorthStart)}
                  </span>
                  <span
                    className={`w-20 text-right ${
                      (netWorthEnd ?? 0) < 0 ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  >
                    {netWorthEnd === null ? "—" : formatCurrency(netWorthEnd)}
                  </span>
                </span>
              </div>
            </section>
          </div>

          {/* Spending breakdown — spans expenses + income/accounts columns */}
          <section className="lg:col-span-2">
            <h2 className={sectionHeading}>Spending Breakdown</h2>
            <SpendingPieChart slices={pieSlices} />
          </section>
        </div>
      </div>
      </div>
      <Toasts toasts={toasts} />
    </>
  );
}
