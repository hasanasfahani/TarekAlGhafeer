import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  CreditCard,
  Dumbbell,
  Flame,
  Gauge,
  Instagram,
  Languages,
  Lock,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import AppStoreBadges from "@/components/AppStoreBadges";
import PaymentCheckoutDialog from "@/components/PaymentCheckoutDialog";
import PackagesTable from "@/components/PackagesTable";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { isPackageId, type PackageId } from "@/lib/packages";
import { getCoachConfigByHostname } from "@shared/coaches";
import { pushDataLayerEvent as pushTrackedEvent } from "@/lib/tracking";
import enterCodeScreenshot from "@assets/registration-success/enter-code.webp";
import registerTraineeScreenshot from "@assets/registration-success/register-trainee.webp";
import selectChallengeScreenshot from "@assets/registration-success/select-challenge.webp";
import transformation1 from "@assets/optimized/tarek-transformation-1.webp";
import transformation2 from "@assets/optimized/tarek-transformation-2.webp";
import transformation3 from "@assets/optimized/tarek-transformation-3.webp";
import challengeMainPreview from "@assets/registration-flow/challenge-main.jpg";
import challengeLeaderboardPreview from "@assets/registration-flow/challenge-leaderboard.jpg";
import traineeHomePreview from "@assets/registration-flow/trainee-home.jpg";
import workoutPerformanceGif from "@assets/registration-flow/workout-performance.gif";
import stepSixCelebration from "@assets/registration-flow/step-6-celebration.gif";
import stepNineUrgency from "@assets/registration-flow/step-9-urgency.gif";

