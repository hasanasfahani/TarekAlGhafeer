import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "ar" | "en";

const translations = {
  ar: {
    dir: "rtl",
    toggleLabel: "EN",
    nav: {
      join: "انضم للتحدي",
    },
    hero: {
      titlePrefix: "غيّر جسمك مع",
      titleHighlight: "الكوتش طارق",
      titleSuffix: "وارجع واثق بنفسك أكثر",
      prizeEmojis: "",
      subtitle:
        "تدريب أونلاين لمدة شهر: خطة تمرين، خطة تغذية، ومتابعة مع الكوتش ضمن التحدي",
      cta: "اشترك بـ 149 درهم فقط",
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
      join: "Join Challenge",
    },
    hero: {
      titlePrefix: "Transform Your Body With",
      titleHighlight: "Coach Tarek",
      titleSuffix: "AND FEEL CONFIDENT AGAIN",
      prizeEmojis: "",
      subtitle:
        "One month of online coaching: a workout plan, nutrition plan, and coach follow-up as part of the challenge.",
      cta: "JOIN FOR ONLY AED 149",
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
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "ar";
    return window.localStorage.getItem("site-language") === "en" ? "en" : "ar";
  });

  const value = useMemo<LanguageContextValue>(() => {
    const t = translations[language] as Translation;
    return {
      language,
      isArabic: language === "ar",
      t,
      toggleLanguage: () => setLanguage((current) => (current === "ar" ? "en" : "ar")),
    };
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = value.t.dir;
    window.localStorage.setItem("site-language", language);
  }, [language, value.t.dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
