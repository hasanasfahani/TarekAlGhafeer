type VercelLikeRequest = {
  method?: string;
};

type VercelLikeResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(body: unknown): void;
  };
};

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed." });
  }

  return res.status(200).json({
    ok: true,
    version: "2026-06-05-api-ready",
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasZiinaApiKey: Boolean(process.env.ZIINA_API_KEY),
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
    hasEmailFrom: Boolean(process.env.EMAIL_FROM),
  });
}
