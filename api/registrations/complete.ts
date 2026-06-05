import { z } from "zod";
import {
  canUseRegistrationsDatabase,
  markRegistrationPaid,
  sendConfirmationEmailForRegistration,
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

    const registration = await markRegistrationPaid({
      registrationId: body.registrationId,
      paymentIntentId: body.paymentIntentId,
    });
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
