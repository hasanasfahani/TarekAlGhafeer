import {
  getMissingAdminPasswordMessage,
  isAdminPasswordValid,
} from "../../server/adminAuth";

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

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ message: getMissingAdminPasswordMessage() });
  }

  if (!isAdminPasswordValid(req.body?.password)) {
    return res.status(401).json({ message: "Invalid admin password." });
  }

  return res.status(200).json({ ok: true });
}
