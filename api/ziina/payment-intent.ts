import { randomUUID } from "crypto";
import {
  attachPaymentIntentToRegistration,
  canUseRegistrationsDatabase,
  createPendingRegistration,
} from "../_lib/registrations.js";
import {
  getCoachConfigByHostname,
  getCoachConfigBySlug,
} from "../../shared/coaches.js";

const ziinaApiBaseUrl = "https://api-v2.ziina.com/api";

function shouldCreateTestPayment() {
  if (process.env.ZIINA_TEST_MODE) {
    return process.env.ZIINA_TEST_MODE === "true";
  }
  return process.env.NODE_ENV !== "production";
}

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

    const requestHost = String(req.headers.host || "").split(":")[0];
    const coachConfig = requestHost.endsWith(".fitnetapp.com")
      ? getCoachConfigByHostname(requestHost)
      : getCoachConfigBySlug(req.body?.coachSlug);
    const registrationBundle = await createPendingRegistration(
      {
        ...(req.body?.contact ?? req.body ?? {}),
        coachSlug: coachConfig.coachSlug,
        challengeSlug: coachConfig.challengeSlug,
      },
      req.body?.packageId,
    );

    const origin = getOrigin(req);
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
        operation_id: registrationBundle.registration.operationId || randomUUID(),
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

    return res.status(200).json({
      id: data.id,
      registrationId: registrationBundle.registration.id,
      status: data.status,
      amount: data.amount,
      currencyCode: data.currency_code,
      redirectUrl: data.redirect_url,
      embeddedUrl: data.embedded_url,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not create Ziina payment intent.",
      error: error instanceof Error ? error.message : undefined,
    });
  }
}
