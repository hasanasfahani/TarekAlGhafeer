import { useState } from "react";

import Navbar from "@/components/NavbarTarek";
import Hero from "@/components/HeroTarek";
import SocialProof from "@/components/SocialProof";
import Benefits from "@/components/Benefits";
import FinalCTA from "@/components/FinalCTA";
import { useLanguage } from "@/lib/i18n";
import PackagesTable from "@/components/PackagesTable";
import PaymentCheckoutDialog from "@/components/PaymentCheckoutDialog";
import type { PackageId } from "@/lib/packages";

function PackagesSection() {
  const { isArabic } = useLanguage();
  const [selectedPackageId, setSelectedPackageId] =
    useState<PackageId>("premium-single");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const openCheckout = (packageId: PackageId) => {
    setSelectedPackageId(packageId);
    setIsCheckoutOpen(true);
  };

  return (
    <section id="packages" className="scroll-mt-24 relative overflow-hidden bg-background py-24">
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
      <div className="container relative z-10 mx-auto px-4">
        <PackagesTable isArabic={isArabic} onSelect={openCheckout} />
      </div>
      <PaymentCheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        source="pricing_section"
        packageId={selectedPackageId}
        isArabic={isArabic}
      />
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
