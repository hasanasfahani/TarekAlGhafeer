import {
  canUseRegistrationsDatabase,
  markRegistrationPaid,
  sendConfirmationEmailForRegistration,
  updateRegistrationStatus,
} from "../_lib/registrations.js";

type VercelLikeRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
};

type VercelLikeResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(body: unknown): void;
  };
};

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

function getOrigin(req: VercelLikeRequest) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const host = req.headers.host;
  return `${proto || "https"}://${host}`;
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ message: "Method not allowed." });
    }

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
    const email =
      registration?.status === "paid"
        ? await sendConfirmationEmailForRegistration({
            registrationId: registration.id,
            origin: getOrigin(req),
          }).catch((error) => ({
            sent: false,
            error: error instanceof Error ? error.message : "Unknown email error",
          }))
        : { skipped: true, reason: "registration_not_paid" };

    return res.status(200).json({ registration, email });
  } catch (error) {
    return res.status(500).json({
      message: "Could not process Ziina webhook.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
