import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Clipboard,
  CreditCard,
  Dumbbell,
  Flame,
  Gauge,
  Instagram,
  Lock,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import AppStoreBadges from "@/components/AppStoreBadges";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import stepTenValue from "@assets/registration-flow/step-10-value.gif";

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

const steps: Step[] = [
  {
    eyebrow: "البداية",
    title: "مو ناقصك حماس لتتمرن وتلتزم.\nناقصك نظام وجو يخلوك تكمل.",
    lines: [
      "ادخل تحدي كوتش طارق على فتنت",
      "وابدأ مع ناس عندها نفس هدفك.",
    ],
    cta: "خليني أشوف إذا بيناسبني",
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
      "خلينا نثبت هالوعد بخطة واضحة وتحدي يبدأ بمنتصف الشهر.",
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
    title: "التحدي يبدأ بمنتصف الشهر، والتسجيل يغلق قبل الانطلاق.",
    lines: [
      "بعد بداية التحدي، ما في دخول لنفس الجولة حتى تكون المنافسة عادلة لكل المشاركين.",
    ],
    cta: "ثبّت مكاني قبل الإغلاق",
    icon: Flame,
  },
  {
    eyebrow: "قيمة الدخول",
    title: "١٤٩ درهم فقط للدخول في تحدي كامل.",
    lines: [
      "السعر مو مقابل جدول تمرين فقط.",
      "السعر مقابل نظام يساعدك ترجع تلتزم وتكون فخور بنفسك أكتر.",
      "يشمل: خطة، متابعة، منافسة، وفرصة للفوز بجوائز.",
    ],
    cta: "الاستمرار للدفع",
    icon: CreditCard,
  },
];

const paymentStepIndex = steps.length - 1;

