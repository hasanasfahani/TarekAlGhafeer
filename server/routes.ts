import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";

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

    const origin = `${req.protocol}://${req.get("host")}`;
    const successUrl = `${origin}/registration-form/success`;
    const cancelUrl = `${origin}/registration-form/cancelled`;
    const failureUrl = `${origin}/registration-form/failed`;

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

    return res.json({
      id: data.id,
      status: data.status,
      amount: data.amount,
      currencyCode: data.currency_code,
      redirectUrl: data.redirect_url,
      embeddedUrl: data.embedded_url,
    });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  return httpServer;
}
