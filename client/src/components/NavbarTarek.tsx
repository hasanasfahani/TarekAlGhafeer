import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useCoach } from "@/lib/coach";

const sectionIds = ["hero", "benefits", "packages", "results"] as const;
type SectionId = (typeof sectionIds)[number];

export default function Navbar() {
  const coach = useCoach();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const { t, toggleLanguage, isArabic } = useLanguage();

  useEffect(() => {
    let animationFrame = 0;

    const updateFromScrollPosition = () => {
      setIsScrolled(window.scrollY > 10);

      const marker = window.scrollY + Math.min(window.innerHeight * 0.35, 240);
      let currentSection: SectionId = "hero";

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= marker) {
          currentSection = id;
        }
      }

      setActiveSection(currentSection);
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateFromScrollPosition);
    };

    updateFromScrollPosition();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const navItems: Array<{ id: SectionId; label: string }> = [
    { id: "hero", label: t.nav.home },
    { id: "benefits", label: t.nav.benefits },
    { id: "packages", label: t.nav.packages },
    { id: "results", label: t.nav.results },
  ];

  const scrollToSection = (id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState({}, "", id === "hero" ? "/" : `/#${id}`);
    setActiveSection(id);
  };

  const openRegistrationForm = () => {
    window.location.href = "/registration-form";
  };

  const SectionLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={
        mobile
          ? "flex min-w-max items-center gap-1 px-4"
          : `flex items-center gap-1 ${isArabic ? "flex-row-reverse" : ""}`
      }
      dir={isArabic ? "rtl" : "ltr"}
    >
      {navItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-3 py-2 text-sm font-bold whitespace-nowrap transition ${
              isActive
                ? "bg-primary/15 text-primary"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3" dir="ltr">
        <a href="/" className="flex shrink-0 items-center gap-2 text-left">
          <span className="whitespace-nowrap font-heading text-xl font-bold tracking-tighter text-white md:text-2xl">
            {coach.name}
          </span>
        </a>

        <div className="hidden lg:flex">
          <SectionLinks />
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
            onClick={openRegistrationForm}
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
              onClick={openRegistrationForm}
            >{t.nav.join}</Button>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-white/[0.06] bg-background/75 py-1 backdrop-blur-md [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        <SectionLinks mobile />
      </div>
    </nav>
  );
}
