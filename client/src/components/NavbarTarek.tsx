import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, toggleLanguage, isArabic } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3" dir="ltr">
        <div className="flex shrink-0 cursor-pointer items-center gap-2 text-left" onClick={scrollToHero}>
          <span className="whitespace-nowrap font-heading text-xl font-bold tracking-tighter text-white md:text-2xl">
            Tarek AlGhafeer
          </span>
        </div>

        <div className={`hidden md:flex items-center gap-3 ${isArabic ? "flex-row-reverse" : ""}`}>
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2 border-white/15 bg-black/30 px-3 text-white hover:bg-white/10 hover:text-white"
            onClick={toggleLanguage}
            aria-label="Switch language"
          >
            <Languages className="h-4 w-4" />
            <span className={isArabic ? "font-sans text-sm font-bold" : "text-sm font-bold"}>
              {t.toggleLabel}
            </span>
          </Button>
          <Button 
            variant="default" 
            className={`bg-primary text-primary-foreground hover:bg-primary/90 font-bold ${
              isArabic ? "" : "uppercase tracking-wide"
            }`}
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >{t.nav.join}</Button>
        </div>

        <div className={`flex items-center gap-2 md:hidden ${isArabic ? "flex-row-reverse" : ""}`}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 border-white/15 bg-black/30 px-2 text-white hover:bg-white/10 hover:text-white"
              onClick={toggleLanguage}
              aria-label="Switch language"
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{t.toggleLabel}</span>
            </Button>
            <Button 
              size="sm" 
              className={`bg-primary text-primary-foreground font-bold text-xs ${
                isArabic ? "" : "uppercase"
              }`}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >{t.nav.join}</Button>
        </div>
      </div>
    </nav>
  );
}
