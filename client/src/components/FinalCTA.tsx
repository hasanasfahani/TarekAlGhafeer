import { Button } from "@/components/ui/button";
import logo from "@assets/Fitnet_Logo_White_1765019936769.png";
import AppStoreBadges from "./AppStoreBadges";
import { useLanguage } from "@/lib/i18n";

export default function FinalCTA() {
  const { t, isArabic } = useLanguage();

  return (
    <section id="final-cta" className="py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-primary/5" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2
          className={`text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6 ${
            isArabic ? "" : "uppercase"
          }`}
        >
          {t.final.titlePrefix} <br/>
          <span className="text-primary text-neon">{t.final.titleHighlight}</span>
        </h2>
        
        <p
          className={`text-xl md:text-2xl text-gray-400 font-light mb-12 ${
            isArabic ? "leading-relaxed" : "tracking-widest uppercase"
          }`}
        >
          {t.final.subtitle}
        </p>

        <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
          <Button 
            onClick={() => {
              window.location.href = "/registration-form";
            }}
            className={`w-full h-16 text-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,191,107,0.4)] ${
              isArabic ? "" : "uppercase tracking-wider"
            }`}
          >{t.final.cta}</Button>

          <AppStoreBadges className="justify-center" />
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 opacity-50">
          <img src={logo} alt="Fitnet" className="h-6 w-auto" />
          <span className="text-sm tracking-wide">{t.final.powered}</span>
        </div>
      </div>
    </section>
  );
}
