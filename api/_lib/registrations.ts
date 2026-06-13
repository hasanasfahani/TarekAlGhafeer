import { randomUUID } from "crypto";
import { buildConfirmationEmail, sendResendEmail } from "./confirmationEmail.js";
import {
  getCoachConfigBySlug,
  getPackageConfig,
  type PackageId,
} from "../../shared/coaches.js";

function getPaidPackageId(input: unknown): Exclude<PackageId, "free"> {
  return input === "premium-duo" ? "premium-duo" : "premium-single";
}

declare global {
  // eslint-disable-next-line no-var
  var coachPortalApiPool: any;
}

async function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.coachPortalApiPool) {
    const { Pool } = await import("pg");
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

async function ensureRegistrationEmailColumns() {
  const pool = await getPool();
  await pool.query(
    `alter table registrations
       add column if not exists confirmation_email_sent_at timestamptz,
       add column if not exists confirmation_email_status text,
       add column if not exists confirmation_email_error text,
       add column if not exists confirmation_email_message_id text,
       add column if not exists refund_id text,
       add column if not exists refund_status text,
       add column if not exists refunded_at timestamptz`,
  );
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

async function ensureChallenge(coachSlug?: string | null) {
  const pool = await getPool();
  const config = getCoachConfigBySlug(coachSlug);

  let coachResult = await pool.query(
    "select * from coaches where slug = $1 limit 1",
    [config.coachSlug],
  );

  if (coachResult.rowCount === 0) {
    coachResult = await pool.query(
      `insert into coaches (name, slug, status)
       values ($1, $2, 'active')
       on conflict (slug) do update set updated_at = now()
       returning *`,
      [config.name, config.coachSlug],
    );
  }

  const coach = coachResult.rows[0];
  let challengeResult = await pool.query(
    "select * from challenges where coach_id = $1 and slug = $2 limit 1",
    [coach.id, config.challengeSlug],
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
        config.challengeName,
        config.challengeSlug,
        config.packages["premium-single"].price * 100,
        config.packages["premium-single"].currency,
        null,
      ],
    );
  }

  return { coach, challenge: challengeResult.rows[0] };
}

