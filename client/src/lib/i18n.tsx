import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCoach } from "@/lib/coach";

type Language = "ar" | "en";

const translations = {
  ar: {
    dir: "rtl",
    toggleLabel: "EN",
    nav: {
      home: "الرئيسية",
      benefits: "ليش تنضم؟",
      packages: "باقات الاشتراك",
      results: "النتائج",
      join: "انضم مجاناً",
    },
    hero: {
      titlePrefix: "جاهز للتحدي مع",
      titleHighlight: "كوتش طارق",
      titleSuffix: "؟",
      prizeEmojis: "",
      subtitle:
        "تدريب أونلاين لمدة شهر: خطة تمرين، خطة تغذية، ومتابعة مع الكوتش ضمن التحدي",
      cta: "انضم مجاناً",
      seats: "المقاعد محدودة",
    },
    benefits: {
      titlePrefix: "ليش تنضم",
      titleHighlight: "للتحدي؟",
      items: [
        "بعد شهر من الالتزام، بتشوف الفرق بنفسك، وبيكون عندك:\n* خطة تمرين واضحة\n* خطة تغذية مناسبة\n* طريق واضح تمشي عليه بدون حيرة",
        "احرق أكثر… نافس أكثر… واربح 💰\nتنافس مع باقي المشاركين حسب عدد السعرات اللي تحرقها خلال الشهر.",
        "لا تتمرن بروحك.\nادخل مجتمع داعم بقيادة الكوتش، يخليك متحمس ومكمل للنهاية.",
      ],
    },
    how: {
      title: "كيف تسجل؟",
      subtitle: "ستحصل على برنامج تدريبي، خطة تغذية، وجوائز بالملايين",
      whatsapp: "اضغط على زر واتساب لإتمام عملية الدفع ($٢٩.٩) والتثبيت مع فريقنا.",
      seatsLeft: "١٠ مقاعد متبقية",
      whatsappHint: "اضغط هنا👇🏼",
      download: "حمّل تطبيق Fitnet، أدخل كود الدخول، وابدأ التحدّي.",
      qrAlt: "رمز دفع شام كاش",
      whatsappLabel: "إرسال طلب الاشتراك على واتساب",
    },
    social: {
      titlePrefix: "خبرة حقيقية.",
      titleHighlight: "نتائج حقيقية.",
      yearsNumber: "",
      yearsLabel: "أكثر من 10 سنوات خبرة",
      traineesNumber: "",
      traineesLabel: "أكثر من 500 متدرب راضي",
      instagramLabel: "تابع الكوتش طارق على إنستغرام",
      instagramAriaLabel: "زيارة حساب الكوتش طارق على إنستغرام",
      transformations: [
        { label: "نتائج مميزة", description: "تحوّل خلال 12 أسبوع" },
        { label: "تنشيف كامل", description: "برنامج 16 أسبوع" },
        { label: "جسم ناشف وقوي", description: "تنشيف خلال 8 أسابيع" },
      ],
      previousSlide: "السابق",
      nextSlide: "التالي",
    },
    final: {
      titlePrefix: "جاهز تبدأ",
      titleHighlight: "التغيير؟",
      subtitle: "تمرّن. تابع تقدمك. وتغير معنا.",
      cta: "يلا نبدأ!",
      powered: "بدعم من تطبيق Fitnet",
    },
    appStores: {
      appStoreAlt: "تحميل من App Store",
      playStoreAlt: "تحميل من Google Play",
    },
  },
  en: {
    dir: "ltr",
    toggleLabel: "عربي",
    nav: {
      home: "Home",
      benefits: "Why Join?",
      packages: "Packages",
      results: "Results",
      join: "Join for FREE",
    },
    hero: {
      titlePrefix: "Ready for the challenge with",
      titleHighlight: "Coach Tarek",
      titleSuffix: "?",
      prizeEmojis: "",
      subtitle:
        "One month of online coaching: a workout plan, nutrition plan, and coach follow-up as part of the challenge.",
      cta: "JOIN FOR FREE",
      seats: "Limited seats available",
    },
    benefits: {
      titlePrefix: "Why Join the",
      titleHighlight: "Challenge?",
      items: [
        "After one month of commitment, you’ll see the difference yourself, with:\n* A clear workout plan\n* A suitable nutrition plan\n* A clear path to follow without confusion",
        "Burn more… compete more… and win 💰\nCompete with other participants based on the calories you burn during the month.",
        "Don’t train alone.\nJoin a supportive, coach-led community that keeps you motivated and moving through to the finish.",
      ],
    },
    how: {
      title: "How It Works",
      subtitle: "You’ll get a training program, a nutrition plan, and prizes worth millions",
      whatsapp: "Click the WhatsApp button to complete payment ($29.9) and confirm with our team.",
      seatsLeft: "10 seats left",
      whatsappHint: "Tap here 👇🏼",
      download: "Download the Fitnet app, enter your access code, and start your challenge.",
      qrAlt: "Sham Cash payment QR code",
      whatsappLabel: "Send join request on WhatsApp",
    },
    social: {
      titlePrefix: "Real Experience.",
      titleHighlight: "Real Results.",
      yearsNumber: "10+",
      yearsLabel: "More Than 10 Years of Experience",
      traineesNumber: "500+",
      traineesLabel: "More Than 500 Satisfied Trainees",
      instagramLabel: "Follow Coach Tarek on Instagram",
      instagramAriaLabel: "Visit Coach Tarek on Instagram",
      transformations: [
        { label: "Amazing Progress", description: "12 Week Transformation" },
        { label: "Complete Shred", description: "16 Week Program" },
        { label: "Lean & Strong", description: "8 Week Cut" },
      ],
      previousSlide: "Previous slide",
      nextSlide: "Next slide",
    },
    final: {
      titlePrefix: "Are you ready to start your",
      titleHighlight: "transformation?",
      subtitle: "Train. Track your progress. Transform with us.",
      cta: "Let’s Start!",
      powered: "Powered by Fitnet App",
    },
    appStores: {
      appStoreAlt: "Download on the App Store",
      playStoreAlt: "Get it on Google Play",
    },
  },
} as const;

