"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BudgetItem, BudgetSection } from "@/budget/lib/db/items";
import type { BudgetAccount } from "@/budget/lib/db/accounts";
import type { BudgetMonth } from "@/budget/lib/db/months";
import { EditableAmount } from "@/budget/components/EditableAmount";
import { EditableText } from "@/budget/components/EditableText";
import { DatePicker, MonthPicker } from "@/budget/components/DatePicker";
import {
  formatCurrency,
  formatPercent,
  formatMonthLabel,
  monthToSlug,
  slugToMonth,
} from "@/budget/lib/format";

interface BudgetHomeClientProps {
  initialItems: BudgetItem[];
  initialAccounts: BudgetAccount[];
  initialMonths: BudgetMonth[];
}

function currentMonthSlug(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function EditablePercent({
  value,
  onCommit,
}: {
  value: number | null;
  onCommit: (value: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    setEditing(false);
    const trimmed = draft.trim().replace("%", "");
    if (trimmed === "") {
      if (value !== null) onCommit(null);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed) && parsed !== value) onCommit(parsed);
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
        className="w-14 rounded border border-blue-400 bg-white px-1 py-0.5 text-right text-sm outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value === null ? "" : String(value));
        setEditing(true);
      }}
      className="cursor-text rounded px-1 py-0.5 text-right text-sm tabular-nums hover:bg-black/5"
      title="Click to edit"
    >
      {value === null ? (
        <span className="text-gray-400">—</span>
      ) : (
        `${value.toFixed(2)}%`
      )}
    </button>
  );
}

