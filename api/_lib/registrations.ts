import { randomUUID } from "crypto";
import { Pool } from "pg";

const defaultCoachSlug = "coach-tarek";
const defaultChallengeSlug = "coach-tarek-challenge";
const defaultChallengeAmount = 14900;
const defaultChallengeCurrency = "AED";
const defaultChallengeName = "Coach Tarek Challenge";
const defaultChallengeEntryCode = "336699";

declare global {
  // eslint-disable-next-line no-var
  var coachPortalApiPool: Pool | undefined;
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.coachPortalApiPool) {
    globalThis.coachPortalApiPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_URL.includes("localhost") ||
        process.env.DATABASE_URL.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false },
    });
  }

  return globalThis.coachPortalApiPool;
}

export function canUseRegistrationsDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeContact(input: any) {
  const name = String(input?.name || "").trim();
  const email = String(input?.email || "").trim().toLowerCase();
  const whatsapp = String(input?.whatsapp || "").trim();

  if (name.length < 2 || !/\S+@\S+\.\S+/.test(email) || whatsapp.length < 7) {
    throw new Error("Invalid registration contact information.");
  }

  return { name, email, whatsapp };
}

async function ensureDefaultChallenge() {
  const pool = getPool();

  let coachResult = await pool.query(
    "select * from coaches where slug = $1 limit 1",
    [defaultCoachSlug],
  );

  if (coachResult.rowCount === 0) {
    coachResult = await pool.query(
      `insert into coaches (name, slug, status)
       values ($1, $2, 'active')
       on conflict (slug) do update set updated_at = now()
       returning *`,
      ["Tarek AlGhafeer", defaultCoachSlug],
    );
  }

  const coach = coachResult.rows[0];
  let challengeResult = await pool.query(
    "select * from challenges where coach_id = $1 and slug = $2 limit 1",
    [coach.id, defaultChallengeSlug],
  );

  if (challengeResult.rowCount === 0) {
    challengeResult = await pool.query(
      `insert into challenges (
        coach_id, name, slug, price_amount, currency, entry_code, status
      )
      values ($1, $2, $3, $4, $5, $6, 'active')
      on conflict (coach_id, slug) do update set updated_at = now()
      returning *`,
      [
        coach.id,
        defaultChallengeName,
        defaultChallengeSlug,
        defaultChallengeAmount,
        defaultChallengeCurrency,
        defaultChallengeEntryCode,
      ],
    );
  }

  return { coach, challenge: challengeResult.rows[0] };
}

export async function createPendingRegistration(contactInput: unknown) {
  const contact = normalizeContact(contactInput);
  const pool = getPool();
  const { coach, challenge } = await ensureDefaultChallenge();
  const operationId = randomUUID();

  const customerResult = await pool.query(
    `insert into customers (name, email, whatsapp)
     values ($1, $2, $3)
     returning *`,
    [contact.name, contact.email, contact.whatsapp],
  );

  const customer = customerResult.rows[0];
  const registrationResult = await pool.query(
    `insert into registrations (
      customer_id, coach_id, challenge_id, status, payment_provider,
      operation_id, amount, currency
    )
    values ($1, $2, $3, 'pending', 'ziina', $4, $5, $6)
    returning *`,
    [
      customer.id,
      coach.id,
      challenge.id,
      operationId,
      challenge.price_amount,
      challenge.currency,
    ],
  );

  return { customer, coach, challenge, registration: registrationResult.rows[0] };
}

export async function attachPaymentIntentToRegistration({
  registrationId,
  paymentIntentId,
  rawPayment,
}: {
  registrationId: string;
  paymentIntentId: string;
  rawPayment?: unknown;
}) {
  const pool = getPool();
  const result = await pool.query(
    `update registrations
     set payment_intent_id = $2, raw_payment = $3, updated_at = now()
     where id = $1
     returning *`,
    [registrationId, paymentIntentId, rawPayment ? JSON.stringify(rawPayment) : null],
  );

  return result.rows[0];
}

