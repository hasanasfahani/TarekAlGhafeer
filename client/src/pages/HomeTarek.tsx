import Navbar from "@/components/NavbarTarek";
import Hero from "@/components/HeroTarek";
import SocialProof from "@/components/SocialProof";
import Benefits from "@/components/Benefits";
import FinalCTA from "@/components/FinalCTA";
import { useLanguage } from "@/lib/i18n";
import PackagesTable from "@/components/PackagesTable";
import type { PackageId } from "@/lib/packages";

function PackagesSection() {
  const { isArabic } = useLanguage();

  const openRegistration = (packageId: PackageId) => {
    window.location.href = `/registration-form?plan=${packageId}`;
  };

  return (
    <section id="packages" className="scroll-mt-24 relative overflow-hidden bg-background py-24">
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
      <div className="container relative z-10 mx-auto px-4">
        <PackagesTable isArabic={isArabic} onSelect={openRegistration} />
      </div>
    </section>
  );
}

export default function Home() {
  const { isArabic } = useLanguage();

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-black"
    >
      <Navbar />
      <Hero />
      <Benefits />
      <PackagesSection />
      <SocialProof />
      <FinalCTA />
    </main>
  );
}
