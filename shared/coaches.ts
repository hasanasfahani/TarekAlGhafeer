export type PackageId = "free" | "premium-single" | "premium-duo";

export type CoachConfig = {
  id: string;
  name: string;
  firstName: string;
  arabicFirstName: string;
  domain: string;
  coachSlug: string;
  challengeId: string;
  challengeSlug: string;
  challengeName: string;
  challengeStartDate: string;
  instagramUrl: string;
  instagramHandle: string;
  packages: Record<PackageId, {
    id: PackageId;
    trackingId: string;
    name: string;
    price: number;
    originalPrice?: number;
    currency: "AED";
  }>;
  seo: {
    title: string;
    description: string;
    titleAr: string;
    descriptionAr: string;
  };
};

const packageConfig = (
  singlePrice: number,
  duoPrice: number,
  singleOriginalPrice: number,
  duoOriginalPrice: number,
) => ({
  free: {
    id: "free" as const,
    trackingId: "free_challenge",
    name: "Free Challenge",
    price: 0,
    currency: "AED" as const,
  },
  "premium-single": {
    id: "premium-single" as const,
    trackingId: `one_month_challenge_${singlePrice}_aed`,
    name: "1-Month Fitnet Challenge",
    price: singlePrice,
    originalPrice: singleOriginalPrice,
    currency: "AED" as const,
  },
  "premium-duo": {
    id: "premium-duo" as const,
    trackingId: `one_month_duo_challenge_${duoPrice}_aed`,
    name: "1-Month Fitnet Duo Challenge",
    price: duoPrice,
    originalPrice: duoOriginalPrice,
    currency: "AED" as const,
  },
});