export async function markRegistrationPaid({
  registrationId,
  paymentIntentId,
  rawPayment,
}: {
  registrationId?: string | null;
  paymentIntentId?: string | null;
  rawPayment?: unknown;
}) {
  if (!registrationId && !paymentIntentId) {
    throw new Error("A registration id or payment intent id is required.");
  }

  const pool = getPool();
  const result = registrationId
    ? await pool.query(
        `update registrations
         set status = 'paid',
             payment_intent_id = coalesce($2, payment_intent_id),
             raw_payment = coalesce($3, raw_payment),
             paid_at = coalesce(paid_at, now()),
             updated_at = now()
         where id = $1
         returning *`,
        [registrationId, paymentIntentId, rawPayment ? JSON.stringify(rawPayment) : null],
      )
    : await pool.query(
        `update registrations
         set status = 'paid',
             raw_payment = coalesce($2, raw_payment),
             paid_at = coalesce(paid_at, now()),
             updated_at = now()
         where payment_intent_id = $1
         returning *`,
        [paymentIntentId, rawPayment ? JSON.stringify(rawPayment) : null],
      );

  return result.rows[0];
}

export async function updateRegistrationStatus({
  paymentIntentId,
  status,
  rawPayment,
}: {
  paymentIntentId?: string | null;
  status: string;
  rawPayment?: unknown;
}) {
  if (!paymentIntentId) {
    throw new Error("A payment intent id is required.");
  }

  const pool = getPool();
  const result = await pool.query(
    `update registrations
     set status = $2, raw_payment = coalesce($3, raw_payment), updated_at = now()
     where payment_intent_id = $1
     returning *`,
    [paymentIntentId, status, rawPayment ? JSON.stringify(rawPayment) : null],
  );

  return result.rows[0];
}

export async function listRegistrations(status?: string) {
  const pool = getPool();
  const params: string[] = [];
  const where = status ? "where r.status = $1" : "";
  if (status) params.push(status);

  const result = await pool.query(
    `select
      r.id,
      r.status,
      r.amount,
      r.currency,
      r.payment_provider,
      r.payment_intent_id,
      r.operation_id,
      r.paid_at,
      r.created_at,
      c.name as customer_name,
      c.email as customer_email,
      c.whatsapp as customer_whatsapp,
      co.name as coach_name,
      co.slug as coach_slug,
      ch.name as challenge_name,
      ch.slug as challenge_slug,
      ch.entry_code as challenge_entry_code
    from registrations r
    join customers c on c.id = r.customer_id
    join coaches co on co.id = r.coach_id
    join challenges ch on ch.id = r.challenge_id
    ${where}
    order by r.created_at desc`,
    params,
  );

  return result.rows.map((row) => ({
    id: row.id,
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    paymentProvider: row.payment_provider,
    paymentIntentId: row.payment_intent_id,
    operationId: row.operation_id,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      whatsapp: row.customer_whatsapp,
    },
    coach: {
      name: row.coach_name,
      slug: row.coach_slug,
    },
    challenge: {
      name: row.challenge_name,
      slug: row.challenge_slug,
      entryCode: row.challenge_entry_code,
    },
  }));
}

export async function getAdminSummary() {
  const pool = getPool();
  const totals = await pool.query(
    `select count(*)::int as total_registrations,
            coalesce(sum(amount), 0)::int as total_revenue
     from registrations
     where status = 'paid'`,
  );
  const pending = await pool.query(
    `select count(*)::int as total_pending
     from registrations
     where status = 'pending'`,
  );
  const byChallenge = await pool.query(
    `select co.name as coach_name,
            ch.name as challenge_name,
            count(r.id)::int as paid_registrations,
            coalesce(sum(r.amount), 0)::int as revenue
     from registrations r
     join coaches co on co.id = r.coach_id
     join challenges ch on ch.id = r.challenge_id
     where r.status = 'paid'
     group by co.name, ch.name
     order by count(r.id) desc`,
  );

  return {
    totalPaidRegistrations: totals.rows[0]?.total_registrations ?? 0,
    totalRevenue: totals.rows[0]?.total_revenue ?? 0,
    totalPendingRegistrations: pending.rows[0]?.total_pending ?? 0,
    byChallenge: byChallenge.rows.map((row) => ({
      coachName: row.coach_name,
      challengeName: row.challenge_name,
      paidRegistrations: row.paid_registrations,
      revenue: row.revenue,
    })),
  };
}
