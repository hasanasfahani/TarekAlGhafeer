import { z } from "zod";
import {
  canUseRegistrationsDatabase,
  markRegistrationPaid,
  sendConfirmationEmailForRegistration,
} from "../_lib/registrations.js";

const ziinaApiBaseUrl = "https://api-v2.ziina.com/api";
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

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found.",
      });
    }

    const email = await sendConfirmationEmailForRegistration({
      registrationId: registration?.id,
      origin: getOrigin(req),
    }).catch((error) => ({
      sent: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    }));

    return res.status(200).json({ registration, email });
  } catch (error) {
    return res.status(500).json({
      message: "Could not complete registration.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
