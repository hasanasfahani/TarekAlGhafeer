import {
  adminPasswordHeader,
  getHeader,
  isAdminPasswordValid,
} from "../_lib/admin.js";
import { updateRegistrationStatus } from "../_lib/registrations.js";

const allowedStatuses = new Set(["pending", "paid", "cancelled", "failed"]);

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
    const registrationId = String(req.body?.registrationId || "");
    const status = String(req.body?.status || "");
    if (!registrationId || !allowedStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid registration status request." });
    }
    const registration = await updateRegistrationStatus({ registrationId, status });
    if (!registration) return res.status(404).json({ message: "Registration not found." });
    return res.status(200).json({ registration });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update registration status.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
