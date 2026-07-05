import { supabase } from "@/budget/lib/supabaseClient";
import { listBudgetItems, type BudgetSection } from "@/budget/lib/db/items";
import { listAccounts } from "@/budget/lib/db/accounts";

export interface BudgetMonth {
  id: string;
  month: string; // ISO date, first day of month (YYYY-MM-01)
}

export interface MonthBudgetItem {
  id: string;
  month_id: string;
  section: BudgetSection;
  name: string;
  amount: number;
  color: string | null;
  sort_order: number;
}

export interface MonthAccount {
  id: string;
  month_id: string;
  name: string;
  start_balance: number | null;
  end_balance: number | null;
  sort_order: number;
}

function mapMonthItem(row: any): MonthBudgetItem {
  return {
    id: row.id,
    month_id: row.month_id,
    section: row.section,
    name: row.name,
    amount: Number(row.amount),
    color: row.color,
    sort_order: row.sort_order,
  };
}

function mapMonthAccount(row: any): MonthAccount {
  return {
    id: row.id,
    month_id: row.month_id,
    name: row.name,
    start_balance: row.start_balance === null ? null : Number(row.start_balance),
    end_balance: row.end_balance === null ? null : Number(row.end_balance),
    sort_order: row.sort_order,
  };
}

export async function listMonths(): Promise<BudgetMonth[]> {
  const { data, error } = await supabase
    .from("budget_months")
    .select("id, month")
    .order("month", { ascending: false });

  if (error) {
    console.error("Error loading months", error);
    return [];
  }

  return data ?? [];
}

export async function getMonthByDate(
  month: string
): Promise<BudgetMonth | null> {
  const { data, error } = await supabase
    .from("budget_months")
    .select("id, month")
    .eq("month", month)
    .maybeSingle();

  if (error) {
    console.error("Error loading month", error);
    return null;
  }

  return data;
}

export async function listMonthItems(
  monthId: string
): Promise<MonthBudgetItem[]> {
  const { data, error } = await supabase
    .from("month_budget_items")
    .select("*")
    .eq("month_id", monthId)
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading month items", error);
    return [];
  }

  return data?.map(mapMonthItem) ?? [];
}

export async function listMonthAccounts(
  monthId: string
): Promise<MonthAccount[]> {
  const { data, error } = await supabase
    .from("month_accounts")
    .select("*")
    .eq("month_id", monthId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading month accounts", error);
    return [];
  }

  return data?.map(mapMonthAccount) ?? [];
}

/**
 * Snapshot the live budget into a month. If the month already exists,
 * amounts are updated for items matching by name (keeping transaction links)
 * and new items/accounts are added.
 *
 * Income is snapshotted as two categories: "Salary" (the computed net from
 * the live budget: Gross - Taxes - 401k - HSA...) and "Misc".
 */
export async function saveBudgetToMonth(month: string): Promise<BudgetMonth> {
  const [items, accounts] = await Promise.all([
    listBudgetItems(),
    listAccounts(),
  ]);

  const incomeItems = items.filter((i) => i.section === "income");
  const gross = incomeItems.find((i) => i.name === "Gross")?.amount ?? 0;
  const deductions = incomeItems
    .filter((i) => i.name !== "Gross")
    .reduce((sum, i) => sum + i.amount, 0);
  const net = gross - deductions;

  const snapshotItems: Array<{
    section: BudgetSection;
    name: string;
    amount: number;
    color: string | null;
    sort_order: number;
  }> = [
    { section: "income", name: "Salary", amount: net, color: "#6aa84f", sort_order: 0 },
    { section: "income", name: "Misc", amount: 0, color: "#93c47d", sort_order: 1 },
    ...items
      .filter((i) => i.section === "expense")
      .map((i) => ({
        section: i.section,
        name: i.name,
        amount: i.amount,
        color: i.color,
        sort_order: i.sort_order,
      })),
  ];

  let monthRow = await getMonthByDate(month);

  if (!monthRow) {
    const { data, error } = await supabase
      .from("budget_months")
      .insert([{ month }])
      .select("id, month")
      .single();

    if (error || !data) {
      throw error || new Error("Failed to create month");
    }
    monthRow = data;
  }

  const monthId = monthRow.id;
  const existingItems = await listMonthItems(monthId);
  const existingAccounts = await listMonthAccounts(monthId);

  for (const item of snapshotItems) {
    const existing = existingItems.find(
      (e) => e.section === item.section && e.name === item.name
    );
    if (existing) {
      const { error } = await supabase
        .from("month_budget_items")
        .update({
          amount: item.amount,
          color: item.color,
          sort_order: item.sort_order,
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("month_budget_items")
        .insert([{ month_id: monthId, ...item }]);
      if (error) throw error;
    }
  }

  for (const account of accounts) {
    const existing = existingAccounts.find((e) => e.name === account.name);
    if (existing) {
      const { error } = await supabase
        .from("month_accounts")
        .update({
          start_balance: account.balance,
          sort_order: account.sort_order,
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("month_accounts").insert([
        {
          month_id: monthId,
          name: account.name,
          start_balance: account.balance,
          end_balance: null,
          sort_order: account.sort_order,
        },
      ]);
      if (error) throw error;
    }
  }

  return monthRow;
}

export async function deleteMonth(id: string): Promise<void> {
  const { error } = await supabase.from("budget_months").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateMonthItem(
  id: string,
  input: { amount?: number; name?: string; color?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from("month_budget_items")
    .update(input)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateMonthAccount(
  id: string,
  input: { start_balance?: number | null; end_balance?: number | null }
): Promise<void> {
  const { error } = await supabase
    .from("month_accounts")
    .update(input)
    .eq("id", id);

  if (error) {
    throw error;
  }
}
