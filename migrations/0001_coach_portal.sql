create extension if not exists "pgcrypto";

create table if not exists coaches (
  id varchar primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists challenges (
  id varchar primary key default gen_random_uuid(),
  coach_id varchar not null references coaches(id) on delete cascade,
  name text not null,
  slug text not null,
  price_amount integer not null,
  currency text not null default 'AED',
  entry_code text,
  start_date timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists challenges_coach_slug_unique
  on challenges(coach_id, slug);

create table if not exists customers (
  id varchar primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists registrations (
  id varchar primary key default gen_random_uuid(),
  customer_id varchar not null references customers(id) on delete cascade,
  coach_id varchar not null references coaches(id) on delete cascade,
  challenge_id varchar not null references challenges(id) on delete cascade,
  status text not null default 'pending',
  payment_provider text not null default 'ziina',
  payment_intent_id text,
  operation_id text not null unique,
  amount integer not null,
  currency text not null,
  source text not null default 'coach-tarek-registration-form',
  raw_payment jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registrations_status_idx on registrations(status);
create index if not exists registrations_payment_intent_idx on registrations(payment_intent_id);
create index if not exists registrations_created_at_idx on registrations(created_at desc);

alter table registrations
  add column if not exists confirmation_email_sent_at timestamptz,
  add column if not exists confirmation_email_status text,
  add column if not exists confirmation_email_error text,
  add column if not exists confirmation_email_message_id text;

alter table registrations
  add column if not exists refund_id text,
  add column if not exists refund_status text,
  add column if not exists refunded_at timestamptz;
