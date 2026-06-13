import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { motion } from "framer-motion";
import coachTarek from "@assets/optimized/coach-tarek-hero.webp";
import { useLanguage } from "@/lib/i18n";
import { useCoach } from "@/lib/coach";
import { pushDataLayerEvent } from "@/lib/tracking";

export default function Hero() {
  const coach = useCoach();
  const { t, isArabic } = useLanguage();
  const openRegistrationForm = () => {
    pushDataLayerEvent("registration_form_start", "premium-single", {
      cta_location: "main_hero",
      page_type: "homepage",
    });
    window.location.href = "/registration-form";
  };

  return (
    <section id="hero" className="scroll-mt-24 relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Effects */}
      <div className="absolute inset-0 z-0">
        <img 
          src={coachTarek} 
          alt={`Coach ${coach.name}`}
          className="absolute inset-0 w-full h-full object-cover object-top"
          loading="eager"
          decoding="async"
          style={{
            filter: 'brightness(0.75) contrast(1.1) saturate(0.85) sepia(0.05) hue-rotate(-5deg)'
          }}
        />
        
        {/* Dark Gradient Overlay */}
        <div
          className={`absolute inset-0 ${
            isArabic
              ? "bg-gradient-to-l from-black via-black/70 to-black/20"
              : "bg-gradient-to-r from-black via-black/70 to-black/20"
          }`}
        />
        
        {/* Bottom fade to black */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Color Tint Overlay for neon theme cohesion */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent mix-blend-overlay" />
        
        {/* Subtle Vignette Effect */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" />
        
        {/* Neon Edge Glow */}
        <div
          className={`absolute top-0 h-full w-1/3 ${
            isArabic
              ? "left-0 bg-gradient-to-r from-primary/8 via-transparent to-transparent"
              : "right-0 bg-gradient-to-l from-primary/8 via-transparent to-transparent"
          }`}
        />
      </div>
      
      {/* Content */}
      <div className={`container relative z-10 mx-auto px-4 pt-24 pb-12 ${isArabic ? "flex justify-end" : ""}`} dir="ltr">
        <div className={`w-full ${isArabic ? "ml-auto flex max-w-[820px] justify-end text-right" : "max-w-2xl"}`}>
          {/* Text Content */}
          <div className={`flex w-full flex-col gap-6 ${isArabic ? "items-end text-right" : "items-start"}`}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              dir={isArabic ? "rtl" : "ltr"}
              className={`text-white ${
                isArabic
                  ? "ml-auto w-full max-w-[760px] text-right text-4xl font-extrabold leading-[1.24] md:text-6xl lg:text-7xl"
                  : "max-w-[11ch] font-heading text-5xl font-bold uppercase leading-[0.9] md:text-7xl lg:text-8xl"
              }`}
            >
              {isArabic ? (
                <span dir="rtl" className="[unicode-bidi:plaintext]">
                  {t.hero.titlePrefix}{" "}
                  <span className="text-primary">{t.hero.titleHighlight}</span>{" "}
                  {t.hero.titleSuffix}
                </span>
              ) : (
                <>
                  {t.hero.titlePrefix}{" "}
                  <span className="text-primary">{t.hero.titleHighlight}</span>{" "}
                  {t.hero.titleSuffix}{" "}
                  {t.hero.prizeEmojis ? (
                    <span
                      dir="ltr"
                      className="ms-1 inline-flex translate-y-[0.02em] items-center gap-1 whitespace-nowrap align-middle text-[0.82em] leading-none"
                    >
                      {t.hero.prizeEmojis}
                    </span>
                  ) : null}
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              dir={isArabic ? "rtl" : "ltr"}
              className={`max-w-[680px] text-lg font-bold leading-relaxed text-white/75 md:text-xl ${
                isArabic ? "self-end text-right" : "self-start text-left"
              }`}
            >
              {t.hero.subtitle}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`flex w-full flex-col gap-4 ${
                isArabic ? "items-end self-end text-right" : "items-start"
              }`}
            >
              <div className={`flex flex-col gap-4 ${isArabic ? "w-full items-end sm:max-w-[580px]" : "items-start"}`}>
                <Button 
                  onClick={openRegistrationForm}
                  data-testid="hero-payment-cta"
                  className={`h-14 bg-primary px-8 text-lg font-bold text-primary-foreground shadow-[0_0_20px_rgba(0,191,107,0.3)] transition-all hover:scale-105 hover:bg-primary/90 ${
                    isArabic ? "w-full self-end" : "w-full uppercase tracking-wider md:w-auto"
                  }`}
                >{t.hero.cta}</Button>
                
                <div
                  dir={isArabic ? "rtl" : "ltr"}
                  className={`-mt-1 inline-flex items-center gap-1.5 whitespace-nowrap opacity-85 ${
                    isArabic ? "self-end text-right" : "self-start"
                  }`}
                >
                  <Info className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                  <span className={`text-[11px] font-semibold text-white ${isArabic ? "" : "uppercase tracking-[0.1em]"}`}>
                    {t.hero.seats}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
