import type { CoachConfig, PackageId } from "@shared/coaches";
export type { PackageId } from "@shared/coaches";

export type ChallengePackage = {
  id: PackageId;
  price: number;
  originalPrice?: number;
  currency: "AED";
  whatsappMessage?: string;
};

export function getChallengePackages(coach: CoachConfig): Record<PackageId, ChallengePackage> {
  return {
    free: { id: "free", price: 0, currency: "AED" },
    "premium-single": {
      id: "premium-single",
      price: coach.packages["premium-single"].price,
      originalPrice: coach.packages["premium-single"].originalPrice,
      currency: "AED",
      whatsappMessage: `مرحبا! بدي اشترك بتحدي الكوتش ${coach.arabicFirstName} الباقة البريميوم الفردية`,
    },
    "premium-duo": {
      id: "premium-duo",
      price: coach.packages["premium-duo"].price,
      originalPrice: coach.packages["premium-duo"].originalPrice,
      currency: "AED",
      whatsappMessage: `مرحبا! بدي اشترك بتحدي الكوتش ${coach.arabicFirstName} الباقة البريميوم الثنائية`,
    },
  };
}

export function isPackageId(value: unknown): value is PackageId {
  return (
    value === "free" ||
    value === "premium-single" ||
    value === "premium-duo"
  );
}

export function getSyriaWhatsappUrl(coach: CoachConfig, packageId: PackageId) {
  const message = getChallengePackages(coach)[packageId].whatsappMessage;
  return message
    ? `https://wa.me/9647513855361?text=${encodeURIComponent(message)}`
    : null;
}
