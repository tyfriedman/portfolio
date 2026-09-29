-- SQL Schema for LinkedIn game results
-- Run this in your Supabase SQL editor to create the game_results table.

CREATE TABLE game_results
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- normalized key: queens, tango, zip, pinpoint, crossclimb, mini_sudoku, patches, wend
    game TEXT NOT NULL,
    puzzle_number INTEGER NOT NULL,
    played_on DATE NOT NULL,
    -- time-based games store seconds; guess-based games (Pinpoint) store guesses
    seconds INTEGER,
    guesses INTEGER,
    -- the first line of the share text as pasted, for reference
    raw_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (game, played_on)
);

CREATE INDEX idx_game_results_played_on ON game_results(played_on DESC);

-- Access control.
-- Reads are public (the /interests page and GET /api/games show them).
-- Writes should only come from the server via POST /api/games, which is
-- protected by GAMES_INGEST_TOKEN. To keep the anon key from being able to
-- write directly, enable RLS with a read-only policy and set
-- SUPABASE_SERVICE_ROLE_KEY in the server environment so the API route can
-- write. If you skip the service role key, comment out the two lines below
-- and writes will go through the anon key like the todos table does.
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON game_results FOR SELECT USING (true);
