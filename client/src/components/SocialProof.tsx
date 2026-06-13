import { ArrowUpRight, Instagram, Users, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useCoach } from "@/lib/coach";

import transformation1 from "@assets/optimized/tarek-transformation-1.webp";
import transformation2 from "@assets/optimized/tarek-transformation-2.webp";
import transformation3 from "@assets/optimized/tarek-transformation-3.webp";

const transformations = [
  {
    image: transformation1,
    label: "Amazing Progress",
    description: "12 Week Transformation"
  },
  {
    image: transformation2,
    label: "Complete Shred",
    description: "16 Week Program"
  },
  {
    image: transformation3,
    label: "Lean & Strong",
    description: "8 Week Cut"
  }
];

const CounterCard = ({ number, label, icon: Icon }: { number: string; label: string; icon: any }) => {
  const { isArabic } = useLanguage();

  return (
    <div className="bg-card border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:border-primary/30 transition-colors group">
      <Icon className="h-8 w-8 text-primary mb-2 opacity-80 group-hover:opacity-100 transition-opacity" />
      {number ? <span className="text-4xl font-heading font-bold text-white tracking-tight">{number}</span> : null}
      <span className={`text-sm text-muted-foreground font-medium ${isArabic ? "leading-relaxed" : "uppercase tracking-widest"}`}>
        {label}
      </span>
    </div>
  );
};

const TransformationGallery = () => {
  const { t } = useLanguage();
  const localizedTransformations = transformations.map((item, index) => ({
    ...item,
    ...t.social.transformations[index],
  }));

  return (
    <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {localizedTransformations.map((item, index) => (
        <div key={index} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/50">
          <img
            src={item.image}
            alt={item.label}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            width={1080}
            height={1350}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
};

export default function SocialProof() {
  const coach = useCoach();
  const { t, isArabic } = useLanguage();

  return (
    <section id="results" className="scroll-mt-24 py-20 bg-black/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-5xl font-heading font-bold mb-4 ${isArabic ? "leading-tight" : "uppercase"}`}>
            {t.social.titlePrefix} <span className="text-primary">{t.social.titleHighlight}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
          <CounterCard number={t.social.yearsNumber} label={t.social.yearsLabel} icon={Trophy} />
          <CounterCard number={t.social.traineesNumber} label={t.social.traineesLabel} icon={Users} />
        </div>

        <a
          href={coach.instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t.social.instagramAriaLabel}
          className="group mx-auto mb-12 flex w-full max-w-2xl items-center gap-4 rounded-2xl border border-white/10 bg-card p-4 text-start transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] shadow-[0_10px_30px_rgba(253,29,29,0.18)]">
            <Instagram className="h-7 w-7 text-white" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white/50">
              {t.social.instagramLabel}
            </span>
            <span
              dir="ltr"
              className="mt-0.5 block truncate text-xl font-bold text-white sm:text-2xl"
            >
              {coach.instagramHandle}
            </span>
          </span>
          <ArrowUpRight
            className={`h-5 w-5 shrink-0 text-white/35 transition-all group-hover:text-primary ${
              isArabic ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
            } group-hover:-translate-y-0.5`}
            aria-hidden="true"
          />
        </a>

        <TransformationGallery />
      </div>
    </section>
  );
}
