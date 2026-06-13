import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  adminPasswordHeader,
  getMissingAdminPasswordMessage,
  isAdminPasswordValid,
} from "./adminAuth";
import {
  attachPaymentIntentToRegistration,
  canUseRegistrationsDatabase,
  createFreeRegistration,
  createPendingRegistration,
  getAdminSummary,
  getRegistrationForRefund,
  listRegistrations,
  markRegistrationPaid,
  recordRegistrationRefund,
  updateRegistrationStatus,
} from "./registrationStore";

const ziinaApiBaseUrl = "https://api-v2.ziina.com/api";

function shouldCreateTestPayment() {
  if (process.env.ZIINA_TEST_MODE) {
    return process.env.ZIINA_TEST_MODE === "true";
  }
  return process.env.NODE_ENV !== "production";
}

function getZiinaStatus(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const payload = input as Record<string, unknown>;
  const nested =
    payload.payment_intent ||
    payload.paymentIntent ||
    payload.data ||
    payload.object ||
    payload;
  if (!nested || typeof nested !== "object") return null;
  const paymentIntent = nested as Record<string, unknown>;

  return {
    id:
      typeof paymentIntent.id === "string"
        ? paymentIntent.id
        : typeof paymentIntent.payment_intent_id === "string"
          ? paymentIntent.payment_intent_id
          : null,
    status:
      typeof paymentIntent.status === "string"
        ? paymentIntent.status
        : typeof payload.status === "string"
          ? payload.status
          : null,
  };
}

