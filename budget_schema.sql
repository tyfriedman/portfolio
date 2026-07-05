-- SQL Schema for the Budget feature
-- Run this in your Supabase SQL editor to create the budget tables and seed data.

-- Live account balances shown on the home page (loans are accounts with negative balances)
CREATE TABLE budget_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_loan BOOLEAN NOT NULL DEFAULT FALSE,
  interest_rate NUMERIC(5,2),          -- loans only
  payoff_date DATE,                    -- loans only
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- The live/main budget: income lines, savings lines, expense categories
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('income', 'savings', 'expense')),
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  color TEXT,                          -- hex color for expense categories
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One row per saved month
CREATE TABLE budget_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL UNIQUE,          -- first day of month, e.g. 2026-07-01
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Snapshot of budget_items at save time (editing these never touches the main budget)
CREATE TABLE month_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('income', 'savings', 'expense')),
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  color TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- Snapshot of accounts with user-editable start/end balances
CREATE TABLE month_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_balance NUMERIC(12,2),
  end_balance NUMERIC(12,2),
  sort_order INT NOT NULL DEFAULT 0
);

-- Transactions; category points at a month snapshot item (expense OR income, so
-- "misc income" transactions roll up into income actuals)
CREATE TABLE budget_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category_id UUID REFERENCES month_budget_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_month_budget_items_month ON month_budget_items(month_id);
CREATE INDEX idx_month_accounts_month ON month_accounts(month_id);
CREATE INDEX idx_transactions_month ON budget_transactions(month_id);

-- ============================================================
-- Seed data (matches the Google Sheets budget)
-- ============================================================

-- Income lines (Net is computed in the app: Gross - Taxes - 401k - HSA)
INSERT INTO budget_items (section, name, amount, color, sort_order) VALUES
  ('income', 'Gross',      8750.00, NULL, 0),
  ('income', 'Taxes',      1858.55, NULL, 1),
  ('income', '401k Cont.',  437.50, NULL, 2),
  ('income', 'HSA Cont.',   625.00, NULL, 3);

-- Savings / Investment lines
INSERT INTO budget_items (section, name, amount, color, sort_order) VALUES
  ('savings', 'Invest',        0.00, NULL, 0),
  ('savings', 'Loans',       338.79, NULL, 1),
  ('savings', 'HYSA',       1000.00, NULL, 2),
  ('savings', 'Fun Savings',   0.00, NULL, 3);

-- Expense categories with colors
INSERT INTO budget_items (section, name, amount, color, sort_order) VALUES
  ('expense', 'Rent',          1793.00, '#d9d9d9', 0),
  ('expense', 'Utilities',      150.00, '#d9d9d9', 1),
  ('expense', 'Internet',        72.16, '#d9d9d9', 2),
  ('expense', 'Health',          45.00, '#d9d9d9', 3),
  ('expense', 'Car Insurance',  250.00, '#d9d9d9', 4),
  ('expense', 'Phone',           30.00, '#d9d9d9', 5),
  ('expense', 'Subscriptions',  200.00, '#ea4335', 6),
  ('expense', 'Gas',            300.00, '#a0522d', 7),
  ('expense', 'Groceries',      500.00, '#34a853', 8),
  ('expense', 'Restaurants',    200.00, '#ff6d01', 9),
  ('expense', 'Fun',            200.00, '#4285f4', 10),
  ('expense', 'Misc',           250.00, '#fbbc04', 11),
  ('expense', 'Emma',           500.00, '#e57ce5', 12);

-- Accounts (loans carry negative balances plus a rate and payoff date)
INSERT INTO budget_accounts (name, balance, is_loan, interest_rate, payoff_date, sort_order) VALUES
  ('Savings',      1241.78, FALSE, NULL, NULL,        0),
  ('Checking',     2408.73, FALSE, NULL, NULL,        1),
  ('401k',            0.00, FALSE, NULL, NULL,        2),
  ('ECSI',        -1450.00, TRUE,  5.00, '2027-03-10', 3),
  ('EdFinancial', -7666.37, TRUE,  6.39, '2026-11-01', 4),
  ('Ascent',      -7500.00, TRUE,  8.01, '2026-05-24', 5);
