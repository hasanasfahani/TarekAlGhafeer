import { Check, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getChallengePackages,
  getSyriaWhatsappUrl,
  type PackageId,
} from "@/lib/packages";
import { useCoach } from "@/lib/coach";
import { pushDataLayerEvent } from "@/lib/tracking";

type PackagesTableProps = {
  isArabic: boolean;
  onSelect: (packageId: PackageId) => void;
  compact?: boolean;
};

const copy = {
  ar: {
    eyebrow: "اختر الباقة اللي تناسبك",
    title: "باقات تحدي الكوتش طارق",
    subtitle: "",
    feature: "المزايا",
    packages: {
      free: { name: "الباقة المجانية", price: "مجاناً", badge: "" },
      "premium-single": {
        name: "بريميوم فردية",
        price: "١٤٩ درهم",
        badge: "الأكثر طلباً",
      },
      "premium-duo": {
        name: "بريميوم ثنائية",
        price: "٢٤٩ درهم",
        badge: "لك ولشريكك",
      },
    },
    features: [
      { label: "دخول التحدي", values: ["yes", "yes", "yes"] },
      { label: "المنافسة على الجوائز", values: ["yes", "yes", "yes"] },
      { label: "متابعة وتوجيه الكوتش طارق", values: ["yes", "yes", "yes"] },
      {
        label: "خطة التمارين",
        values: ["خطة أساسية", "خطة مخصصة", "خطة مخصصة"],
      },
      { label: "خطة تغذية مخصصة", values: ["no", "yes", "yes"] },
      { label: "الانضمام لفريق الكوتش طارق", values: ["no", "yes", "yes"] },
      { label: "دعم بأولوية", values: ["no", "yes", "yes"] },
    ],
    freeCta: "انضم مجاناً",
    payCta: "المتابعة للدفع",
    syriaCta: "الدفع من داخل سوريا",
  },
  en: {
    eyebrow: "Choose the package that suits you",
    title: "Coach Tarek Challenge Packages",
    subtitle: "",
    feature: "Features",
    packages: {
      free: { name: "Free Package", price: "Free", badge: "" },
      "premium-single": {
        name: "Premium Single",
        price: "AED 149",
        badge: "Most popular",
      },
      "premium-duo": {
        name: "Premium Duo",
        price: "AED 249",
        badge: "For you and a partner",
      },
    },
    features: [
      { label: "Access the challenge", values: ["yes", "yes", "yes"] },
      { label: "Compete for prizes", values: ["yes", "yes", "yes"] },
      { label: "Coach Tarek guidance", values: ["yes", "yes", "yes"] },
      {
        label: "Workout plan",
        values: ["Basic plan", "Custom plan", "Custom plan"],
      },
      { label: "Custom nutrition plan", values: ["no", "yes", "yes"] },
      { label: "Join Coach Tarek's team", values: ["no", "yes", "yes"] },
      { label: "Priority support", values: ["no", "yes", "yes"] },
    ],
    freeCta: "Join for FREE",
    payCta: "Continue to payment",
    syriaCta: "Pay from inside Syria",
  },
} as const;

const packageOrder: PackageId[] = ["free", "premium-single", "premium-duo"];
const mobilePackageOrder: PackageId[] = ["premium-single", "premium-duo", "free"];

function FeatureValue({
  value,
  mobile = false,
}: {
  value: string;
  mobile?: boolean;
}) {
  if (value === "yes") {
    return (
      <Check
        className={`${mobile ? "" : "mx-auto"} h-5 w-5 shrink-0 text-primary`}
        aria-label="Included"
      />
    );
  }
  if (value === "no") {
    return (
      <Minus
        className={`${mobile ? "" : "mx-auto"} h-5 w-5 shrink-0 text-white/25`}
        aria-label="Not included"
      />
    );
  }
  return <span className="text-xs font-extrabold text-white/80 sm:text-sm">{value}</span>;
}

function PackagePrice({
  packageInfo,
  fallback,
  isArabic,
  compact = false,
}: {
  packageInfo: ReturnType<typeof getChallengePackages>[PackageId];
  fallback: string;
  isArabic: boolean;
  compact?: boolean;
}) {
  if (packageInfo.price === 0) {
    return <span>{fallback}</span>;
  }

  return (
    <span className="flex flex-col items-start">
      {packageInfo.originalPrice ? (
        <span
          className={`font-bold text-white/45 line-through decoration-2 ${
            compact ? "text-sm" : "text-xs"
          }`}
        >
          {isArabic
            ? `${packageInfo.originalPrice} درهم`
            : `AED ${packageInfo.originalPrice}`}
        </span>
      ) : null}
      <span>
        {isArabic ? `${packageInfo.price} درهم` : `AED ${packageInfo.price}`}
      </span>
    </span>
  );
}

