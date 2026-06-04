import { z } from "zod";
import {
  canUseRegistrationsDatabase,
  markRegistrationPaid,
} from "../_lib/registrations";

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

  return res.status(200).json({ registration });
}
