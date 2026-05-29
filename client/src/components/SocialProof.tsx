import { Users, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
  const { t, isArabic } = useLanguage();

  return (
    <section className="py-20 bg-black/50">
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

        <TransformationGallery />
      </div>
    </section>
  );
}
