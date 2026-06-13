import { createContext, useContext } from "react";
import {
  adminDomain,
  getCoachConfigByHostname,
  type CoachConfig,
} from "@shared/coaches";

const CoachContext = createContext<CoachConfig | null>(null);

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const coach = getCoachConfigByHostname(
    typeof window === "undefined" ? undefined : window.location.hostname,
  );
  return <CoachContext.Provider value={coach}>{children}</CoachContext.Provider>;
}

export function useCoach() {
  const coach = useContext(CoachContext);
  if (!coach) throw new Error("useCoach must be used within CoachProvider");
  return coach;
}

export function isAdminHostname() {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === adminDomain ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}
