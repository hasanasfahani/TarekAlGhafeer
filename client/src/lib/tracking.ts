import type { PackageId } from "@shared/coaches";
import { getPackageConfig } from "@shared/coaches";
import { getActiveCoachConfig } from "@/lib/coach";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function getTrackingConfig(packageId: PackageId = "premium-single") {
  const coach = getActiveCoachConfig();
  const selectedPackage = getPackageConfig(coach, packageId);
  return {
    coach_id: coach.id,
    coach_name: coach.name,
    domain: coach.domain,
    challenge_id: coach.challengeId,
    challenge_name: coach.challengeName,
    package_id: selectedPackage.trackingId,
    package_name: selectedPackage.name,
    value: selectedPackage.price,
    currency: selectedPackage.currency,
    items: [
      {
        item_id: selectedPackage.trackingId,
        item_name: selectedPackage.name,
        item_brand: coach.name,
        price: selectedPackage.price,
        quantity: 1,
      },
    ],
  };
}

export function pushDataLayerEvent(
  event: string,
  packageId: PackageId = "premium-single",
  parameters: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;
  const transactionId = parameters.transaction_id;
  if (event === "payment_success" && typeof transactionId === "string") {
    const dedupeKey = `payment_success_tracked_${transactionId}`;
    if (window.localStorage.getItem(dedupeKey)) return;
    window.localStorage.setItem(dedupeKey, "true");
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...getTrackingConfig(packageId),
    ...parameters,
  });
}