export async function createPendingRegistration(
  contactInput: unknown,
  packageInput?: unknown,
) {
  const contact = normalizeContact(contactInput);
  const pool = await getPool();
  const config = getCoachConfigBySlug((contactInput as any)?.coachSlug);
  const { coach, challenge } = await ensureChallenge(config.coachSlug);
  const packageId = getPaidPackageId(packageInput);
  const selectedPackage = getPackageConfig(config, packageId);
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
      operation_id, amount, currency, raw_payment
    )
    values ($1, $2, $3, 'pending', 'ziina', $4, $5, $6, $7)
    returning *`,
    [
      customer.id,
      coach.id,
      challenge.id,
      operationId,
      selectedPackage.price * 100,
      challenge.currency,
      JSON.stringify({
        packageId,
        packageTrackingId: selectedPackage.trackingId,
        packageName: selectedPackage.name,
      }),
    ],
  );

  return { customer, coach, challenge, registration: registrationResult.rows[0] };
}

export async function createFreeRegistration(contactInput: unknown) {
  const contact = normalizeContact(contactInput);
  const pool = await getPool();
  const config = getCoachConfigBySlug((contactInput as any)?.coachSlug);
  const { coach, challenge } = await ensureChallenge(config.coachSlug);

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
      operation_id, amount, currency, raw_payment, paid_at
    )
    values ($1, $2, $3, 'paid', 'free', $4, 0, $5, $6, now())
    returning *`,
    [
      customer.id,
      coach.id,
      challenge.id,
      randomUUID(),
      challenge.currency,
      JSON.stringify({
        packageId: "free",
        packageTrackingId: config.packages.free.trackingId,
        packageName: config.packages.free.name,
      }),
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
  const pool = await getPool();
  const result = await pool.query(
    `update registrations
     set payment_intent_id = $2,
         raw_payment = coalesce(raw_payment, '{}'::jsonb)
           || jsonb_build_object('provider', $3::jsonb),
         updated_at = now()
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

  const pool = await getPool();
  const result = registrationId
    ? await pool.query(
        `update registrations
         set status = 'paid',
             payment_intent_id = coalesce($2, payment_intent_id),
             raw_payment = coalesce(raw_payment, '{}'::jsonb)
               || case
                    when $3::jsonb is null then '{}'::jsonb
                    else jsonb_build_object('provider', $3::jsonb)
                  end,
             paid_at = coalesce(paid_at, now()),
             updated_at = now()
         where id = $1
         returning *`,
        [registrationId, paymentIntentId, rawPayment ? JSON.stringify(rawPayment) : null],
      )
    : await pool.query(
        `update registrations
         set status = 'paid',
             raw_payment = coalesce(raw_payment, '{}'::jsonb)
               || case
                    when $2::jsonb is null then '{}'::jsonb
                    else jsonb_build_object('provider', $2::jsonb)
                  end,
             paid_at = coalesce(paid_at, now()),
             updated_at = now()
         where payment_intent_id = $1
         returning *`,
        [paymentIntentId, rawPayment ? JSON.stringify(rawPayment) : null],
      );

  return result.rows[0];
}

async function getRegistrationConfirmationPayload(registrationId: string) {
  const pool = await getPool();
  await ensureRegistrationEmailColumns();

  const result = await pool.query(
    `select
       r.id,
       r.status,
       r.confirmation_email_sent_at,
       c.name as customer_name,
       c.email as customer_email,
       ch.entry_code as challenge_entry_code,
       co.name as coach_name,
       co.slug as coach_slug,
       ch.name as challenge_name
     from registrations r
     join customers c on c.id = r.customer_id
     join coaches co on co.id = r.coach_id
     join challenges ch on ch.id = r.challenge_id
     where r.id = $1
     limit 1`,
    [registrationId],
  );

  return result.rows[0] as Record<string, any> | undefined;
}

export async function sendConfirmationEmailForRegistration({
  registrationId,
  origin,
}: {
  registrationId?: string | null;
  origin?: string;
}) {
  if (!registrationId) {
    return { skipped: true, reason: "missing_registration_id" };
  }

  const pool = await getPool();
  const payload = await getRegistrationConfirmationPayload(registrationId);

  if (!payload) {
    return { skipped: true, reason: "registration_not_found" };
  }

  if (payload.status !== "paid") {
    return { skipped: true, reason: "registration_not_paid" };
  }

  if (payload.confirmation_email_sent_at) {
    return { skipped: true, reason: "already_sent" };
  }

  try {
    const email = buildConfirmationEmail({
      to: payload.customer_email,
      customerName: payload.customer_name,
      entryCode: payload.challenge_entry_code,
      coach: getCoachConfigBySlug(payload.coach_slug),
      challengeName: payload.challenge_name,
      origin,
    });
    const result = await sendResendEmail({
      to: payload.customer_email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    const messageId =
      result && typeof result === "object" && "id" in result ? String(result.id) : null;

    await pool.query(
      `update registrations
       set confirmation_email_sent_at = now(),
           confirmation_email_status = 'sent',
           confirmation_email_error = null,
           confirmation_email_message_id = $2,
           updated_at = now()
       where id = $1`,
      [registrationId, messageId],
    );

    return { sent: true, messageId };
  } catch (error) {
    await pool.query(
      `update registrations
       set confirmation_email_status = 'failed',
           confirmation_email_error = $2,
           updated_at = now()
       where id = $1`,
      [registrationId, error instanceof Error ? error.message : "Unknown email error"],
    );
    throw error;
  }
}

export async function updateRegistrationStatus({
  registrationId,
  paymentIntentId,
  status,
  rawPayment,
}: {
  registrationId?: string | null;
  paymentIntentId?: string | null;
  status: string;
  rawPayment?: unknown;
}) {
  if (!registrationId && !paymentIntentId) {
    throw new Error("A registration id or payment intent id is required.");
  }

  const pool = await getPool();
  const result = registrationId
    ? await pool.query(
        `update registrations
         set status = $2,
             raw_payment = coalesce(raw_payment, '{}'::jsonb)
               || case
                    when $3::jsonb is null then '{}'::jsonb
                    else jsonb_build_object('provider', $3::jsonb)
                  end,
             updated_at = now()
         where id = $1
         returning *`,
        [registrationId, status, rawPayment ? JSON.stringify(rawPayment) : null],
      )
    : await pool.query(
        `update registrations
         set status = $2,
             raw_payment = coalesce(raw_payment, '{}'::jsonb)
               || case
                    when $3::jsonb is null then '{}'::jsonb
                    else jsonb_build_object('provider', $3::jsonb)
                  end,
             updated_at = now()
         where payment_intent_id = $1
         returning *`,
        [paymentIntentId, status, rawPayment ? JSON.stringify(rawPayment) : null],
      );

  return result.rows[0];
}

export async function listRegistrations(status?: string) {
  const pool = await getPool();
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
      r.refund_id,
      r.refund_status,
      r.refunded_at,
      r.paid_at,
      r.confirmation_email_sent_at,
      r.confirmation_email_status,
      r.confirmation_email_error,
      r.confirmation_email_message_id,
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

  return result.rows.map((row: Record<string, any>) => ({
    id: row.id,
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    paymentProvider: row.payment_provider,
    paymentIntentId: row.payment_intent_id,
    operationId: row.operation_id,
    refundId: row.refund_id,
    refundStatus: row.refund_status,
    refundedAt: row.refunded_at,
    paidAt: row.paid_at,
    confirmationEmailSentAt: row.confirmation_email_sent_at,
    confirmationEmailStatus: row.confirmation_email_status,
    confirmationEmailError: row.confirmation_email_error,
    confirmationEmailMessageId: row.confirmation_email_message_id,
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

export async function getRegistrationForRefund(registrationId: string) {
  const pool = await getPool();
  await ensureRegistrationEmailColumns();
  const result = await pool.query(
    `select id, status, amount, currency, payment_intent_id, refund_id
     from registrations
     where id = $1
     limit 1`,
    [registrationId],
  );
  return result.rows[0] as Record<string, any> | undefined;
}

export async function recordRegistrationRefund({
  registrationId,
  refund,
}: {
  registrationId: string;
  refund: Record<string, any>;
}) {
  const pool = await getPool();
  await ensureRegistrationEmailColumns();
  const completed = refund.status === "completed";
  const result = await pool.query(
    `update registrations
     set status = $2,
         refund_id = $3,
         refund_status = $4,
         refunded_at = case when $5 then coalesce(refunded_at, now()) else refunded_at end,
         updated_at = now()
     where id = $1
     returning *`,
    [
      registrationId,
      completed ? "refunded" : "refund_pending",
      refund.id,
      refund.status,
      completed,
    ],
  );
  return result.rows[0];
}

export async function getAdminSummary() {
  const pool = await getPool();
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
    byChallenge: byChallenge.rows.map((row: Record<string, any>) => ({
      coachName: row.coach_name,
      challengeName: row.challenge_name,
      paidRegistrations: row.paid_registrations,
      revenue: row.revenue,
    })),
  };
}