export default function PackagesTable({
  isArabic,
  onSelect,
  compact = false,
}: PackagesTableProps) {
  const coach = useCoach();
  const challengePackages = getChallengePackages(coach);
  const t = isArabic ? copy.ar : copy.en;
  const localizedTitle = isArabic
    ? `باقات تحدي الكوتش ${coach.arabicFirstName}`
    : `Coach ${coach.firstName} Challenge Packages`;
  const localizedFeatures = t.features.map((feature) => ({
    ...feature,
    label: feature.label
      .replaceAll("Tarek", coach.firstName)
      .replaceAll("طارق", coach.arabicFirstName),
  }));

  return (
    <div dir={isArabic ? "rtl" : "ltr"}>
      {!compact ? (
        <div className="mb-10 text-center">
          <p className="text-sm font-extrabold text-primary">{t.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-extrabold text-white md:text-5xl">
            {localizedTitle}
          </h2>
          {t.subtitle ? (
            <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-relaxed text-white/60">
              {t.subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:hidden">
        {mobilePackageOrder.map((packageId) => {
          const packageIndex = packageOrder.indexOf(packageId);
          const item = t.packages[packageId];
          const packageInfo = challengePackages[packageId];
          const whatsappUrl = getSyriaWhatsappUrl(coach, packageId);
          const isFeatured = packageId === "premium-single";
          const trackSyriaPayment = () => {
            pushDataLayerEvent("payment_started", packageId, {
              cta_location: "pricing_section",
              page_type: compact ? "registration_form" : "home_page",
              payment_method: "whatsapp_manual",
              payment_path: "syria",
            });
          };

          return (
            <article
              key={packageId}
              className={`relative overflow-hidden rounded-3xl border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] ${
                isFeatured
                  ? "border-primary/55 bg-primary/[0.09]"
                  : "border-white/10 bg-card/80"
              }`}
            >
              {isFeatured ? (
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
              ) : null}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-extrabold text-white">{item.name}</p>
                  <p className="mt-2 text-3xl font-black text-primary">
                    <PackagePrice
                      packageInfo={packageInfo}
                      fallback={item.price}
                      isArabic={isArabic}
                      compact
                    />
                  </p>
                </div>
                {item.badge ? (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black ${
                      isFeatured
                        ? "bg-primary text-black"
                        : "border border-white/10 bg-white/[0.06] text-white/70"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <div className="my-5 h-px bg-white/10" />

              <ul className="grid gap-3">
                {localizedFeatures.map((feature) => {
                  const value = feature.values[packageIndex];
                  const isUnavailable = value === "no";
                  return (
                    <li
                      key={`${packageId}-${feature.label}`}
                      className={`flex items-center justify-between gap-4 text-sm font-bold ${
                        isUnavailable ? "text-white/35" : "text-white/80"
                      }`}
                    >
                      <span>{feature.label}</span>
                      <span className="flex shrink-0 items-center gap-2 text-end">
                        <FeatureValue value={value} mobile />
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 grid gap-2">
                <Button
                  type="button"
                  onClick={() => onSelect(packageId)}
                  className="min-h-13 whitespace-normal rounded-xl bg-primary px-4 text-base font-extrabold text-black hover:bg-primary/90"
                >
                  {packageInfo.price === 0 ? t.freeCta : t.payCta}
                </Button>
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={trackSyriaPayment}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center text-sm font-extrabold text-white transition hover:border-primary/40 hover:bg-primary/10"
                  >
                    {t.syriaCta}
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-card/75 shadow-[0_24px_80px_rgba(0,0,0,0.28)] md:block">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <thead>
            <tr>
              <th className="w-[28%] border-b border-white/10 bg-black/25 p-4 text-start text-sm font-extrabold text-white/55">
                {t.feature}
              </th>
              {packageOrder.map((packageId) => {
                const item = t.packages[packageId];
                return (
                  <th
                    key={packageId}
                    className={`border-b border-white/10 p-4 text-center ${
                      packageId === "premium-single" ? "bg-primary/10" : "bg-black/10"
                    }`}
                  >
                    {item.badge ? (
                      <span className="mb-2 inline-flex rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-black">
                        {item.badge}
                      </span>
                    ) : null}
                    <p className="text-base font-extrabold text-white">{item.name}</p>
                    <div className="mt-1 flex justify-center text-xl font-black text-primary">
                      <PackagePrice
                        packageInfo={challengePackages[packageId]}
                        fallback={item.price}
                        isArabic={isArabic}
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {localizedFeatures.map((feature) => (
              <tr key={feature.label} className="border-b border-white/[0.07] last:border-0">
                <th className="bg-black/15 p-4 text-start text-sm font-bold text-white/75">
                  {feature.label}
                </th>
                {feature.values.map((value, index) => (
                  <td
                    key={`${feature.label}-${packageOrder[index]}`}
                    className={`p-4 text-center ${
                      packageOrder[index] === "premium-single" ? "bg-primary/[0.045]" : ""
                    }`}
                  >
                    <FeatureValue value={value} />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="bg-black/15 p-4" />
              {packageOrder.map((packageId) => {
                const packageInfo = challengePackages[packageId];
                const whatsappUrl = getSyriaWhatsappUrl(coach, packageId);
                const trackSyriaPayment = () => {
                  pushDataLayerEvent("payment_started", packageId, {
                    cta_location: "pricing_section",
                    page_type: compact ? "registration_form" : "home_page",
                    payment_method: "whatsapp_manual",
                    payment_path: "syria",
                  });
                };
                return (
                  <td
                    key={packageId}
                    className={`p-3 align-top ${
                      packageId === "premium-single" ? "bg-primary/[0.045]" : ""
                    }`}
                  >
                    <div className="grid gap-2">
                      <Button
                        type="button"
                        onClick={() => onSelect(packageId)}
                        className="min-h-12 whitespace-normal bg-primary px-3 text-sm font-extrabold text-black hover:bg-primary/90"
                      >
                        {packageInfo.price === 0 ? t.freeCta : t.payCta}
                      </Button>
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={trackSyriaPayment}
                          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-center text-xs font-extrabold text-white transition hover:border-primary/40 hover:bg-primary/10"
                        >
                          {t.syriaCta}
                        </a>
                      ) : null}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
