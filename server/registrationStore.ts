import { randomUUID } from "crypto";
import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import {
  challenges,
  coaches,
  customers,
  registrationContactSchema,
  registrations,
  type RegistrationContact,
} from "@shared/schema";
import { getDb, hasDatabaseConfig } from "./db";

export const defaultCoachSlug = "coach-tarek";
export const defaultChallengeSlug = "coach-tarek-challenge";
export const defaultChallengeAmount = 14900;
export const defaultChallengeCurrency = "AED";
export const defaultChallengeName = "Coach Tarek Challenge";
export const defaultChallengeEntryCode = "336699";

export type RegistrationRecord = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  paymentIntentId: string | null;
  operationId: string;
  paidAt: Date | null;
  createdAt: Date;
  customer: {
    name: string;
    email: string;
    whatsapp: string;
  };
  coach: {
    name: string;
    slug: string;
  };
  challenge: {
    name: string;
    slug: string;
    entryCode: string | null;
  };
};

export function normalizeContact(input: unknown): RegistrationContact {
  return registrationContactSchema.parse(input);
}

export function canUseRegistrationsDatabase() {
  return hasDatabaseConfig();
}

export async function ensureDefaultChallenge() {
  const db = getDb();

  const [existingCoach] = await db
    .select()
    .from(coaches)
    .where(eq(coaches.slug, defaultCoachSlug))
    .limit(1);

  const [coach] =
    existingCoach
      ? [existingCoach]
      : await db
          .insert(coaches)
          .values({
            name: "Tarek AlGhafeer",
            slug: defaultCoachSlug,
            status: "active",
          })
          .returning();

  const [existingChallenge] = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.coachId, coach.id),
        eq(challenges.slug, defaultChallengeSlug),
      ),
    )
    .limit(1);

  if (existingChallenge) {
    return { coach, challenge: existingChallenge };
  }

  const [challenge] = await db
    .insert(challenges)
    .values({
      coachId: coach.id,
      name: defaultChallengeName,
      slug: defaultChallengeSlug,
      priceAmount: defaultChallengeAmount,
      currency: defaultChallengeCurrency,
      entryCode: defaultChallengeEntryCode,
      status: "active",
    })
    .returning();

  return { coach, challenge };
}

export async function createPendingRegistration(contactInput: unknown) {
  const contact = normalizeContact(contactInput);
  const db = getDb();
  const { coach, challenge } = await ensureDefaultChallenge();

  const [customer] = await db
    .insert(customers)
    .values({
      name: contact.name.trim(),
      email: contact.email.trim().toLowerCase(),
      whatsapp: contact.whatsapp.trim(),
    })
    .returning();

  const operationId = randomUUID();
  const [registration] = await db
    .insert(registrations)
    .values({
      customerId: customer.id,
      coachId: coach.id,
      challengeId: challenge.id,
      status: "pending",
      paymentProvider: "ziina",
      operationId,
      amount: challenge.priceAmount,
      currency: challenge.currency,
    })
    .returning();

  return { customer, coach, challenge, registration };
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
  const db = getDb();
  const [registration] = await db
    .update(registrations)
    .set({
      paymentIntentId,
      rawPayment: rawPayment ?? null,
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId))
    .returning();

  return registration;
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

  const db = getDb();
  const whereClause = registrationId
    ? eq(registrations.id, registrationId)
    : eq(registrations.paymentIntentId, paymentIntentId as string);

  const [registration] = await db
    .update(registrations)
    .set({
      status: "paid",
      paymentIntentId: paymentIntentId ?? undefined,
      rawPayment: rawPayment ?? undefined,
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(whereClause)
    .returning();

  return registration;
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

  const db = getDb();
  const whereClause = registrationId
    ? eq(registrations.id, registrationId)
    : eq(registrations.paymentIntentId, paymentIntentId as string);

  const [registration] = await db
    .update(registrations)
    .set({
      status,
      paymentIntentId: paymentIntentId ?? undefined,
      rawPayment: rawPayment ?? undefined,
      updatedAt: new Date(),
    })
    .where(whereClause)
    .returning();

  return registration;
}

export async function listRegistrations(status?: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: registrations.id,
      status: registrations.status,
      amount: registrations.amount,
      currency: registrations.currency,
      paymentProvider: registrations.paymentProvider,
      paymentIntentId: registrations.paymentIntentId,
      operationId: registrations.operationId,
      paidAt: registrations.paidAt,
      createdAt: registrations.createdAt,
      customerName: customers.name,
      customerEmail: customers.email,
      customerWhatsapp: customers.whatsapp,
      coachName: coaches.name,
      coachSlug: coaches.slug,
      challengeName: challenges.name,
      challengeSlug: challenges.slug,
      challengeEntryCode: challenges.entryCode,
    })
    .from(registrations)
    .innerJoin(customers, eq(customers.id, registrations.customerId))
    .innerJoin(coaches, eq(coaches.id, registrations.coachId))
    .innerJoin(challenges, eq(challenges.id, registrations.challengeId))
    .where(status ? eq(registrations.status, status) : sql`true`)
    .orderBy(desc(registrations.createdAt));

  return rows.map(
    (row): RegistrationRecord => ({
      id: row.id,
      status: row.status,
      amount: row.amount,
      currency: row.currency,
      paymentProvider: row.paymentProvider,
      paymentIntentId: row.paymentIntentId,
      operationId: row.operationId,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      customer: {
        name: row.customerName,
        email: row.customerEmail,
        whatsapp: row.customerWhatsapp,
      },
      coach: {
        name: row.coachName,
        slug: row.coachSlug,
      },
      challenge: {
        name: row.challengeName,
        slug: row.challengeSlug,
        entryCode: row.challengeEntryCode,
      },
    }),
  );
}

export async function getAdminSummary() {
  const db = getDb();
  const [totals] = await db
    .select({
      totalRegistrations: count(registrations.id),
      totalRevenue: sum(registrations.amount),
    })
    .from(registrations)
    .where(eq(registrations.status, "paid"));

  const [pending] = await db
    .select({ totalPending: count(registrations.id) })
    .from(registrations)
    .where(eq(registrations.status, "pending"));

  const byChallenge = await db
    .select({
      coachName: coaches.name,
      challengeName: challenges.name,
      paidRegistrations: count(registrations.id),
      revenue: sum(registrations.amount),
    })
    .from(registrations)
    .innerJoin(coaches, eq(coaches.id, registrations.coachId))
    .innerJoin(challenges, eq(challenges.id, registrations.challengeId))
    .where(eq(registrations.status, "paid"))
    .groupBy(coaches.name, challenges.name)
    .orderBy(desc(count(registrations.id)));

  return {
    totalPaidRegistrations: Number(totals?.totalRegistrations ?? 0),
    totalRevenue: Number(totals?.totalRevenue ?? 0),
    totalPendingRegistrations: Number(pending?.totalPending ?? 0),
    byChallenge: byChallenge.map((row) => ({
      coachName: row.coachName,
      challengeName: row.challengeName,
      paidRegistrations: Number(row.paidRegistrations ?? 0),
      revenue: Number(row.revenue ?? 0),
    })),
  };
}
