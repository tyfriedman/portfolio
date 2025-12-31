-- SQL Schema for Todos Table
-- Run this in your Supabase SQL editor to create the todos table

CREATE TABLE todos
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    due_date DATE NOT NULL,
    due_time TIME,
    status TEXT NOT NULL CHECK (status IN ('done', 'started', 'not_started')),
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    (),
  updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT NOW
    ()
);

    CREATE INDEX idx_todos_due_date ON todos(due_date);
    CREATE INDEX idx_todos_status ON todos(status);