export function BudgetHomeClient({
  initialItems,
  initialAccounts,
  initialMonths,
}: BudgetHomeClientProps) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems);
  const [accounts, setAccounts] = useState<BudgetAccount[]>(initialAccounts);
  const [months, setMonths] = useState<BudgetMonth[]>(initialMonths);
  const [monthInput, setMonthInput] = useState(currentMonthSlug());
  const [savingMonth, setSavingMonth] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "",
    is_loan: false,
    interest_rate: "",
    payoff_date: "",
  });

  const incomeItems = useMemo(
    () => items.filter((i) => i.section === "income"),
    [items]
  );
  const savingsItems = useMemo(
    () => items.filter((i) => i.section === "savings"),
    [items]
  );
  const expenseItems = useMemo(
    () => items.filter((i) => i.section === "expense"),
    [items]
  );

  const gross = incomeItems.find((i) => i.name === "Gross")?.amount ?? 0;
  const taxes = incomeItems.find((i) => i.name === "Taxes")?.amount ?? 0;
  const deductions = incomeItems
    .filter((i) => i.name !== "Gross")
    .reduce((sum, i) => sum + i.amount, 0);
  const netIncome = gross - deductions;

  const expenseTotal = expenseItems.reduce((sum, i) => sum + i.amount, 0);
  const retirement = incomeItems
    .filter((i) => i.name !== "Gross" && i.name !== "Taxes")
    .reduce((sum, i) => sum + i.amount, 0);
  const savingAmount = savingsItems
    .filter((i) => i.name !== "Loans")
    .reduce((sum, i) => sum + i.amount, 0);
  const loansAmount = savingsItems
    .filter((i) => i.name === "Loans")
    .reduce((sum, i) => sum + i.amount, 0);
  const ratesBase = gross - taxes;

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const regularAccounts = accounts.filter((a) => !a.is_loan);
  const loanAccounts = accounts.filter((a) => a.is_loan);

  // ----- item mutations (optimistic) -----

  async function patchItem(
    id: string,
    input: Partial<Pick<BudgetItem, "name" | "amount" | "color">>
  ) {
    const prev = items;
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...input } : i)));
    try {
      const res = await fetch("/api/budget/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...input }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to update item", err);
      setItems(prev);
      alert("Failed to save change.");
    }
  }

  async function addItem(section: BudgetSection) {
    const sectionItems = items.filter((i) => i.section === section);
    const sortOrder =
      sectionItems.length > 0
        ? Math.max(...sectionItems.map((i) => i.sort_order)) + 1
        : 0;
    try {
      const res = await fetch("/api/budget/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          name: "New item",
          amount: 0,
          color: section === "expense" ? "#d9d9d9" : null,
          sort_order: sortOrder,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const item = (await res.json()) as BudgetItem;
      setItems((cur) => [...cur, item]);
    } catch (err) {
      console.error("Failed to add item", err);
      alert("Failed to add item.");
    }
  }

  async function removeItem(id: string) {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/budget/items?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to delete item", err);
      setItems(prev);
      alert("Failed to delete item.");
    }
  }

  // ----- account mutations (optimistic) -----

  async function patchAccount(id: string, input: Partial<BudgetAccount>) {
    const prev = accounts;
    setAccounts((cur) =>
      cur.map((a) => (a.id === id ? { ...a, ...input } : a))
    );
    try {
      const res = await fetch("/api/budget/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...input }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to update account", err);
      setAccounts(prev);
      alert("Failed to save change.");
    }
  }

  async function submitNewAccount() {
    const balance = Number(newAccount.balance.replace(/[$,\s]/g, ""));
    if (!newAccount.name.trim() || !Number.isFinite(balance)) {
      alert("Enter a name and a valid balance.");
      return;
    }
    const sortOrder =
      accounts.length > 0
        ? Math.max(...accounts.map((a) => a.sort_order)) + 1
        : 0;
    try {
      const res = await fetch("/api/budget/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAccount.name.trim(),
          balance,
          is_loan: newAccount.is_loan,
          interest_rate: newAccount.is_loan
            ? Number(newAccount.interest_rate) || null
            : null,
          payoff_date: newAccount.is_loan
            ? newAccount.payoff_date || null
            : null,
          sort_order: sortOrder,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const account = (await res.json()) as BudgetAccount;
      setAccounts((cur) => [...cur, account]);
      setAddingAccount(false);
      setNewAccount({
        name: "",
        balance: "",
        is_loan: false,
        interest_rate: "",
        payoff_date: "",
      });
    } catch (err) {
      console.error("Failed to add account", err);
      alert("Failed to add account.");
    }
  }

  async function removeAccount(id: string) {
    if (!confirm("Delete this account?")) return;
    const prev = accounts;
    setAccounts((cur) => cur.filter((a) => a.id !== id));
    try {
      const res = await fetch(`/api/budget/accounts?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to delete account", err);
      setAccounts(prev);
      alert("Failed to delete account.");
    }
  }

  // ----- months -----

  async function saveToMonth() {
    const month = slugToMonth(monthInput);
    const exists = months.some((m) => m.month === month);
    if (
      exists &&
      !confirm(
        `${formatMonthLabel(month)} already exists. Update its budget amounts and account starting balances from the current budget? Transactions are kept.`
      )
    ) {
      return;
    }
    setSavingMonth(true);
    try {
      const res = await fetch("/api/budget/months", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = (await res.json()) as BudgetMonth;
      setMonths((cur) => {
        if (cur.some((m) => m.id === saved.id)) return cur;
        return [...cur, saved].sort((a, b) => b.month.localeCompare(a.month));
      });
    } catch (err) {
      console.error("Failed to save month", err);
      alert("Failed to save budget to month.");
    } finally {
      setSavingMonth(false);
    }
  }

  async function removeMonth(id: string, month: string) {
    if (
      !confirm(
        `Delete ${formatMonthLabel(month)}? This removes its budget snapshot and all its transactions.`
      )
    ) {
      return;
    }
    const prev = months;
    setMonths((cur) => cur.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/budget/months?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Failed to delete month", err);
      setMonths(prev);
      alert("Failed to delete month.");
    }
  }

  // ----- render helpers -----

  const sectionHeading =
    "mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400";

  function itemRow(item: BudgetItem, showColor: boolean) {
    return (
      <div
        key={item.id}
        className="group flex items-center justify-between gap-2 py-[3px]"
      >
        <div className="flex min-w-0 items-center gap-2">
          {showColor && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color ?? "#d1d5db" }}
            />
          )}
          <EditableText
            value={item.name}
            onCommit={(name) => patchItem(item.id, { name })}
          />
        </div>
        <div className="flex items-center gap-1">
          <EditableAmount
            value={item.amount}
            onCommit={(amount) => patchItem(item.id, { amount })}
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="invisible w-4 text-gray-300 hover:text-red-500 group-hover:visible"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  function addRowButton(section: BudgetSection, label = "Add row") {
    return (
      <button
        type="button"
        onClick={() => addItem(section)}
        className="mt-1 text-xs text-gray-300 transition-colors hover:text-gray-500"
      >
        + {label}
      </button>
    );
  }

  function summaryRow(label: string, value: number, red = false) {
    return (
      <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-1.5 text-sm font-semibold">
        <span>{label}</span>
        <span
          className={`pr-5 tabular-nums ${red && value < 0 ? "text-red-600" : ""}`}
        >
          {formatCurrency(value)}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Budget</h1>
        </header>

        {/* Months strip */}
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-6">
          <span className={`${sectionHeading} mb-0 mr-2`}>Months</span>
          {months.map((m) => (
            <span key={m.id} className="group relative inline-flex">
              <Link
                href={`/budget/${monthToSlug(m.month)}/`}
                className="rounded-full bg-gray-100 px-3.5 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                {formatMonthLabel(m.month)}
              </Link>
              <button
                type="button"
                onClick={() => removeMonth(m.id, m.month)}
                className="invisible absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[10px] leading-none text-white hover:bg-red-500 group-hover:visible"
                title="Delete month"
              >
                ×
              </button>
            </span>
          ))}
          {months.length === 0 && (
            <span className="text-sm text-gray-400">No months saved yet</span>
          )}
          <span className="ml-auto flex items-center gap-2">
            <MonthPicker
              value={monthInput}
              onChange={setMonthInput}
              align="right"
            />
            <button
              type="button"
              onClick={saveToMonth}
              disabled={savingMonth || !monthInput}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
            >
              {savingMonth ? "Saving…" : "Save budget to month"}
            </button>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1: Income + Savings + Rates */}
          <div className="flex flex-col gap-10">
            <section>
              <h2 className={sectionHeading}>Income</h2>
              <div className="divide-y divide-gray-100">
                {incomeItems.map((item) => itemRow(item, false))}
              </div>
              {summaryRow("Net", netIncome)}
              {addRowButton("income")}
            </section>

            <section>
              <h2 className={sectionHeading}>Savings / Investment</h2>
              <div className="divide-y divide-gray-100">
                {savingsItems.map((item) => itemRow(item, false))}
              </div>
              {addRowButton("savings")}
            </section>

            <section>
              <h2 className={sectionHeading}>Rates</h2>
              <div className="divide-y divide-gray-100 text-sm">
                {[
                  { label: "Spending", amount: expenseTotal },
                  { label: "Saving", amount: savingAmount },
                  { label: "Retirement", amount: retirement },
                  { label: "Loans", amount: loansAmount },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-1"
                  >
                    <span>{row.label}</span>
                    <span className="flex items-center gap-4 tabular-nums">
                      <span>{formatCurrency(row.amount)}</span>
                      <span className="w-14 text-right text-gray-400">
                        {ratesBase > 0
                          ? formatPercent(row.amount / ratesBase)
                          : "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Column 2: Expenses */}
          <section>
            <h2 className={sectionHeading}>Expenses</h2>
            <div className="divide-y divide-gray-100">
              {expenseItems.map((item) => itemRow(item, true))}
            </div>
            {summaryRow("Total", expenseTotal)}
            {addRowButton("expense", "Add category")}
          </section>

          {/* Column 3: Accounts + Loans */}
          <div className="flex flex-col gap-10">
            <section>
              <h2 className={sectionHeading}>Accounts</h2>
              <div className="divide-y divide-gray-100">
                {regularAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="group flex items-center justify-between gap-2 py-[3px]"
                  >
                    <EditableText
                      value={account.name}
                      onCommit={(name) => patchAccount(account.id, { name })}
                    />
                    <div className="flex items-center gap-1">
                      <EditableAmount
                        value={account.balance}
                        onCommit={(balance) =>
                          patchAccount(account.id, { balance })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeAccount(account.id)}
                        className="invisible w-4 text-gray-300 hover:text-red-500 group-hover:visible"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {loanAccounts.length > 0 && (
              <section>
                <h2 className={sectionHeading}>Loans</h2>
                <div className="divide-y divide-gray-100">
                  {loanAccounts.map((account) => (
                    <div key={account.id} className="group py-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <EditableText
                          value={account.name}
                          onCommit={(name) =>
                            patchAccount(account.id, { name })
                          }
                        />
                        <div className="flex items-center gap-1">
                          <EditableAmount
                            value={account.balance}
                            onCommit={(balance) =>
                              patchAccount(account.id, { balance })
                            }
                            className={
                              account.balance < 0 ? "text-red-600" : ""
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeAccount(account.id)}
                            className="invisible w-4 text-gray-300 hover:text-red-500 group-hover:visible"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pl-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          Due
                          <DatePicker
                            value={account.payoff_date}
                            onChange={(payoff_date) =>
                              patchAccount(account.id, { payoff_date })
                            }
                            clearable
                            align="right"
                            placeholder="—"
                            buttonClassName="rounded px-1 py-0.5 text-xs tabular-nums text-gray-500 hover:bg-black/5"
                          />
                        </span>
                        <span className="flex items-center gap-1">
                          Rate
                          <EditablePercent
                            value={account.interest_rate}
                            onCommit={(interest_rate) =>
                              patchAccount(account.id, { interest_rate })
                            }
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div>
              {summaryRow("Net Worth", netWorth, true)}
              {addingAccount ? (
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newAccount.name}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, name: e.target.value })
                      }
                      className="w-32 rounded-md border border-gray-200 px-2 py-1"
                      autoFocus
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Balance"
                      value={newAccount.balance}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          balance: e.target.value,
                        })
                      }
                      className="w-24 rounded-md border border-gray-200 px-2 py-1 text-right"
                    />
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={newAccount.is_loan}
                        onChange={(e) =>
                          setNewAccount({
                            ...newAccount,
                            is_loan: e.target.checked,
                          })
                        }
                      />
                      Loan
                    </label>
                  </div>
                  {newAccount.is_loan && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Rate %"
                        value={newAccount.interest_rate}
                        onChange={(e) =>
                          setNewAccount({
                            ...newAccount,
                            interest_rate: e.target.value,
                          })
                        }
                        className="w-20 rounded-md border border-gray-200 px-2 py-1 text-right"
                      />
                      <DatePicker
                        value={newAccount.payoff_date || null}
                        onChange={(payoff_date) =>
                          setNewAccount({
                            ...newAccount,
                            payoff_date: payoff_date ?? "",
                          })
                        }
                        clearable
                        align="right"
                        placeholder="Payoff date"
                        buttonClassName="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={submitNewAccount}
                      className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingAccount(false)}
                      className="rounded-md px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingAccount(true)}
                  className="mt-1 text-xs text-gray-300 transition-colors hover:text-gray-500"
                >
                  + Add account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
