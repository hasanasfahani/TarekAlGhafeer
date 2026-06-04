import {
  adminPasswordHeader,
  getHeader,
  isAdminPasswordValid,
} from "../_lib/admin.js";
import {
  canUseRegistrationsDatabase,
  listRegistrations,
} from "../_lib/registrations.js";

type VercelLikeRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

type VercelLikeResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(body: unknown): void;
  };
};

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ message: "Method not allowed." });
    }

    if (!isAdminPasswordValid(getHeader(req.headers, adminPasswordHeader))) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!canUseRegistrationsDatabase()) {
      return res.status(500).json({
        message: "Supabase database is not configured.",
      });
    }

    const statusQuery = req.query?.status;
    const status = Array.isArray(statusQuery) ? statusQuery[0] : statusQuery;
    const registrations = await listRegistrations(status && status !== "all" ? status : undefined);
    return res.status(200).json({ registrations });
  } catch (error) {
    return res.status(500).json({
      message: "Could not load registrations.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