type Step = {
  eyebrow: string;
  title: string;
  lines?: string[];
  proof?: string;
  cta: string;
  options?: string[];
  response?: string[];
  bullets?: string[];
  icon: React.ComponentType<{ className?: string }>;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const activeCoach = getCoachConfigByHostname(
  typeof window === "undefined" ? undefined : window.location.hostname,
);
const fixedPaymentValue = activeCoach.packages["premium-single"].price;
const fixedPaymentCurrency = "AED";

type DataLayerPayload = Record<string, string | number | boolean | null | undefined>;

function pushDataLayerEvent(payload: DataLayerPayload) {
  if (typeof window === "undefined") return;
  const { event, package_id: packageId, ...parameters } = payload;
  if (typeof event !== "string") return;
  const resolvedPackageId = isPackageId(packageId) ? packageId : "premium-single";
  pushTrackedEvent(event, resolvedPackageId, parameters);
}

function trackingBase() {
  return {};
}

function amountToValue(amount: unknown) {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : NaN;

  if (!Number.isFinite(numericAmount)) return fixedPaymentValue;
  return numericAmount > 1000 ? numericAmount / 100 : numericAmount;
}

const arabicSteps: Step[] = [
  {
    eyebrow: "البداية",
    title: "مو ناقصك حماس لتتمرن وتلتزم.\nناقصك نظام وجو يخلوك تكمل.",
    lines: [
      "ادخل تحدي كوتش طارق على فتنت",
      "وابدأ مع ناس عندها نفس هدفك.",
    ],
    cta: "خبرني أكثر",
    icon: Sparkles,
  },
  {
    eyebrow: "نسختك الجديدة",
    title: "مع بداية التحدي، أي نسخة منك بدك تبني؟",
    options: [
      "أخف وأنشط",
      "أقوى وواثق أكثر",
      "ملتزم ومسيطر على يومي",
      "راجع للنادي بدون ما أوقف بعد أسبوع",
    ],
    cta: "التالي",
    icon: Gauge,
  },
  {
    eyebrow: "العائق الحقيقي",
    title: "شو أكثر شي كان يخليك توقف؟",
    options: [
      "ببلّش وبوقف بسرعة",
      "ما عم شوف نتيجة",
      "بتمرن بدون خطة واضحة",
      "بملّ لما أتمرن لحالي",
      "ما عندي حدا يتابعني",
    ],
    cta: "تمام، كمل",
    icon: Lock,
  },
  {
    eyebrow: "واضح",
    title: "المشكلة مو إنك ما بدك.",
    lines: [
      "المشكلة إنك كنت تحاول بدون نظام يشدّك تكمل:",
      "خطة، متابعة، ومنافسة.",
    ],
    cta: "كيف التحدي يحلها؟",
    icon: Check,
  },
  {
    eyebrow: "أول يوم",
    title: "تخيّل أول يوم بالتحدي…",
    lines: [
      "تفتح Fitnet، تشوف خطتك جاهزة، تعرف شو تتمرن، وتسجل تمرينك.",
      "ومع كل مجهود… ترتيبك يبدأ يتحرك.",
    ],
    cta: "تمام",
    icon: Dumbbell,
  },
  {
    eyebrow: "نهاية الجولة",
    title: "وبنهاية التحدي…",
    lines: [
      "ما بتكون بس تمرّنت شهر.",
      "بتكون أثبتت لنفسك إنك قادر تلتزم، تتحرك، وترجع ثقتك بنفسك أكتر.",
    ],
    cta: "شو الخطة؟",
    icon: Trophy,
  },
  {
    eyebrow: "وعد لنفسك",
    title: "إذا دخلت التحدي، شو الوعد اللي بدك تعطيه لنفسك؟",
    options: [
      "ألتزم حتى لو مزاجي مو تمام",
      "أتمرن حسب الخطة",
      "ما أترك بعد أول أسبوع",
      "أرجع أثق بنفسي",
    ],
    response: [
      "تمام.",
      "خلينا نثبت هالوعد بخطة واضحة وتحدي يبدأ في 1 يوليو.",
    ],
    cta: "شو رح احصل بالتحدي؟",
    icon: Medal,
  },
  {
    eyebrow: "العرض",
    title: "تحدي كوتش طارق على Fitnet",
    lines: ["النظام اللي بيساعدك تكمل:"],
    bullets: [
      "خطة تمرين واضحة على التطبيق",
      "خطة أكل تساعدك تعرف شو تاكل",
      "متابعة من كوتش طارق",
      "منافسة مع المشاركين",
      "ترتيب حسب الالتزام والحرق",
      "فرصة للفوز بجوائز",
    ],
    cta: "أريد الاشتراك",
    icon: Users,
  },
  {
    eyebrow: "الجولة قربت",
    title: "التحدي يبدأ في 1 يوليو، والتسجيل يغلق قبل الانطلاق.",
    lines: [
      "بعد بداية التحدي، ما في دخول لنفس الجولة حتى تكون المنافسة عادلة لكل المشاركين.",
    ],
    cta: "ثبّت مكاني قبل الإغلاق",
    icon: Flame,
  },
  {
    eyebrow: "اختر باقتك",
    title: "اختر الباقة اللي تناسب هدفك.",
    cta: "اختر الباقة",
    icon: CreditCard,
  },
];

const englishSteps: Step[] = [
  {
    eyebrow: "Start",
    title: "You do not need more motivation.\nYou need a system that helps you stay consistent.",
    lines: [
      "Join Coach Tarek's challenge on Fitnet",
      "and start with people working toward the same goal.",
    ],
    cta: "Tell me more",
    icon: Sparkles,
  },
  {
    eyebrow: "Your next version",
    title: "What version of yourself do you want to build?",
    options: [
      "Lighter and more active",
      "Stronger and more confident",
      "Consistent and in control of my day",
      "Back in the gym without quitting after a week",
    ],
    cta: "Next",
    icon: Gauge,
  },
  {
    eyebrow: "The real obstacle",
    title: "What usually makes you stop?",
    options: [
      "I start and stop quickly",
      "I do not see results",
      "I train without a clear plan",
      "I get bored training alone",
      "I have no one following up with me",
    ],
    cta: "Continue",
    icon: Lock,
  },
  {
    eyebrow: "It is clear",
    title: "The problem is not that you do not want it.",
    lines: [
      "You have been trying without a system that keeps you moving:",
      "a plan, guidance, and competition.",
    ],
    cta: "How does the challenge help?",
    icon: Check,
  },
  {
    eyebrow: "Day one",
    title: "Imagine your first day in the challenge...",
    lines: [
      "You open Fitnet, find your plan ready, know exactly what to train, and log your workout.",
      "With every effort, your ranking starts to move.",
    ],
    cta: "Got it",
    icon: Dumbbell,
  },
  {
    eyebrow: "At the finish",
    title: "By the end of the challenge...",
    lines: [
      "You will not have only trained for a month.",
      "You will have proved that you can stay consistent, move forward, and rebuild your confidence.",
    ],
    cta: "What is the plan?",
    icon: Trophy,
  },
  {
    eyebrow: "A promise to yourself",
    title: "If you join, what promise will you make to yourself?",
    options: [
      "Stay consistent even when I am not in the mood",
      "Train according to the plan",
      "Do not quit after the first week",
      "Build my confidence again",
    ],
    response: [
      "Perfect.",
      "Let us support that promise with a clear plan and a challenge starting on July 1.",
    ],
    cta: "What will I get?",
    icon: Medal,
  },
  {
    eyebrow: "The challenge",
    title: "Coach Tarek's Challenge on Fitnet",
    lines: ["The system that helps you keep going:"],
    bullets: [
      "A clear workout plan in the app",
      "A nutrition plan that guides your meals",
      "Guidance from Coach Tarek",
      "Competition with participants",
      "Ranking based on consistency and calories burned",
      "A chance to win prizes",
    ],
    cta: "I want to join",
    icon: Users,
  },
  {
    eyebrow: "The round is close",
    title: "The challenge starts on July 1, and registration closes before launch.",
    lines: [
      "Once the challenge begins, entry closes for that round to keep the competition fair.",
    ],
    cta: "Reserve my place",
    icon: Flame,
  },
  {
    eyebrow: "Choose your package",
    title: "Pick the package that fits your goal.",
    cta: "Choose a package",
    icon: CreditCard,
  },
];

const paymentStepIndex = arabicSteps.length - 1;

const formStepNames = [
  "intro",
  "fitness_identity",
  "main_obstacle",
  "problem_context",
  "fitnet_plan_preview",
  "challenge_outcome",
  "commitment_promise",
  "offer_details",
  "registration_urgency",
  "payment_review",
];

function getInitialPaymentStatus() {
  if (typeof window === "undefined") return null;

  const path = window.location.pathname;
  if (path.endsWith("/registration-success")) return "success";
  if (path.endsWith("/payment-failed")) return "failed";
  if (path.endsWith("/payment-cancelled")) return "cancelled";
  if (path.endsWith("/success")) return "success";
  if (path.endsWith("/failed")) return "failed";
  if (path.endsWith("/cancelled")) return "cancelled";

  return new URLSearchParams(window.location.search).get("payment");
}

function getSavedStepIndex(paymentStatus: string | null) {
  if (paymentStatus === "cancelled" || paymentStatus === "failed") {
    return paymentStepIndex;
  }

  if (typeof window === "undefined") return 0;
  const saved = Number(window.localStorage.getItem("registration-form-step"));
  return Number.isFinite(saved) ? Math.min(Math.max(saved, 0), paymentStepIndex) : 0;
}

function CompactResultsProof({ isArabic }: { isArabic: boolean }) {
  const stats = [
    {
      icon: Trophy,
      value: "+10",
      label: isArabic ? "سنين خبرة" : "Years of experience",
    },
    {
      icon: Users,
      value: "+500",
      label: isArabic ? "متدرّب" : "Trainees",
    },
  ];
  const photos = [transformation1, transformation2, transformation3];

  return (
    <div className="mt-7 rounded-2xl border border-primary/20 bg-primary/10 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-primary">
          {isArabic ? "خبرة طويلة. نتائج حقيقية." : "Real experience. Real results."}
        </p>
        <a
          href={activeCoach.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2.5 py-1.5 text-xs font-extrabold text-white/75 transition hover:border-primary/40 hover:text-primary active:scale-95"
        >
          <Instagram className="h-3.5 w-3.5 text-primary" />
          <span dir="ltr">{activeCoach.instagramHandle}</span>
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-black/25 px-2 py-3 text-center"
          >
            <Icon className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xl font-black leading-none text-white" dir="ltr">
              {value}
            </p>
            <p className="mt-1 text-[11px] font-extrabold leading-relaxed text-white/55 sm:text-xs">
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {photos.map((photo, index) => (
          <img
            key={photo}
            src={photo}
            alt={isArabic ? `نتيجة تحول رقم ${index + 1}` : `Transformation result ${index + 1}`}
            className="h-28 w-24 shrink-0 rounded-xl border border-white/10 object-cover sm:h-32 sm:w-28"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}

function FitnetScreensPreview({ isArabic }: { isArabic: boolean }) {
  const screens = [
    {
      image: challengeMainPreview,
      title: isArabic ? "الساحة" : "Community",
      alt: isArabic ? "شاشة الساحة داخل تحدي Fitnet" : "Fitnet challenge community screen",
    },
    {
      image: challengeLeaderboardPreview,
      title: isArabic ? "الترتيب" : "Leaderboard",
      alt: isArabic ? "شاشة ترتيب المشاركين داخل تحدي Fitnet" : "Fitnet challenge leaderboard",
    },
    {
      image: traineeHomePreview,
      title: isArabic ? "تقدمك" : "Progress",
      alt: isArabic ? "شاشة متابعة تقدم المتدرب في Fitnet" : "Fitnet trainee progress screen",
    },
  ];

  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="mb-3 text-sm font-extrabold text-primary">
        {isArabic ? "هيك رح تشوف نظامك داخل Fitnet" : "This is how your system looks inside Fitnet"}
      </p>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {screens.map((screen, index) => (
          <div
            key={screen.title}
            className="w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/35 sm:w-32"
          >
            <img
              src={screen.image}
              alt={screen.alt}
              className="h-52 w-full object-cover object-top sm:h-56"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutScreensPreview({ isArabic }: { isArabic: boolean }) {
  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="mb-3 text-sm font-extrabold text-primary">
        {isArabic ? "تمرن بوضوح وتابع أداءك" : "Train with clarity and track your performance"}
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
        <img
          src={workoutPerformanceGif}
          alt={isArabic ? "تمرين واضح ومتابعة الأداء داخل تطبيق Fitnet" : "Workout and performance tracking in Fitnet"}
          className="mx-auto h-72 w-auto max-w-full object-contain sm:h-80"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function StepSixCelebration({ isArabic }: { isArabic: boolean }) {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-2 shadow-[0_0_28px_rgba(0,191,107,0.12)]">
      <img
        src={stepSixCelebration}
        alt={isArabic ? "احتفال بعد الالتزام بالتحدي" : "Celebrating challenge consistency"}
        className="mx-auto w-full max-w-sm rounded-xl"
        loading="lazy"
      />
    </div>
  );
}

function StepNineUrgency({ isArabic }: { isArabic: boolean }) {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-2 shadow-[0_0_28px_rgba(0,191,107,0.12)]">
      <img
        src={stepNineUrgency}
        alt={isArabic ? "الجولة تبدأ قريباً" : "The next challenge round starts soon"}
        className="mx-auto w-full max-w-md rounded-xl"
        loading="lazy"
      />
    </div>
  );
}

function PaymentSuccess() {
  const { isArabic } = useLanguage();
  const [isFree] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("free") === "1",
  );
  const [copied, setCopied] = useState(false);
  const [paymentSyncStatus, setPaymentSyncStatus] = useState<
    "idle" | "syncing" | "synced" | "failed"
  >("idle");
  const [paymentDetails, setPaymentDetails] = useState<{
    transactionId: string | null;
    value: number;
    currency: string;
    registrationId: string | null;
  } | null>(null);
  const challengeCode = "";
  const successCopy = isArabic
    ? {
        status: isFree ? "تم التسجيل بنجاح" : "تم الدفع بنجاح",
        title: `حياك في تحدي كوتش ${activeCoach.arabicFirstName} على Fitnet`,
        intro: "مكانك صار محجوز… الحين باقي بس تدخل التطبيق وتجهّز للتحدي اللي يبدأ في 1 يوليو.",
        warning: "تمت العملية، لكن احتجنا لحظة أطول لتحديث لوحة الإدارة.",
        reserved: "تم تثبيت مكانك",
        reassurance: "لا تشيل هم",
        reassuranceBody:
          "بنرسل لك نفس التفاصيل على الإيميل ورقم الواتساب اللي ضفتهم وقت التسجيل.",
        ready: "جاهز؟ خلّنا نبدأ التحدي!",
        joinCode: "كود الانضمام",
      }
    : {
        status: isFree ? "Registration successful" : "Payment successful",
        title: `Welcome to Coach ${activeCoach.firstName}'s Challenge on Fitnet`,
        intro: "Your place is reserved. Open the app and get ready for the challenge starting July 1.",
        warning: "The operation succeeded, but the admin dashboard is taking longer to update.",
        reserved: "Your place is reserved",
        reassurance: "You are all set",
        reassuranceBody:
          "We will send the same details to the email and WhatsApp number you entered.",
        ready: "Ready? Let’s start the challenge!",
        joinCode: "Join code",
      };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const registrationId = params.get("registration_id");
    const paymentIntentId = params.get("payment_intent_id");

    if (!registrationId && !paymentIntentId) {
      window.location.replace("/registration-form");
      return;
    }

    if (isFree && registrationId) {
      setPaymentDetails({
        transactionId: registrationId,
        value: 0,
        currency: fixedPaymentCurrency,
        registrationId,
      });
      setPaymentSyncStatus("synced");
      window.history.replaceState({}, "", "/registration-success");
      return;
    }

    let cancelled = false;
    setPaymentSyncStatus("syncing");

    fetch("/api/registrations/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId, paymentIntentId }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not sync payment.");
        const data = await response.json().catch(() => null);
        if (cancelled) return;

        const registration = data?.registration ?? {};
        if (registration.status !== "paid") {
          throw new Error("Payment has not been confirmed.");
        }
        const transactionId =
          registration.payment_intent_id ||
          registration.paymentIntentId ||
          paymentIntentId ||
          registration.operation_id ||
          registration.operationId ||
          registration.id ||
          registrationId;
        const value = amountToValue(registration.amount);
        const currency =
          typeof registration.currency === "string"
            ? registration.currency
            : fixedPaymentCurrency;
        const resolvedRegistrationId =
          typeof registration.id === "string" ? registration.id : registrationId;

        setPaymentDetails({
          transactionId,
          value,
          currency,
          registrationId: resolvedRegistrationId,
        });
        setPaymentSyncStatus("synced");

        if (transactionId) {
          pushDataLayerEvent({
            event: "payment_success",
            ...trackingBase(),
            package_id:
              registration.raw_payment?.packageId ||
              registration.rawPayment?.packageId ||
              "premium-single",
            transaction_id: transactionId,
            payment_method: "ziina",
            payment_path: "online",
            value,
            currency,
          });
        }
        window.history.replaceState({}, "", "/registration-success");
      })
      .catch(() => {
        if (!cancelled) setPaymentSyncStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [isFree]);

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText(challengeCode);
    } catch {
      // Some embedded browsers block clipboard writes; keep the CTA usable without crashing.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const instructionCards = [
    {
      number: isArabic ? "١" : "1",
      title: isArabic ? "حمّل تطبيق Fitnet" : "Download the Fitnet app",
      body: isArabic ? "نزّل التطبيق من المتجر المناسب لجهازك." : "Install the app from your device's app store.",
      type: "download",
    },
    {
      number: isArabic ? "٢" : "2",
      title: isArabic ? "سجّل كمتدرّب" : "Register as a trainee",
      body: isArabic ? "افتح التطبيق وسجّل حساب جديد كـ متدرّب." : "Open the app and create a new trainee account.",
      image: registerTraineeScreenshot,
      alt: "شاشة تسجيل المتدرب في تطبيق Fitnet",
    },
    {
      number: isArabic ? "٣" : "3",
      title: isArabic ? `ادخل تحدي كوتش ${activeCoach.arabicFirstName}` : `Join Coach ${activeCoach.firstName}'s challenge`,
      body: isArabic ? `من داخل التطبيق، اختر تحدي كوتش ${activeCoach.arabicFirstName}.` : `Select Coach ${activeCoach.firstName}'s challenge inside the app.`,
      image: selectChallengeScreenshot,
      alt: "شاشة اختيار تحدي كوتش طارق في تطبيق Fitnet",
    },
    {
      number: isArabic ? "٤" : "4",
      title: isArabic ? "أدخل كود التحدي" : "Enter the challenge code",
      body: isArabic ? "اكتب الكود التالي داخل نافذة الانضمام للتحدي." : "Use this code in the challenge join screen.",
      type: "code",
      image: enterCodeScreenshot,
      alt: "شاشة إدخال كود تحدي كوتش طارق في تطبيق Fitnet",
    },
  ];

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-black"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-secondary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,191,107,0.08),transparent_34rem)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3" dir="ltr">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-primary"
          >
            {activeCoach.name}
          </a>
          <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-extrabold text-primary">
            {successCopy.reserved}
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-primary/20 bg-card/75 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur md:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-black shadow-[0_0_34px_rgba(0,191,107,0.35)]">
              <Check className="h-9 w-9" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-primary">{successCopy.status}</p>
              <h1 className="mt-2 text-balance text-4xl font-extrabold leading-tight text-white md:text-5xl">
                {successCopy.title}
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-xl font-semibold leading-relaxed text-white/75">
            {successCopy.intro}
          </p>
          {paymentSyncStatus === "failed" ? (
            <p className="mt-4 rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-sm font-bold leading-relaxed text-yellow-100">
              {successCopy.warning}
            </p>
          ) : null}
          {paymentDetails ? (
            <div
              dir="ltr"
              className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-black/25 p-4 text-left sm:grid-cols-3"
            >
              <div>
                <p className="text-xs font-bold uppercase text-white/45">Amount</p>
                <p className="mt-1 text-lg font-black text-white">
                  {paymentDetails.value} {paymentDetails.currency}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase text-white/45">
                  Payment ID
                </p>
                <p className="mt-1 break-all text-sm font-bold text-white/80">
                  {paymentDetails.transactionId}
                </p>
              </div>
              {paymentDetails.registrationId ? (
                <div className="sm:col-span-3">
                  <p className="text-xs font-bold uppercase text-white/45">
                    Registration ID
                  </p>
                  <p className="mt-1 break-all text-sm font-bold text-white/80">
                    {paymentDetails.registrationId}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {instructionCards.filter((card) => card.type !== "code" || challengeCode).map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-2xl border border-white/10 bg-card/70 shadow-[0_22px_70px_rgba(0,0,0,0.22)]"
            >
              <div className="p-5">
                <div className={`flex items-center gap-3 ${isArabic ? "text-right" : "text-left"}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-black">
                    {card.number}
                  </div>
                  <h3 className="min-w-0 text-2xl font-extrabold leading-tight text-white">
                    {card.title}
                  </h3>
                </div>
                <p className="mt-2 text-base font-semibold leading-relaxed text-white/60">
                  {card.body}
                </p>
                {card.type === "download" && (
                  <AppStoreBadges className="mt-4 flex-wrap justify-start" />
                )}
                {card.type === "code" && (
                  <button
                    type="button"
                    onClick={copyCode}
                    className={`mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/35 bg-primary/10 p-4 shadow-[0_0_24px_rgba(0,191,107,0.12)] transition active:scale-[0.98] ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    <span>
                      <span className="block text-xs font-extrabold text-primary">{successCopy.joinCode}</span>
                      <span
                        dir="ltr"
                        className="mt-1 block text-3xl font-black tracking-[0.12em] text-white"
                      >
                        {challengeCode}
                      </span>
                    </span>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-black">
                      {copied ? <Check className="h-5 w-5" /> : <Clipboard className="h-5 w-5" />}
                    </span>
                  </button>
                )}
              </div>
              {card.image && (
                <div className="border-t border-white/10 bg-black/30 p-3">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="mx-auto w-full max-w-[280px] rounded-xl border border-white/10"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center md:p-7">
          <p className="text-2xl font-extrabold text-white">{successCopy.reassurance}</p>
          <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-relaxed text-white/65">
            {successCopy.reassuranceBody}
          </p>
          <p className="mt-5 text-xl font-extrabold text-primary">
            {successCopy.ready}
          </p>
          <AppStoreBadges className="mt-5 justify-center" />
        </section>
      </div>
    </main>
  );
}

function RegistrationFlow({ initialPaymentStatus }: { initialPaymentStatus: string | null }) {
  const { isArabic, toggleLanguage, t } = useLanguage();
  const steps = (isArabic ? arabicSteps : englishSteps).map((step) => {
    const replace = (value: string) =>
      value
        .replaceAll("Coach Tarek", `Coach ${activeCoach.firstName}`)
        .replaceAll("كوتش طارق", `كوتش ${activeCoach.arabicFirstName}`)
        .replaceAll("الكوتش طارق", `الكوتش ${activeCoach.arabicFirstName}`);
    return {
      ...step,
      eyebrow: replace(step.eyebrow),
      title: replace(step.title),
      lines: step.lines?.map(replace),
      proof: step.proof ? replace(step.proof) : undefined,
      cta: replace(step.cta),
      options: step.options?.map(replace),
      response: step.response?.map(replace),
      bullets: step.bullets?.map(replace),
    };
  });
  const [stepIndex, setStepIndex] = useState(() => getSavedStepIndex(initialPaymentStatus));
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<PackageId>(() => {
    if (typeof window === "undefined") return "free";
    const plan = new URLSearchParams(window.location.search).get("plan");
    return isPackageId(plan) ? plan : "free";
  });
  const [paymentError, setPaymentError] = useState<string | null>(() =>
    initialPaymentStatus === "failed"
      ? isArabic
        ? "ما تمت عملية الدفع. جرّب مرة ثانية وثبّت مكانك قبل اكتمال العدد."
        : "Payment was not completed. Please try again to reserve your place."
      : null,
  );
  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const selected = answers[stepIndex] ?? [];
  const canContinue = !step.options || selected.length > 0;
  const StepIcon = step.icon;
  const formStartTrackedRef = useRef(false);
  const completedStepsRef = useRef(new Set<number>());

  const trackFormStart = () => {
    if (formStartTrackedRef.current) return;
    formStartTrackedRef.current = true;

    const trackingKey = `registration_form_start_tracked_${activeCoach.id}`;
    if (window.sessionStorage.getItem(trackingKey)) return;

    pushDataLayerEvent({
      event: "registration_form_start",
      ...trackingBase(),
    });
    window.sessionStorage.setItem(trackingKey, "true");
  };

  const trackStepComplete = (completedStepIndex: number) => {
    if (completedStepsRef.current.has(completedStepIndex)) return;
    completedStepsRef.current.add(completedStepIndex);

    pushDataLayerEvent({
      event: "registration_form_step_complete",
      ...trackingBase(),
      form_step: completedStepIndex + 1,
      form_step_name: formStepNames[completedStepIndex],
    });
  };

  useEffect(() => {
    pushDataLayerEvent({
      event: "registration_form_view",
      ...trackingBase(),
      page_type: "registration_form",
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("registration-form-step", String(stepIndex));
  }, [stepIndex]);

  useEffect(() => {
    if (initialPaymentStatus === "cancelled" || initialPaymentStatus === "failed") {
      pushDataLayerEvent({
        event: "payment_failed",
        ...trackingBase(),
        package_id: selectedPackageId,
        payment_method: "ziina",
        payment_path: "online",
        failure_reason: initialPaymentStatus,
      });
      window.history.replaceState({}, "", "/registration-form");
    }
  }, [initialPaymentStatus]);

  const goNext = async () => {
    if (!canContinue) return;
    trackFormStart();
    trackStepComplete(stepIndex);
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const toggleAnswer = (option: string) => {
    trackFormStart();
    setAnswers((current) => {
      const currentOptions = current[stepIndex] ?? [];
      const nextOptions = currentOptions.includes(option)
        ? currentOptions.filter((item) => item !== option)
        : [...currentOptions, option];

      return { ...current, [stepIndex]: nextOptions };
    });
  };

  const selectPackage = (packageId: PackageId) => {
    trackFormStart();
    setSelectedPackageId(packageId);
    setPaymentError(null);
    setIsContactDialogOpen(true);
  };

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-black"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-16 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-secondary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,191,107,0.08),transparent_34rem)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3" dir="ltr">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-primary"
          >
            {activeCoach.name}
          </a>
          <Button
            type="button"
            variant="outline"
            onClick={toggleLanguage}
            className="h-10 gap-2 border-white/15 bg-black/30 px-3 text-white hover:bg-white/10 hover:text-white"
          >
            <Languages className="h-4 w-4" />
            {t.toggleLabel}
          </Button>
        </header>

        <div className="mt-6 grid gap-6 lg:items-center">
          <section className="rounded-2xl border border-white/10 bg-card/70 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur md:p-8">
            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between gap-4 text-xs font-bold text-white/60">
                <span>
                  {isArabic ? "الخطوة" : "Step"} {stepIndex + 1} {isArabic ? "من" : "of"} {steps.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-primary shadow-[0_0_18px_rgba(0,191,107,0.65)]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 130, damping: 22 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.22 }}
                className="min-h-[520px]"
              >
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10">
                    <StepIcon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{step.eyebrow}</p>
                    <p className="mt-1 text-xs font-semibold text-white/45">
                      {isArabic
                        ? `تحدي كوتش ${activeCoach.arabicFirstName} على Fitnet`
                        : `Coach ${activeCoach.firstName} Challenge on Fitnet`}
                    </p>
                  </div>
                </div>

                <h1 className="max-w-3xl whitespace-pre-line text-balance text-4xl font-extrabold leading-tight text-white md:text-5xl">
                  {step.title}
                </h1>

                {step.lines ? (
                  <div className="mt-6 max-w-2xl space-y-3 text-xl font-medium leading-relaxed text-white/75">
                    {step.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : null}

                {stepIndex === 3 ? <FitnetScreensPreview isArabic={isArabic} /> : null}
                {stepIndex === 4 ? <WorkoutScreensPreview isArabic={isArabic} /> : null}
                {stepIndex === 5 ? <StepSixCelebration isArabic={isArabic} /> : null}
                {stepIndex === 8 ? <StepNineUrgency isArabic={isArabic} /> : null}
                {stepIndex === paymentStepIndex ? (
                  <div className="mt-8">
                    <PackagesTable
                      isArabic={isArabic}
                      onSelect={selectPackage}
                      compact
                    />
                  </div>
                ) : null}

                {step.options ? (
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {step.options.map((option) => {
                      const isSelected = selected.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleAnswer(option)}
                          className={`group flex min-h-16 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-base font-bold leading-relaxed transition ${
                            isArabic ? "text-right" : "text-left"
                          } ${
                            isSelected
                              ? "border-primary bg-primary/15 text-white shadow-[0_0_26px_rgba(0,191,107,0.16)]"
                              : "border-white/10 bg-white/[0.03] text-white/75 hover:border-primary/40 hover:bg-primary/10 hover:text-white"
                          }`}
                        >
                          <span>{option}</span>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-primary bg-primary text-black"
                                : "border-white/20 text-transparent group-hover:border-primary"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {selected.length > 0 && step.response ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-xl border border-primary/20 bg-primary/10 p-4 text-lg font-bold leading-relaxed text-white"
                  >
                    {step.response.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </motion.div>
                ) : null}

                {step.bullets ? (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {step.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base font-bold text-white/80"
                      >
                        <Check className="h-5 w-5 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {step.proof ? (
                  <div className="mt-7 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-extrabold leading-relaxed text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(0,191,107,0.9)]" />
                    <span>{step.proof}</span>
                  </div>
                ) : null}

                {stepIndex === 0 ? <CompactResultsProof isArabic={isArabic} /> : null}

                {paymentError ? (
                  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-base font-bold leading-relaxed text-red-100">
                    {paymentError}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className={`mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${
              stepIndex === paymentStepIndex ? "sm:justify-start" : "sm:justify-between"
            }`}>
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="h-12 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                {isArabic ? "رجوع" : "Back"}
              </Button>

              {stepIndex !== paymentStepIndex ? (
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue}
                  className="h-14 bg-primary px-8 text-lg font-extrabold text-primary-foreground shadow-[0_0_28px_rgba(0,191,107,0.28)] hover:bg-primary/90 disabled:opacity-45"
                >
                  {step.cta}
                  {isArabic ? (
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  ) : (
                    <ArrowRight className="ml-2 h-5 w-5" />
                  )}
                </Button>
              </div>
              ) : null}
            </div>
          </section>

        </div>
        <PaymentCheckoutDialog
          open={isContactDialogOpen}
          onOpenChange={setIsContactDialogOpen}
          source="registration_form"
          packageId={selectedPackageId}
          isArabic={isArabic}
          onError={setPaymentError}
          onInteraction={trackFormStart}
        />
      </div>
    </main>
  );
}

export default function RegistrationForm() {
  const paymentStatus = getInitialPaymentStatus();

  if (paymentStatus === "success") {
    return <PaymentSuccess />;
  }

  return <RegistrationFlow initialPaymentStatus={paymentStatus} />;
}
