export type PackageId = "free" | "premium-single" | "premium-duo";

export type ChallengePackage = {
  id: PackageId;
  price: number;
  currency: "AED";
  whatsappMessage?: string;
};

export const challengePackages: Record<PackageId, ChallengePackage> = {
  free: {
    id: "free",
    price: 0,
    currency: "AED",
  },
  "premium-single": {
    id: "premium-single",
    price: 149,
    currency: "AED",
    whatsappMessage:
      "مرحبا! بدي اشترك بتحدي الكوتش طارق الباقة البريميوم الفردية",
  },
  "premium-duo": {
    id: "premium-duo",
    price: 249,
    currency: "AED",
    whatsappMessage:
      "مرحبا! بدي اشترك بتحدي الكوتش طارق الباقة البريميوم الثنائية",
  },
};

export function isPackageId(value: unknown): value is PackageId {
  return (
    value === "free" ||
    value === "premium-single" ||
    value === "premium-duo"
  );
}

export function getSyriaWhatsappUrl(packageId: PackageId) {
  const message = challengePackages[packageId].whatsappMessage;
  return message
    ? `https://wa.me/9647513855361?text=${encodeURIComponent(message)}`
    : null;
}
