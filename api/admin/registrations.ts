import {
  adminPasswordHeader,
  isAdminPasswordValid,
} from "../../server/adminAuth";
import {
  canUseRegistrationsDatabase,
  listRegistrations,
} from "../../server/registrationStore";

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

function getHeader(req: VercelLikeRequest, name: string) {
  const value = req.headers[name] || req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed." });
  }

  if (!isAdminPasswordValid(getHeader(req, adminPasswordHeader))) {
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
}
