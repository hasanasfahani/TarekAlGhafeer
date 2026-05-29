import { Download } from "lucide-react";
import { motion } from "framer-motion";

import AppStoreBadges from "./AppStoreBadges";
import logo from "@assets/Fitnet_Logo_White_1765019936769.png";
import { useLanguage } from "@/lib/i18n";

const whatsappMessage = "مرحبا! بدي اشترك بتحدي الكوتش طارق";
const whatsappUrl = `https://wa.me/9647513855361?text=${encodeURIComponent(whatsappMessage)}`;

const WhatsAppLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M16.04 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.24.58 4.43 1.69 6.36L3.2 28.8l6.64-1.74a12.7 12.7 0 0 0 6.2 1.58h.01c7.04 0 12.76-5.72 12.76-12.76S23.08 3.2 16.04 3.2Zm0 23.28h-.01c-1.95 0-3.87-.52-5.54-1.5l-.4-.24-3.94 1.03 1.05-3.84-.26-.4a10.55 10.55 0 0 1-1.61-5.57c0-5.87 4.78-10.64 10.65-10.64 2.84 0 5.52 1.11 7.53 3.12a10.57 10.57 0 0 1 3.12 7.53c0 5.87-4.78 10.64-10.59 10.64Zm5.84-7.96c-.32-.16-1.9-.94-2.19-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.38-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.67s1.15 3.1 1.31 3.31c.16.21 2.26 3.45 5.48 4.84.77.33 1.36.53 1.83.68.77.24 1.47.21 2.03.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37Z" />
  </svg>
);

type StepProps = {
  number: string;
  title: string;
  delay: number;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
};

const StepCard = ({ number, title, delay, icon: Icon, children }: StepProps) => {
  const { isArabic } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      className="relative flex h-full min-h-[340px] flex-col items-center gap-5 rounded-2xl border border-white/10 bg-card/50 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className={`flex w-full items-center justify-between ${isArabic ? "flex-row-reverse" : ""}`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <span className="font-heading text-4xl font-bold text-primary/70">{number}</span>
      </div>
      <h3
        className={`text-balance text-xl font-bold leading-relaxed text-white ${
          isArabic ? "max-w-[26rem]" : "max-w-[28rem]"
        }`}
      >
        {title}
      </h3>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
        {children}
      </div>
    </motion.div>
  );
};

export default function HowItWorks() {
  const { t, isArabic } = useLanguage();

  return (
    <section id="how-it-works" className="relative py-24">
      <div className="absolute left-0 top-1/3 h-[360px] w-[360px] rounded-full bg-primary/5 blur-[140px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className={`font-heading text-3xl font-bold md:text-5xl ${isArabic ? "" : "uppercase"}`}>
            {t.how.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{t.how.subtitle}</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          <StepCard
            number="01"
            title={t.how.whatsapp}
            delay={0.1}
            icon={WhatsAppLogo}
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.how.whatsappLabel}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_0_30px_rgba(37,211,102,0.38)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <WhatsAppLogo className="h-11 w-11" />
            </a>
          </StepCard>

          <StepCard number="02" title={t.how.download} delay={0.2} icon={Download}>
            <img src={logo} alt="Fitnet" className="h-7 w-auto" />
            <AppStoreBadges />
          </StepCard>
        </div>
      </div>
    </section>
  );
}
