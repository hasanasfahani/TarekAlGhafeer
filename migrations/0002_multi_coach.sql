alter table registrations
  add column if not exists refund_id text,
  add column if not exists refund_status text,
  add column if not exists refunded_at timestamptz;

insert into coaches (name, slug, status)
values
  ('Tarek Alghafeer', 'coach-tarek', 'active'),
  ('Abdulrahman Katlan', 'abdulrahman-katlan', 'active'),
  ('Loay Hamdan', 'loay-hamdan', 'active'),
  ('Karam Alhemesh', 'karam-alhemesh', 'active')
on conflict (slug) do update
set name = excluded.name,
    status = excluded.status,
    updated_at = now();

insert into challenges (
  coach_id,
  name,
  slug,
  price_amount,
  currency,
  entry_code,
  start_date,
  status
)
select
  c.id,
  seed.challenge_name,
  seed.challenge_slug,
  seed.price_amount,
  'AED',
  null,
  timestamptz '2026-07-01 00:00:00+04',
  'active'
from (
  values
    ('coach-tarek', 'Coach Tarek Challenge', 'coach-tarek-challenge', 14900),
    ('abdulrahman-katlan', 'Coach Abdulrahman Challenge', 'abdulrahman-katlan-challenge', 14900),
    ('loay-hamdan', 'Coach Loay Challenge', 'loay-hamdan-challenge', 14900),
    ('karam-alhemesh', 'Coach Karam Challenge', 'karam-alhemesh-challenge', 19900)
) as seed(coach_slug, challenge_name, challenge_slug, price_amount)
join coaches c on c.slug = seed.coach_slug
on conflict (coach_id, slug) do update
set name = excluded.name,
    price_amount = excluded.price_amount,
    currency = excluded.currency,
    entry_code = excluded.entry_code,
    start_date = excluded.start_date,
    status = excluded.status,
    updated_at = now();
