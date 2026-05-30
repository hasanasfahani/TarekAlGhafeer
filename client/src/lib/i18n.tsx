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
        "رح تحصل على برنامج تمرين واضح بالصور، مع خطة أكل تساعدك تعرف بالضبط شو تعمل — وما تحس حالك ضايع بالنادي مرة تانية.",
        "شارك تقدّمك مع غيرك، تحمّس، واربح الملايين 💰",
        "كون جزء من مجتمع داعم بقيادة الكوتش، يخلّيك متحمّس وما تحس إنك عم تتمرن لحالك.",
      ],
    },
    how: {
      title: "كيف تسجل؟",
      subtitle: "خطوات بسيطة لتنضم للتحدّي",
      whatsapp: "اضغط على زر واتساب وابعتلنا: “بدي اشترك”. فريقنا رح يساعدك بإتمام الدفع والانضمام للتحدّي.",
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
        "Get a clear visual workout program and a meal plan - so you never feel lost in the gym again.",
        "Celebrate your progress with others and win millions 💰",
        "Be part of a supportive, coach-led community that keeps you motivated and never alone.",
      ],
    },
    how: {
      title: "How It Works",
      subtitle: "Simple steps to join the challenge",
      whatsapp: "Click the WhatsApp button and send your join request. Our team will guide you through the payment process and help you join the challenge.",
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
