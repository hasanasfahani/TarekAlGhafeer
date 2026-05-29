import { Dumbbell, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

import section1Screenshot from "@assets/optimized/workout-program.webp";
import challengeLeaderboardScreenshot from "@assets/optimized/challenge-leaderboard-prizes.webp";
import challengeMainScreenshot from "@assets/optimized/challenge-main-community.webp";
import { useLanguage } from "@/lib/i18n";

interface BenefitRowProps {
  icon: any;
  text: string;
  screenshot: string;
  reverse?: boolean;
  index: number;
  isArabic: boolean;
}

const IPhoneMockup = ({ screenshot, alt }: { screenshot: string; alt: string }) => (
  <div className="relative mx-auto w-[280px] md:w-[320px]">
    {/* iPhone Frame */}
    <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl border-4 border-gray-800">
      {/* Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
      
      {/* Screen */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
        <img 
          src={screenshot} 
          alt={alt} 
          className="w-full h-auto"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
    
    {/* Glow Effect */}
    <div className="absolute -inset-4 bg-primary/10 rounded-[4rem] blur-2xl -z-10" />
  </div>
);

const BenefitRow = ({ icon: Icon, text, screenshot, reverse = false, index, isArabic }: BenefitRowProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className={`flex flex-col ${
      isArabic
        ? reverse ? "lg:flex-row" : "lg:flex-row-reverse"
        : reverse ? "lg:flex-row-reverse" : "lg:flex-row"
    } items-center gap-12 lg:gap-20`}
  >
    {/* Text Content */}
    <div className={`flex-1 text-center ${isArabic ? "lg:text-right" : "lg:text-left"}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-gray-200 font-medium">
        {text}
      </p>
    </div>
    
    {/* iPhone Mockup */}
    <div className="flex-shrink-0">
      <IPhoneMockup screenshot={screenshot} alt="App Screenshot" />
    </div>
  </motion.div>
);

export default function Benefits() {
  const { t, isArabic } = useLanguage();
  const benefits = [
    {
      icon: Dumbbell,
      text: t.benefits.items[0],
      screenshot: section1Screenshot,
    },
    {
      icon: Trophy,
      text: t.benefits.items[1],
      screenshot: challengeLeaderboardScreenshot,
    },
    {
      icon: Users,
      text: t.benefits.items[2],
      screenshot: challengeMainScreenshot,
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[150px] -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white ${isArabic ? "" : "uppercase"}`}>
            {t.benefits.titlePrefix} <span className="text-primary">{t.benefits.titleHighlight}</span>
          </h2>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {benefits.map((benefit, index) => (
            <BenefitRow 
              key={index}
              icon={benefit.icon}
              text={benefit.text}
              screenshot={benefit.screenshot}
              reverse={index % 2 === 1}
              index={index}
              isArabic={isArabic}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
