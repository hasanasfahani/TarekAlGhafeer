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
      titleSuffix: "واربح الملايين",
      prizeEmojis: "💸💰",
      cta: "اشترك بـ $29.9 بس",
      seats: "المقاعد محدودة",
    },
    benefits: {
      titlePrefix: "ليش تنضم",
      titleHighlight: "للتحدّي؟",
      items: [
        "رح تكون راضي عن نفسك بعد شهر التزام ورح تحصل على:\n* خطة تدريبية\n* خطة تغذية\nليكون طريقك واضح",
        "احرق أكثر… نافس أكثر… واربح 💰\nتنافس مع باقي المشاركين حسب عدد الحريرات التي تحرقها خلال الشهر.",
        "كون جزء من مجتمع داعم بقيادة الكوتش، يخلّيك متحمّس وما تحس إنك عم تتمرن لحالك.",
      ],
    },
    how: {
      title: "كيف تسجل؟",
      subtitle: "ستحصل على برنامج تدريبي، خطة تغذية، وجوائز بالملايين",
      whatsapp: "اضغط على زر واتساب للاشتراك وفريقنا رح يتواصل معك للتثبيت. (سعر الاشتراك $٢٩.٩)",
      whatsappHint: "اضغط هنا👇🏼",
      download: "حمّل تطبيق Fitnet، أدخل كود الدخول، وابدأ التحدّي.",
      qrAlt: "رمز دفع شام كاش",
      whatsappLabel: "إرسال طلب الاشتراك على واتساب",
    },
    social: {
      titlePrefix: "خبرة حقيقية.",
      titleHighlight: "نتائج حقيقية.",
      yearsNumber: "",
      yearsLabel: "خبرة أكتر من 10 سنين",
      traineesNumber: "",
      traineesLabel: "أكتر من 500 متدرّب مبسوط",
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
      subtitle: "تمرّن. تابع تقدّمك. وتغيّر — معنا.",
      cta: "يلا نبلّش!",
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
      titleSuffix: "AND WIN MIllIONS",
      prizeEmojis: "💸💰",
      cta: "JOIN FOR ONLY $29.9",
      seats: "Limited seats available",
    },
    benefits: {
      titlePrefix: "Why Join My",
      titleHighlight: "Challenge:",
      items: [
        "You’ll feel proud of yourself after one month of commitment and you’ll get:\n* A training plan\n* A nutrition plan\nso your path is clear",
        "Burn more... compete more... and win 💰\nCompete with the other participants based on the calories you burn during the month.",
        "Be part of a supportive, coach-led community that keeps you motivated and never alone.",
      ],
    },
    how: {
      title: "How It Works",
      subtitle: "You’ll get a training program, a nutrition plan, and prizes worth millions",
      whatsapp: "Click the WhatsApp button to subscribe and our team will contact you to confirm. (subscription price $29.9)",
      whatsappHint: "Tap here 👇🏼",
      download: "Download the Fitnet app, enter your access code, and start your challenge.",
      qrAlt: "Sham Cash payment QR code",
      whatsappLabel: "Send join request on WhatsApp",
    },
    social: {
      titlePrefix: "Real Experience.",
      titleHighlight: "Real Results.",
      yearsNumber: "10+",
      yearsLabel: "Years Experience",
      traineesNumber: "500+",
      traineesLabel: "Happy Trainees",
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
      subtitle: "Train. Track. Transform - together.",
      cta: "Let's Start",
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
