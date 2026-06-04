import {
  canUseRegistrationsDatabase,
  markRegistrationPaid,
  updateRegistrationStatus,
} from "../../server/registrationStore";

type VercelLikeRequest = {
  method?: string;
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

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
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

  return res.status(200).json({ registration });
}