export const coachConfigs = {
  "abdulrahman-katlan": {
    id: "abdulrahman_katlan",
    name: "Abdulrahman Katlan",
    firstName: "Abdulrahman",
    arabicFirstName: "عبد الرحمن",
    domain: "abdulrahman-katlan.fitnetapp.com",
    coachSlug: "abdulrahman-katlan",
    challengeId: "abdulrahman_katlan_challenge",
    challengeSlug: "abdulrahman-katlan-challenge",
    challengeName: "Coach Abdulrahman Challenge",
    challengeStartDate: "2026-07-01",
    instagramUrl: "https://www.instagram.com/abdulrahman.katlan/",
    instagramHandle: "@abdulrahman.katlan",
    packages: packageConfig(149, 249, 1500, 2500),
    seo: {
      title: "Coach Abdulrahman Katlan Fitness Challenge | Fitnet",
      description: "Join Coach Abdulrahman Katlan's Fitnet challenge for guided workouts, nutrition support, progress tracking, and a motivating fitness community.",
      titleAr: "تحدي كوتش عبد الرحمن قتلان للياقة | Fitnet",
      descriptionAr: "انضم إلى تحدي كوتش عبد الرحمن قتلان على Fitnet مع خطة تمارين وتغذية، متابعة مستمرة، ومجتمع يساعدك على تحقيق هدفك.",
    },
  },
  "loay-hamdan": {
    id: "loay_hamdan",
    name: "Loay Hamdan",
    firstName: "Loay",
    arabicFirstName: "لؤي",
    domain: "loay-hamdan.fitnetapp.com",
    coachSlug: "loay-hamdan",
    challengeId: "loay_hamdan_challenge",
    challengeSlug: "loay-hamdan-challenge",
    challengeName: "Coach Loay Challenge",
    challengeStartDate: "2026-07-01",
    instagramUrl: "https://www.instagram.com/_loay_hamdan/",
    instagramHandle: "@_loay_hamdan",
    packages: packageConfig(149, 249, 1500, 2500),
    seo: {
      title: "Coach Loay Hamdan Fitness Challenge | Fitnet",
      description: "Transform your fitness with Coach Loay Hamdan on Fitnet through structured workouts, nutrition guidance, progress tracking, and community support.",
      titleAr: "تحدي كوتش لؤي حمدان للياقة | Fitnet",
      descriptionAr: "ابدأ رحلتك مع تحدي كوتش لؤي حمدان على Fitnet واستفد من التمارين المنظمة، خطة التغذية، متابعة التقدم، ودعم المجتمع.",
    },
  },
  "tarek-alghafeer": {
    id: "tarek_alghafeer",
    name: "Tarek Alghafeer",
    firstName: "Tarek",
    arabicFirstName: "طارق",
    domain: "tarek-alghafeer.fitnetapp.com",
    coachSlug: "coach-tarek",
    challengeId: "tarek_alghafeer_challenge",
    challengeSlug: "coach-tarek-challenge",
    challengeName: "Coach Tarek Challenge",
    challengeStartDate: "2026-07-01",
    instagramUrl: "https://www.instagram.com/tarekalghafeer/",
    instagramHandle: "@tarekalghafeer",
    packages: packageConfig(149, 249, 1500, 2500),
    seo: {
      title: "Coach Tarek Alghafeer Fitness Challenge | Fitnet",
      description: "Join Coach Tarek Alghafeer's Fitnet fitness challenge with guided workouts, nutrition planning, progress tracking, and community motivation.",
      titleAr: "تحدي كوتش طارق الغفير للياقة | Fitnet",
      descriptionAr: "انضم إلى تحدي كوتش طارق الغفير على Fitnet مع خطة تمارين وتغذية، متابعة للتقدم، ومجتمع يحفزك للوصول إلى هدفك.",
    },
  },
  "karam-alhemesh": {
    id: "karam_alhemesh",
    name: "Karam Alhemesh",
    firstName: "Karam",
    arabicFirstName: "كرم",
    domain: "karam-alhemesh.fitnetapp.com",
    coachSlug: "karam-alhemesh",
    challengeId: "karam_alhemesh_challenge",
    challengeSlug: "karam-alhemesh-challenge",
    challengeName: "Coach Karam Challenge",
    challengeStartDate: "2026-07-01",
    instagramUrl: "https://www.instagram.com/coach.karamalhemesh/",
    instagramHandle: "@coach.karamalhemesh",
    packages: packageConfig(199, 349, 2000, 3500),
    seo: {
      title: "Coach Karam Alhemesh Fitness Challenge | Fitnet",
      description: "Join Coach Karam Alhemesh on Fitnet for a focused one-month fitness challenge with workout guidance, nutrition support, and progress tracking.",
      titleAr: "تحدي كوتش كرم الحمش للياقة | Fitnet",
      descriptionAr: "انضم إلى تحدي كوتش كرم الحمش على Fitnet لمدة شهر مع توجيه للتمارين والتغذية، متابعة للتقدم، ودعم يساعدك على الاستمرار.",
    },
  },
} satisfies Record<string, CoachConfig>;

export const defaultCoachConfig = coachConfigs["tarek-alghafeer"];
export const allCoachConfigs = Object.values(coachConfigs);
export const adminDomain = "admin.fitnetapp.com";
export const gtmContainerId = "GTM-WQXMLSVH";

export function getCoachConfigByHostname(hostname?: string | null): CoachConfig {
  const normalized = String(hostname || "").toLowerCase().split(":")[0];
  return (
    allCoachConfigs.find((coach) => coach.domain === normalized) ||
    allCoachConfigs.find((coach) => normalized.startsWith(coach.domain.split(".")[0])) ||
    defaultCoachConfig
  );
}

export function getCoachConfigBySlug(slug?: string | null): CoachConfig {
  return (
    allCoachConfigs.find(
      (coach) =>
        coach.coachSlug === slug ||
        coach.id === slug ||
        coach.domain.split(".")[0] === slug,
    ) || defaultCoachConfig
  );
}

export function getPackageConfig(coach: CoachConfig, packageId: unknown) {
  return packageId === "premium-duo"
    ? coach.packages["premium-duo"]
    : packageId === "free"
      ? coach.packages.free
      : coach.packages["premium-single"];
}