function isPaidZiinaStatus(status: string | null) {
  return Boolean(status && ["completed", "paid", "succeeded", "success"].includes(status));
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  app.post("/api/ziina/payment-intent", async (req, res) => {
    const token = process.env.ZIINA_API_KEY;

    if (!token) {
      return res.status(500).json({
        message: "Ziina API key is not configured.",
      });
    }

    if (!canUseRegistrationsDatabase()) {
      return res.status(500).json({
        message: "Supabase database is not configured.",
      });
    }

    const registrationBundle = await createPendingRegistration(
      {
        ...(req.body?.contact ?? req.body ?? {}),
        coachSlug: req.body?.coachSlug || "coach-tarek",
        challengeSlug: req.body?.challengeSlug || "coach-tarek-challenge",
      },
      req.body?.packageId,
    );

    const origin = `${req.protocol}://${req.get("host")}`;
    const successUrl = `${origin}/registration-success?registration_id=${registrationBundle.registration.id}&payment_intent_id={PAYMENT_INTENT_ID}`;
    const cancelUrl = `${origin}/payment-cancelled?registration_id=${registrationBundle.registration.id}&payment_intent_id={PAYMENT_INTENT_ID}`;
    const failureUrl = `${origin}/payment-failed?registration_id=${registrationBundle.registration.id}&payment_intent_id={PAYMENT_INTENT_ID}`;

    const ziinaResponse = await fetch(`${ziinaApiBaseUrl}/payment_intent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: registrationBundle.registration.amount,
        currency_code: registrationBundle.registration.currency,
        message: `${registrationBundle.challenge.name} Registration`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        failure_url: failureUrl,
        allow_tips: false,
        test: shouldCreateTestPayment(),
        operation_id: registrationBundle.registration.operationId,
      }),
    });

    const data = await ziinaResponse.json().catch(() => null);

    if (!ziinaResponse.ok) {
      return res.status(ziinaResponse.status).json({
        message: "Could not create Ziina payment intent.",
        error: data?.latest_error?.message || data?.error || data?.message,
      });
    }

    await attachPaymentIntentToRegistration({
      registrationId: registrationBundle.registration.id,
      paymentIntentId: data.id,
      rawPayment: data,
    });

    return res.json({
      id: data.id,
      registrationId: registrationBundle.registration.id,
      status: data.status,
      amount: data.amount,
      currencyCode: data.currency_code,
      redirectUrl: data.redirect_url,
      embeddedUrl: data.embedded_url,
    });
  });

  app.post("/api/registrations/free", async (req, res) => {
    if (!canUseRegistrationsDatabase()) {
      return res.status(500).json({
        message: "Supabase database is not configured.",
      });
    }

    const registrationBundle = await createFreeRegistration({
      ...(req.body?.contact ?? req.body ?? {}),
      coachSlug: req.body?.coachSlug || "coach-tarek",
      challengeSlug: req.body?.challengeSlug || "coach-tarek-challenge",
    });

    return res.json({
      registrationId: registrationBundle.registration.id,
      status: registrationBundle.registration.status,
      amount: registrationBundle.registration.amount,
      currencyCode: registrationBundle.registration.currency,
    });
  });

  app.post("/api/registrations/complete", async (req, res) => {
    if (!canUseRegistrationsDatabase()) {
      return res.status(500).json({
        message: "Supabase database is not configured.",
      });
    }

    const body = z
      .object({
        registrationId: z.string().optional().nullable(),
        paymentIntentId: z.string().optional().nullable(),
      })
      .parse(req.body ?? {});

    if (!body.paymentIntentId || !process.env.ZIINA_API_KEY) {
      return res.status(400).json({
        message: "A Ziina payment intent is required for payment confirmation.",
      });
    }
    const ziinaResponse = await fetch(
      `${ziinaApiBaseUrl}/payment_intent/${encodeURIComponent(body.paymentIntentId)}`,
      { headers: { Authorization: `Bearer ${process.env.ZIINA_API_KEY}` } },
    );
    const payment = await ziinaResponse.json().catch(() => null);
    if (!ziinaResponse.ok || payment?.status !== "completed") {
      return res.status(409).json({
        message: "Payment has not been confirmed by Ziina.",
        status: payment?.status || null,
      });
    }
    const registration = await markRegistrationPaid({
      paymentIntentId: body.paymentIntentId,
      rawPayment: payment,
    });

    return res.json({ registration });
  });

  app.post("/api/ziina/webhook", async (req, res) => {
    if (!canUseRegistrationsDatabase()) {
      return res.status(500).json({
        message: "Supabase database is not configured.",
      });
    }

    const payment = getZiinaStatus(req.body);

    if (!payment?.id) {
      return res.status(202).json({ message: "Webhook received." });
    }

    const registration = isPaidZiinaStatus(payment.status)
      ? await markRegistrationPaid({
          paymentIntentId: payment.id,
          rawPayment: req.body,
        })
      : await updateRegistrationStatus({
          paymentIntentId: payment.id,
          status: payment.status || "payment_updated",
          rawPayment: req.body,
        });

    return res.json({ registration });
  });

  app.post("/api/admin/login", async (req, res) => {
    if (!process.env.ADMIN_PASSWORD) {
      return res.status(500).json({ message: getMissingAdminPasswordMessage() });
    }

    if (!isAdminPasswordValid(req.body?.password)) {
      return res.status(401).json({ message: "Invalid admin password." });
    }

    return res.json({ ok: true });
  });

  app.get("/api/admin/registrations", async (req, res) => {
    if (!isAdminPasswordValid(req.get(adminPasswordHeader))) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!canUseRegistrationsDatabase()) {
      return res.status(500).json({
        message: "Supabase database is not configured.",
      });
    }

    const status =
      typeof req.query.status === "string" && req.query.status !== "all"
        ? req.query.status
        : undefined;
    const registrations = await listRegistrations(status);
    return res.json({ registrations });
  });

  app.get("/api/admin/summary", async (_req, res) => {
    if (!isAdminPasswordValid(_req.get(adminPasswordHeader))) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!canUseRegistrationsDatabase()) {
      return res.status(500).json({
        message: "Supabase database is not configured.",
      });
    }

    const summary = await getAdminSummary();
    return res.json({ summary });
  });

  app.post("/api/admin/registration-status", async (req, res) => {
    if (!isAdminPasswordValid(req.get(adminPasswordHeader))) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const allowedStatuses = new Set(["pending", "paid", "cancelled", "failed"]);
    const registrationId = String(req.body?.registrationId || "");
    const status = String(req.body?.status || "");
    if (!registrationId || !allowedStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid registration status request." });
    }
    const registration = await updateRegistrationStatus({ registrationId, status });
    return res.json({ registration });
  });

  app.post("/api/admin/refund", async (req, res) => {
    if (!isAdminPasswordValid(req.get(adminPasswordHeader))) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (!process.env.ZIINA_API_KEY) {
      return res.status(500).json({ message: "Ziina API key is not configured." });
    }
    const registrationId = String(req.body?.registrationId || "");
    const registration = await getRegistrationForRefund(registrationId);
    if (!registration) return res.status(404).json({ message: "Registration not found." });
    if (registration.status !== "paid" || !registration.paymentIntentId) {
      return res.status(409).json({ message: "Only paid Ziina registrations can be refunded." });
    }
    if (registration.refundId) {
      return res.status(409).json({ message: "A refund already exists for this registration." });
    }
    const ziinaResponse = await fetch(`${ziinaApiBaseUrl}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: randomUUID(),
        payment_intent_id: registration.paymentIntentId,
        amount: registration.amount,
        currency_code: registration.currency,
        test: shouldCreateTestPayment(),
      }),
    });
    const refund = await ziinaResponse.json().catch(() => null);
    if (!ziinaResponse.ok) {
      return res.status(ziinaResponse.status).json({
        message: "Ziina could not create the refund.",
        error: refund?.error?.message || refund?.message || refund?.error,
      });
    }
    const updatedRegistration = await recordRegistrationRefund({ registrationId, refund });
    return res.json({ refund, registration: updatedRegistration });
  });

  return httpServer;
}
