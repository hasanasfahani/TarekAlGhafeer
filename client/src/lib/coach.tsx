import { createContext, useContext } from "react";
import {
  adminDomain,
  getCoachConfigByHostname,
  getCoachConfigBySlug,
  type CoachConfig,
} from "@shared/coaches";

const CoachContext = createContext<CoachConfig | null>(null);

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function getLocalCoachOverride() {
  if (typeof window === "undefined" || !isLocalHostname(window.location.hostname)) {
    return null;
  }
  return new URLSearchParams(window.location.search).get("coach");
}

export function getActiveCoachConfig() {
  const localCoachOverride = getLocalCoachOverride();
  return localCoachOverride
    ? getCoachConfigBySlug(localCoachOverride)
    : getCoachConfigByHostname(
        typeof window === "undefined" ? undefined : window.location.hostname,
      );
}

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const coach = getActiveCoachConfig();
  return <CoachContext.Provider value={coach}>{children}</CoachContext.Provider>;
}

export function useCoach() {
  const coach = useContext(CoachContext);
  if (!coach) throw new Error("useCoach must be used within CoachProvider");
  return coach;
}

export function isAdminHostname() {
  if (typeof window === "undefined") return false;
  if (getLocalCoachOverride()) return false;
  return (
    window.location.hostname === adminDomain ||
    isLocalHostname(window.location.hostname)
  );
}
