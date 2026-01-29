-- Among Us game schema

create table
if not exists public.amongus_rooms
(
  id uuid primary key default gen_random_uuid
(),
  code text not null unique,
  leader_player_id uuid,
  state text not null check
(state in
('lobby', 'reveal', 'playing', 'ended')) default 'lobby',
  num_imposters integer not null default 1 check
(num_imposters >= 1),
  created_at timestamptz not null default now
()
);

create table
if not exists public.amongus_players
(
  id uuid primary key default gen_random_uuid
(),
  room_id uuid not null references public.amongus_rooms
(id) on
delete cascade,
  name text
not null,
  is_leader boolean not null default false,
  role text check
(role in
('imposter', 'crewmate')) ,
  created_at timestamptz not null default now
()
);

create table
if not exists public.amongus_tasks
(
  id uuid primary key default gen_random_uuid
(),
  room_id uuid not null references public.amongus_rooms
(id) on
delete cascade,
  player_id uuid
not null references public.amongus_players
(id) on
delete cascade,
  task_text text
not null,
  is_completed boolean not null default false,
  counts_for_completion boolean not null default true,
  created_at timestamptz not null default now
()
);

