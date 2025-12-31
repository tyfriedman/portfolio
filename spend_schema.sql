-- SQL Schema for Spend Tracker Tables
-- Run this in your Supabase SQL editor to create the tables

-- Categories table
CREATE TABLE categories
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    ()
);

    -- Cards table
    CREATE TABLE cards
    (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
        created_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        ()
);

        -- Transactions table
        CREATE TABLE transactions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    vendor_name TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    card_id UUID NOT NULL REFERENCES cards
        (id) ON
        DELETE RESTRICT,
    created_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        (),
    updated_at TIMESTAMP
        WITH TIME ZONE DEFAULT NOW
        ()
);

        -- Indexes for performance
        CREATE INDEX idx_transactions_date ON transactions(date DESC);
        CREATE INDEX idx_transactions_category_id ON transactions(category_id);
        CREATE INDEX idx_transactions_card_id ON transactions(card_id);

