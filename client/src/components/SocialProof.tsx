import { Users, Trophy } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/lib/i18n";

import transformation1 from "@assets/bf1_1765019445517.jpg";
import transformation2 from "@assets/Dylan-Ryan-before_after-1_1765019445517.webp";
import transformation3 from "@assets/before-after-1_1765019445517.jpg";

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

const TransformationCarousel = () => {
  const { t, isArabic } = useLanguage();
  const localizedTransformations = transformations.map((item, index) => ({
    ...item,
    ...t.social.transformations[index],
  }));

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {localizedTransformations.map((item, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden group border border-white/10 bg-black/50">
                <img 
                  src={item.image} 
                  alt={item.label} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Text Content */}
                <div
                  className={`absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                  dir={isArabic ? "rtl" : "ltr"}
                >
                  <div className={`h-1 w-12 bg-primary mb-2 rounded-full ${isArabic ? "ml-auto" : ""}`} />
                  <h3 className={`font-heading font-bold text-xl text-white ${isArabic ? "" : "uppercase tracking-wide"}`}>
                    {item.label}
                  </h3>
                  <p className={`text-xs text-muted-foreground ${isArabic ? "leading-relaxed" : "uppercase tracking-widest"}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="flex -left-2 md:-left-12 border-primary/20 hover:bg-primary hover:text-black h-8 w-8 md:h-10 md:w-10" />
        <CarouselNext className="flex -right-2 md:-right-12 border-primary/20 hover:bg-primary hover:text-black h-8 w-8 md:h-10 md:w-10" />
      </Carousel>
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

        <TransformationCarousel />
      </div>
    </section>
  );
}