function getInitialPaymentStatus() {
  if (typeof window === "undefined") return null;

  const path = window.location.pathname;
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

function CompactResultsProof() {
  const stats = [
    {
      icon: Trophy,
      value: "+10",
      label: "سنين خبرة",
    },
    {
      icon: Users,
      value: "+500",
      label: "متدرّب",
    },
  ];
  const photos = [transformation1, transformation2, transformation3];

  return (
    <div className="mt-7 rounded-2xl border border-primary/20 bg-primary/10 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-primary">
          خبرة طويلة. نتائج حقيقية.
        </p>
        <a
          href="https://www.instagram.com/tarekalghafeer/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2.5 py-1.5 text-xs font-extrabold text-white/75 transition hover:border-primary/40 hover:text-primary active:scale-95"
        >
          <Instagram className="h-3.5 w-3.5 text-primary" />
          <span dir="ltr">@tarekalghafeer</span>
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
            alt={`نتيجة تحول رقم ${index + 1}`}
            className="h-28 w-24 shrink-0 rounded-xl border border-white/10 object-cover sm:h-32 sm:w-28"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}

function FitnetScreensPreview() {
  const screens = [
    {
      image: challengeMainPreview,
      title: "الساحة",
      alt: "شاشة الساحة داخل تحدي Fitnet",
    },
    {
      image: challengeLeaderboardPreview,
      title: "الترتيب",
      alt: "شاشة ترتيب المشاركين داخل تحدي Fitnet",
    },
    {
      image: traineeHomePreview,
      title: "تقدمك",
      alt: "شاشة متابعة تقدم المتدرب في Fitnet",
    },
  ];

  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="mb-3 text-sm font-extrabold text-primary">
        هيك رح تشوف نظامك داخل Fitnet
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

function WorkoutScreensPreview() {
  return (
    <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="mb-3 text-sm font-extrabold text-primary">
        تمرن بوضوح وتابع أداءك
      </p>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
        <img
          src={workoutPerformanceGif}
          alt="تمرين واضح ومتابعة الأداء داخل تطبيق Fitnet"
          className="mx-auto h-72 w-auto max-w-full object-contain sm:h-80"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function StepSixCelebration() {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-2 shadow-[0_0_28px_rgba(0,191,107,0.12)]">
      <img
        src={stepSixCelebration}
        alt="احتفال بعد الالتزام بالتحدي"
        className="mx-auto w-full max-w-sm rounded-xl"
        loading="lazy"
      />
    </div>
  );
}

function StepNineUrgency() {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-2 shadow-[0_0_28px_rgba(0,191,107,0.12)]">
      <img
        src={stepNineUrgency}
        alt="الجولة تبدأ قريباً"
        className="mx-auto w-full max-w-md rounded-xl"
        loading="lazy"
      />
    </div>
  );
}

function StepTenValue() {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-2 shadow-[0_0_28px_rgba(0,191,107,0.12)]">
      <img
        src={stepTenValue}
        alt="قيمة الاشتراك في التحدي"
        className="mx-auto w-full max-w-xs rounded-xl"
        loading="lazy"
      />
    </div>
  );
}

function PaymentSuccess() {
  const [copied, setCopied] = useState(false);
  const [paymentSyncStatus, setPaymentSyncStatus] = useState<
    "idle" | "syncing" | "synced" | "failed"
  >("idle");
  const challengeCode = "336699";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const registrationId = params.get("registration_id");
    const paymentIntentId = params.get("payment_intent_id");

    if (!registrationId && !paymentIntentId) return;

    let cancelled = false;
    setPaymentSyncStatus("syncing");

    fetch("/api/registrations/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId, paymentIntentId }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Could not sync payment.");
        if (!cancelled) setPaymentSyncStatus("synced");
      })
      .catch(() => {
        if (!cancelled) setPaymentSyncStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      number: "١",
      title: "حمّل تطبيق Fitnet",
      body: "نزّل التطبيق من المتجر المناسب لجهازك.",
      type: "download",
    },
    {
      number: "٢",
      title: "سجّل كمتدرّب",
      body: "افتح التطبيق وسجّل حساب جديد كـ متدرّب.",
      image: registerTraineeScreenshot,
      alt: "شاشة تسجيل المتدرب في تطبيق Fitnet",
    },
    {
      number: "٣",
      title: "ادخل تحدي كوتش طارق",
      body: "من داخل التطبيق، اختر تحدي كوتش طارق.",
      image: selectChallengeScreenshot,
      alt: "شاشة اختيار تحدي كوتش طارق في تطبيق Fitnet",
    },
    {
      number: "٤",
      title: "أدخل كود التحدي",
      body: "اكتب الكود التالي داخل نافذة الانضمام للتحدي.",
      type: "code",
      image: enterCodeScreenshot,
      alt: "شاشة إدخال كود تحدي كوتش طارق في تطبيق Fitnet",
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-black"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-secondary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,191,107,0.08),transparent_34rem)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3" dir="ltr">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-white/80">
            Tarek AlGhafeer
          </span>
          <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-extrabold text-primary">
            تم تثبيت مكانك
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-primary/20 bg-card/75 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur md:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-black shadow-[0_0_34px_rgba(0,191,107,0.35)]">
              <Check className="h-9 w-9" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-primary">تم الدفع بنجاح</p>
              <h1 className="mt-2 text-balance text-4xl font-extrabold leading-tight text-white md:text-5xl">
                حياك في تحدي كوتش طارق على Fitnet 🔥
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-xl font-semibold leading-relaxed text-white/75">
            مكانك صار محجوز… الحين باقي بس تدخل التطبيق وتجهّز للتحدي.
          </p>
          {paymentSyncStatus === "failed" ? (
            <p className="mt-4 rounded-xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-sm font-bold leading-relaxed text-yellow-100">
              تم الدفع بنجاح، لكن احتجنا لحظة أطول لتحديث لوحة الإدارة. لو استمر
              التنبيه، راح نثبّت الدفع من مزود الدفع.
            </p>
          ) : null}
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {instructionCards.map((card) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-2xl border border-white/10 bg-card/70 shadow-[0_22px_70px_rgba(0,0,0,0.22)]"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 text-right">
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
                    className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-primary/35 bg-primary/10 p-4 text-right shadow-[0_0_24px_rgba(0,191,107,0.12)] transition active:scale-[0.98]"
                  >
                    <span>
                      <span className="block text-xs font-extrabold text-primary">كود الانضمام</span>
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
          <p className="text-2xl font-extrabold text-white">لا تشيل هم 👌</p>
          <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-relaxed text-white/65">
            بنرسل لك نفس التفاصيل على الإيميل ورقم الواتساب اللي ضفتهم وقت الدفع.
          </p>
          <p className="mt-5 text-xl font-extrabold text-primary">
            جاهز؟ خلّنا نبدأ التحدي!
          </p>
          <AppStoreBadges className="mt-5 justify-center" />
        </section>
      </div>
    </main>
  );
}

function RegistrationFlow({ initialPaymentStatus }: { initialPaymentStatus: string | null }) {
  const [stepIndex, setStepIndex] = useState(() => getSavedStepIndex(initialPaymentStatus));
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [paymentError, setPaymentError] = useState<string | null>(() =>
    initialPaymentStatus === "failed"
      ? "ما تمت عملية الدفع. جرّب مرة ثانية وثبّت مكانك قبل اكتمال العدد."
      : null,
  );
  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const selected = answers[stepIndex] ?? [];
  const canContinue = !step.options || selected.length > 0;
  const contactFormIsValid =
    contactInfo.name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(contactInfo.email.trim()) &&
    contactInfo.whatsapp.trim().length >= 7 &&
    contactConfirmed;
  const StepIcon = step.icon;

  useEffect(() => {
    window.localStorage.setItem("registration-form-step", String(stepIndex));
  }, [stepIndex]);

  useEffect(() => {
    if (initialPaymentStatus === "cancelled" || initialPaymentStatus === "failed") {
      window.history.replaceState({}, "", "/registration-form");
    }
  }, [initialPaymentStatus]);

  const startPayment = async () => {
    if (!contactFormIsValid) {
      setContactError("عبّي معلوماتك وتأكد إنها صحيحة قبل المتابعة للدفع.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);
    setContactError(null);
    setIsContactDialogOpen(false);

    try {
      window.localStorage.setItem(
        "registration-contact-info",
        JSON.stringify({
          name: contactInfo.name.trim(),
          email: contactInfo.email.trim(),
          whatsapp: contactInfo.whatsapp.trim(),
        }),
      );

      const response = await fetch("/api/ziina/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            name: contactInfo.name.trim(),
            email: contactInfo.email.trim(),
            whatsapp: contactInfo.whatsapp.trim(),
          },
          coachSlug: "coach-tarek",
          challengeSlug: "coach-tarek-challenge",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.redirectUrl) {
        throw new Error(data?.error || data?.message || "تعذر إنشاء رابط الدفع.");
      }

      window.localStorage.setItem("registration-form-step", String(paymentStepIndex));
      if (data.registrationId) {
        window.localStorage.setItem("registration-id", data.registrationId);
      }
      window.location.href = data.redirectUrl;
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "تعذر إنشاء رابط الدفع.",
      );
      setPaymentLoading(false);
    }
  };

  const goNext = async () => {
    if (!canContinue) return;
    if (stepIndex === steps.length - 1) {
      setContactError(null);
      setPaymentError(null);
      setIsContactDialogOpen(true);
      return;
    }
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const toggleAnswer = (option: string) => {
    setAnswers((current) => {
      const currentOptions = current[stepIndex] ?? [];
      const nextOptions = currentOptions.includes(option)
        ? currentOptions.filter((item) => item !== option)
        : [...currentOptions, option];

      return { ...current, [stepIndex]: nextOptions };
    });
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-black"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-16 h-72 w-72 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -left-24 bottom-10 h-80 w-80 rounded-full bg-secondary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,191,107,0.08),transparent_34rem)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3" dir="ltr">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-white/80">
            Tarek AlGhafeer
          </span>
        </header>

        <div className="mt-6 grid gap-6 lg:items-center">
          <section className="rounded-2xl border border-white/10 bg-card/70 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur md:p-8">
            <div className="mb-7">
              <div className="mb-3 flex items-center justify-between gap-4 text-xs font-bold text-white/60">
                <span>
                  الخطوة {stepIndex + 1} من {steps.length}
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
                      تحدي كوتش طارق على Fitnet
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

                {stepIndex === 3 ? <FitnetScreensPreview /> : null}
                {stepIndex === 4 ? <WorkoutScreensPreview /> : null}
                {stepIndex === 5 ? <StepSixCelebration /> : null}
                {stepIndex === 8 ? <StepNineUrgency /> : null}
                {stepIndex === 9 ? <StepTenValue /> : null}

                {step.options ? (
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {step.options.map((option) => {
                      const isSelected = selected.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleAnswer(option)}
                          className={`group flex min-h-16 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-right text-base font-bold leading-relaxed transition ${
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

                {stepIndex === 0 ? <CompactResultsProof /> : null}

                {paymentError ? (
                  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-base font-bold leading-relaxed text-red-100">
                    {paymentError}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="h-12 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                رجوع
              </Button>

              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue || paymentLoading}
                  className="h-14 bg-primary px-8 text-lg font-extrabold text-primary-foreground shadow-[0_0_28px_rgba(0,191,107,0.28)] hover:bg-primary/90 disabled:opacity-45"
                >
                  {paymentLoading ? "جاري تجهيز الدفع..." : step.cta}
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
                {stepIndex === paymentStepIndex ? (
                  <p className="text-center text-xs font-bold text-white/45 sm:text-right">
                    بعد الضغط سيتم نقلك لصفحة الدفع الآمنة.
                  </p>
                ) : null}
              </div>
            </div>
          </section>

        </div>
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent
            dir="rtl"
            className="max-h-[92vh] w-[calc(100vw-1.5rem)] overflow-y-auto rounded-3xl border-white/10 bg-[#0b0f0d] p-5 text-white shadow-[0_26px_90px_rgba(0,0,0,0.55)] sm:max-w-md sm:p-6"
          >
            <DialogHeader className="space-y-3 text-right">
              <DialogTitle className="text-2xl font-extrabold text-white">
                خلّينا نجهّز كود دخولك
              </DialogTitle>
              <DialogDescription className="text-base font-semibold leading-relaxed text-white/65">
                أضف اسمك، إيميلك، ورقم الواتساب حتى نقدر نرسل لك كود دخول
                التحدي وتفاصيل البداية بعد إتمام الدفع.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-white/80">الاسم الكامل</span>
                <Input
                  value={contactInfo.name}
                  onChange={(event) =>
                    setContactInfo((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="مثال: طارق الغفير"
                  className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-base font-bold text-white placeholder:text-white/30 focus-visible:ring-primary"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-white/80">الإيميل</span>
                <Input
                  type="email"
                  value={contactInfo.email}
                  onChange={(event) =>
                    setContactInfo((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                  dir="ltr"
                  className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-left text-base font-bold text-white placeholder:text-white/30 focus-visible:ring-primary"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-extrabold text-white/80">
                  رقم واتساب
                </span>
                <Input
                  type="tel"
                  value={contactInfo.whatsapp}
                  onChange={(event) =>
                    setContactInfo((current) => ({
                      ...current,
                      whatsapp: event.target.value,
                    }))
                  }
                  placeholder="+971 50 000 0000"
                  dir="ltr"
                  className="h-14 rounded-2xl border-white/10 bg-white/[0.04] text-left text-base font-bold text-white placeholder:text-white/30 focus-visible:ring-primary"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <Checkbox
                  checked={contactConfirmed}
                  onCheckedChange={(checked) => setContactConfirmed(checked === true)}
                  className="mt-1 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-black"
                />
                <span className="text-sm font-bold leading-relaxed text-white/80">
                  أؤكد أن الاسم والإيميل ورقم الواتساب صحيحين، حتى يوصلني كود
                  دخول التحدي بدون تأخير.
                </span>
              </label>

              {contactError ? (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
                  {contactError}
                </p>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                onClick={startPayment}
                disabled={paymentLoading || !contactFormIsValid}
                className="h-14 rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground shadow-[0_0_28px_rgba(0,191,107,0.26)] hover:bg-primary/90 disabled:opacity-45"
              >
                {paymentLoading ? "جاري تجهيز الدفع..." : "متابعة للدفع"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsContactDialogOpen(false)}
                disabled={paymentLoading}
                className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white"
              >
                رجوع
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