type Translation = typeof translations.en;

interface LanguageContextValue {
  language: Language;
  isArabic: boolean;
  toggleLanguage: () => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const coach = useCoach();
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "ar";
    return window.localStorage.getItem("site-language") === "en" ? "en" : "ar";
  });

  const value = useMemo<LanguageContextValue>(() => {
    const source = translations[language];
    const replaceCoachName = (value: unknown): unknown => {
      if (typeof value === "string") {
        return value
          .replaceAll("Coach Tarek", `Coach ${coach.firstName}`)
          .replaceAll("الكوتش طارق", `الكوتش ${coach.arabicFirstName}`)
          .replaceAll("كوتش طارق", `كوتش ${coach.arabicFirstName}`);
      }
      if (Array.isArray(value)) return value.map(replaceCoachName);
      if (value && typeof value === "object") {
        return Object.fromEntries(
          Object.entries(value).map(([key, item]) => [key, replaceCoachName(item)]),
        );
      }
      return value;
    };
    const t = replaceCoachName(source) as Translation;
    return {
      language,
      isArabic: language === "ar",
      t,
      toggleLanguage: () => setLanguage((current) => (current === "ar" ? "en" : "ar")),
    };
  }, [coach.arabicFirstName, coach.firstName, language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = value.t.dir;
    window.localStorage.setItem("site-language", language);
  }, [language, value.t.dir]);

  useEffect(() => {
    const seo = language === "ar"
      ? { title: coach.seo.titleAr, description: coach.seo.descriptionAr }
      : { title: coach.seo.title, description: coach.seo.description };
    document.title = seo.title;
    const canonicalUrl = `https://${coach.domain}${window.location.pathname}`;
    const setMeta = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', "content", seo.description);
    setMeta('meta[property="og:title"]', "content", seo.title);
    setMeta('meta[property="og:description"]', "content", seo.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", seo.title);
    setMeta('meta[name="twitter:description"]', "content", seo.description);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [coach, language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
