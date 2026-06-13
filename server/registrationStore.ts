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
import {
  getCoachConfigBySlug,
  getPackageConfig,
  type PackageId,
} from "@shared/coaches";

export const defaultCoachSlug = "coach-tarek";
export const defaultChallengeSlug = "coach-tarek-challenge";
export const defaultChallengeAmount = 14900;
export const defaultChallengeCurrency = "AED";
export const defaultChallengeName = "Coach Tarek Challenge";
export const defaultChallengeEntryCode = "336699";
function getPaidPackageId(input: unknown): Exclude<PackageId, "free"> {
  return input === "premium-duo" ? "premium-duo" : "premium-single";
}

function mergeProviderPayment(existing: unknown, provider: unknown) {
  const metadata =
    existing && typeof existing === "object"
      ? existing as Record<string, unknown>
      : {};
  return provider === undefined ? metadata : { ...metadata, provider };
}

export type RegistrationRecord = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  paymentIntentId: string | null;
  operationId: string;
  refundId: string | null;
  refundStatus: string | null;
  refundedAt: Date | null;
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

export async function ensureChallenge(coachSlug?: string | null) {
  const db = getDb();
  const config = getCoachConfigBySlug(coachSlug);

  const [existingCoach] = await db
    .select()
    .from(coaches)
    .where(eq(coaches.slug, config.coachSlug))
    .limit(1);

  const [coach] =
    existingCoach
      ? [existingCoach]
      : await db
          .insert(coaches)
          .values({
            name: config.name,
            slug: config.coachSlug,
            status: "active",
          })
          .returning();

  const [existingChallenge] = await db
    .select()
    .from(challenges)
    .where(
      and(
        eq(challenges.coachId, coach.id),
        eq(challenges.slug, config.challengeSlug),
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
      name: config.challengeName,
      slug: config.challengeSlug,
      priceAmount: config.packages["premium-single"].price * 100,
      currency: config.packages["premium-single"].currency,
      entryCode: null,
      status: "active",
    })
    .returning();

  return { coach, challenge };
}

export async function createPendingRegistration(
  contactInput: unknown,
  packageInput?: unknown,
) {
  const contact = normalizeContact(contactInput);
  const db = getDb();
  const config = getCoachConfigBySlug(contact.coachSlug);
  const { coach, challenge } = await ensureChallenge(config.coachSlug);
  const packageId = getPaidPackageId(packageInput);
  const selectedPackage = getPackageConfig(config, packageId);

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
      amount: selectedPackage.price * 100,
      currency: challenge.currency,
      rawPayment: {
        packageId,
        packageTrackingId: selectedPackage.trackingId,
        packageName: selectedPackage.name,
      },
    })
    .returning();

  return { customer, coach, challenge, registration };
}

export async function createFreeRegistration(contactInput: unknown) {
  const contact = normalizeContact(contactInput);
  const db = getDb();
  const config = getCoachConfigBySlug(contact.coachSlug);
  const { coach, challenge } = await ensureChallenge(config.coachSlug);

  const [customer] = await db
    .insert(customers)
    .values({
      name: contact.name.trim(),
      email: contact.email.trim().toLowerCase(),
      whatsapp: contact.whatsapp.trim(),
    })
    .returning();

  const [registration] = await db
    .insert(registrations)
    .values({
      customerId: customer.id,
      coachId: coach.id,
      challengeId: challenge.id,
      status: "paid",
      paymentProvider: "free",
      operationId: randomUUID(),
      amount: 0,
      currency: challenge.currency,
      rawPayment: {
        packageId: "free",
        packageTrackingId: config.packages.free.trackingId,
        packageName: config.packages.free.name,
      },
      paidAt: new Date(),
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
  const [existing] = await db
    .select({ rawPayment: registrations.rawPayment })
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);
  const [registration] = await db
    .update(registrations)
    .set({
      paymentIntentId,
      rawPayment: mergeProviderPayment(existing?.rawPayment, rawPayment),
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
  const [existing] = await db
    .select({ rawPayment: registrations.rawPayment })
    .from(registrations)
    .where(whereClause)
    .limit(1);

  const [registration] = await db
    .update(registrations)
    .set({
      status: "paid",
      paymentIntentId: paymentIntentId ?? undefined,
      rawPayment: mergeProviderPayment(existing?.rawPayment, rawPayment),
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
  const [existing] = await db
    .select({ rawPayment: registrations.rawPayment })
    .from(registrations)
    .where(whereClause)
    .limit(1);

  const [registration] = await db
    .update(registrations)
    .set({
      status,
      paymentIntentId: paymentIntentId ?? undefined,
      rawPayment: mergeProviderPayment(existing?.rawPayment, rawPayment),
      updatedAt: new Date(),
    })
    .where(whereClause)
    .returning();

  return registration;
}

export async function getRegistrationForRefund(registrationId: string) {
  const db = getDb();
  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);
  return registration;
}

export async function recordRegistrationRefund({
  registrationId,
  refund,
}: {
  registrationId: string;
  refund: Record<string, any>;
}) {
  const db = getDb();
  const completed = refund.status === "completed";
  const [registration] = await db
    .update(registrations)
    .set({
      status: completed ? "refunded" : "refund_pending",
      refundId: refund.id,
      refundStatus: refund.status,
      refundedAt: completed ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId))
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
      refundId: registrations.refundId,
      refundStatus: registrations.refundStatus,
      refundedAt: registrations.refundedAt,
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
      refundId: row.refundId,
      refundStatus: row.refundStatus,
      refundedAt: row.refundedAt,
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
