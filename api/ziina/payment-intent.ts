import { randomUUID } from "crypto";

const ziinaApiBaseUrl = "https://api-v2.ziina.com/api";
const challengeAmount = 14900;
const challengeCurrency = "AED";
const challengeMessage = "Coach Tarek Challenge Registration";

function shouldCreateTestPayment() {
  if (process.env.ZIINA_TEST_MODE) {
    return process.env.ZIINA_TEST_MODE === "true";
  }
  return process.env.NODE_ENV !== "production";
}

type VercelLikeRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
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

  const origin = getOrigin(req);
  const successUrl = `${origin}/registration-form/success`;
  const cancelUrl = `${origin}/registration-form/cancelled`;
  const failureUrl = `${origin}/registration-form/failed`;

  try {
    const ziinaResponse = await fetch(`${ziinaApiBaseUrl}/payment_intent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: challengeAmount,
        currency_code: challengeCurrency,
        message: challengeMessage,
        success_url: successUrl,
        cancel_url: cancelUrl,
        failure_url: failureUrl,
        allow_tips: false,
        test: shouldCreateTestPayment(),
        operation_id: randomUUID(),
      }),
    });

    const data = await ziinaResponse.json().catch(() => null);

    if (!ziinaResponse.ok) {
      return res.status(ziinaResponse.status).json({
        message: "Could not create Ziina payment intent.",
        error: data?.latest_error?.message || data?.error || data?.message,
      });
    }

    return res.status(200).json({
      id: data.id,
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
