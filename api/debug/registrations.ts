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

  try {
    const registrations = await import("../_lib/registrations.js");
    return res.status(200).json({
      ok: true,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      exports: Object.keys(registrations),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
