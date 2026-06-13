import { randomUUID } from "crypto";
import {
  adminPasswordHeader,
  getHeader,
  isAdminPasswordValid,
} from "../_lib/admin.js";
import {
  getRegistrationForRefund,
  recordRegistrationRefund,
} from "../_lib/registrations.js";

const ziinaApiBaseUrl = "https://api-v2.ziina.com/api";

type Request = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
};

type Response = {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
};

export default async function handler(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ message: "Method not allowed." });
    }
    if (!isAdminPasswordValid(getHeader(req.headers, adminPasswordHeader))) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (!process.env.ZIINA_API_KEY) {
      return res.status(500).json({ message: "Ziina API key is not configured." });
    }

    const registrationId = String(req.body?.registrationId || "");
    const registration = await getRegistrationForRefund(registrationId);
    if (!registration) return res.status(404).json({ message: "Registration not found." });
    if (!["paid", "refund_pending"].includes(registration.status)) {
      return res.status(409).json({ message: "Only paid registrations can be refunded." });
    }
    if (!registration.payment_intent_id) {
      return res.status(409).json({ message: "Registration has no Ziina payment intent." });
    }
    if (registration.refund_id) {
      const refundResponse = await fetch(
        `${ziinaApiBaseUrl}/refund/${encodeURIComponent(registration.refund_id)}`,
        { headers: { Authorization: `Bearer ${process.env.ZIINA_API_KEY}` } },
      );
      const refund = await refundResponse.json().catch(() => null);
      if (!refundResponse.ok) {
        return res.status(refundResponse.status).json({
          message: "Could not refresh the Ziina refund.",
          error: refund?.error?.message || refund?.message || refund?.error,
        });
      }
      const updatedRegistration = await recordRegistrationRefund({
        registrationId,
        refund,
      });
      return res.status(200).json({ refund, registration: updatedRegistration });
    }

    const ziinaResponse = await fetch(`${ziinaApiBaseUrl}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: randomUUID(),
        payment_intent_id: registration.payment_intent_id,
        amount: registration.amount,
        currency_code: registration.currency,
        test: process.env.ZIINA_TEST_MODE
          ? process.env.ZIINA_TEST_MODE === "true"
          : process.env.NODE_ENV !== "production",
      }),
    });
    const refund = await ziinaResponse.json().catch(() => null);
    if (!ziinaResponse.ok) {
      return res.status(ziinaResponse.status).json({
        message: "Ziina could not create the refund.",
        error: refund?.error?.message || refund?.message || refund?.error,
      });
    }

    const updatedRegistration = await recordRegistrationRefund({
      registrationId,
      refund,
    });
    return res.status(200).json({ refund, registration: updatedRegistration });
  } catch (error) {
    return res.status(500).json({
      message: "Could not refund registration.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
