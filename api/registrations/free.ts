import {
  canUseRegistrationsDatabase,
  createFreeRegistration,
  sendConfirmationEmailForRegistration,
} from "../_lib/registrations.js";
import {
  getCoachConfigByHostname,
  getCoachConfigBySlug,
} from "../../shared/coaches.js";

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
  return `${proto || "https"}://${req.headers.host}`;
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

    const requestHost = String(req.headers.host || "").split(":")[0];
    const coachConfig = requestHost.endsWith(".fitnetapp.com")
      ? getCoachConfigByHostname(requestHost)
      : getCoachConfigBySlug(req.body?.coachSlug);
    const registrationBundle = await createFreeRegistration({
      ...(req.body?.contact ?? req.body ?? {}),
      coachSlug: coachConfig.coachSlug,
      challengeSlug: coachConfig.challengeSlug,
    });

    const email = await sendConfirmationEmailForRegistration({
      registrationId: registrationBundle.registration.id,
      origin: getOrigin(req),
    }).catch((error) => ({
      sent: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    }));

    return res.status(200).json({
      registrationId: registrationBundle.registration.id,
      status: registrationBundle.registration.status,
      amount: registrationBundle.registration.amount,
      currencyCode: registrationBundle.registration.currency,
      email,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not create free registration.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
