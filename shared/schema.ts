import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const coaches = pgTable("coaches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  email: text("email"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const challenges = pgTable(
  "challenges",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    coachId: varchar("coach_id")
      .notNull()
      .references(() => coaches.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    priceAmount: integer("price_amount").notNull(),
    currency: text("currency").notNull().default("AED"),
    entryCode: text("entry_code"),
    startDate: timestamp("start_date", { withTimezone: true }),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    coachSlugUnique: uniqueIndex("challenges_coach_slug_unique").on(
      table.coachId,
      table.slug,
    ),
  }),
);

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  coachId: varchar("coach_id")
    .notNull()
    .references(() => coaches.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  paymentProvider: text("payment_provider").notNull().default("ziina"),
  paymentIntentId: text("payment_intent_id"),
  operationId: text("operation_id").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  source: text("source").notNull().default("coach-registration-form"),
  rawPayment: jsonb("raw_payment"),
  refundId: text("refund_id"),
  refundStatus: text("refund_status"),
  refundedAt: timestamp("refunded_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  confirmationEmailSentAt: timestamp("confirmation_email_sent_at", { withTimezone: true }),
  confirmationEmailStatus: text("confirmation_email_status"),
  confirmationEmailError: text("confirmation_email_error"),
  confirmationEmailMessageId: text("confirmation_email_message_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  email: true,
  whatsapp: true,
});

export const registrationContactSchema = insertCustomerSchema.extend({
  coachSlug: z.string().min(1).default("coach-tarek"),
  challengeSlug: z.string().min(1).default("coach-tarek-challenge"),
});

export type Coach = typeof coaches.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type RegistrationContact = z.infer<typeof registrationContactSchema>;
