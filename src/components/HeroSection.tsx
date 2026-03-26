import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, MapPin, Shield, Plane, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import heroKaaba from "@/assets/hero-kaaba-golden.jpg";
import heroMedina from "@/assets/hero-medina.jpg";
import heroHotel from "@/assets/hero-hotel.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";

const heroSlides = [
  { image: heroKaaba, alt: "Holy Kaaba at Masjid al-Haram during golden sunset" },
  { image: heroMedina, alt: "Prophet's Mosque Masjid an-Nabawi in Medina" },
  { image: heroHotel, alt: "Premium hotel near Haram with luxury amenities" },
];

const HeroSection = () => {
  const { data: content } = useSiteContent("hero");
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const lc = content?.[language];
  const badge = lc?.badge || t("hero.badge");
  const ctaPrimary = lc?.cta_primary || t("hero.ctaPrimary");
  const ctaSecondary = lc?.cta_secondary || t("hero.ctaSecondary");
  const stats = lc?.stats || [
    { value: "15+", label: t("hero.stat.years") },
    { value: "10K+", label: t("hero.stat.pilgrims") },
    { value: "50+", label: t("hero.stat.packages") },
    { value: "4.9★", label: t("hero.stat.rating") },
  ];

  const defaultIcons = [Shield, Star, Plane, MapPin];

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = useCallback((dir: number) => {
    setCurrentSlide((prev) => (prev + dir + heroSlides.length) % heroSlides.length);
  }, []);

  return (
    <section id="home" className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
      {/* Sliding Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].alt}
            className="w-full h-full object-cover brightness-[0.6] saturate-[1.1]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/80 via-[#1a1a2e]/30 to-transparent" />

      {/* Slide Navigation Arrows */}
      <button onClick={() => goTo(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => goTo(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-primary w-8" : "bg-white/50 hover:bg-white/70"}`}
          />
        ))}
      </div>

      {/* Top gold accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold z-10" />

      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2 mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-gold-light animate-pulse" />
          <span className="text-gold-light text-xs font-semibold tracking-[0.2em] uppercase">{badge}</span>
        </motion.div>

        {/* Quranic Verse Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-primary/50" />
            <Star className="h-4 w-4 text-primary fill-primary/30" />
            <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-relaxed mb-6"
            dir="rtl"
            style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
          >
            وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl font-semibold italic text-gradient-gold leading-relaxed"
          >
            "আর তোমরা আল্লাহর সন্তুষ্টির জন্য হজ্জ ও ওমরাহ পূর্ণ কর"
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-sm sm:text-base text-white/70 mt-3 tracking-wide"
          >
            — (সূরা আল-বাকারা: ১৯৬)
          </motion.p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-primary/50" />
            <Star className="h-4 w-4 text-primary fill-primary/30" />
            <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex flex-wrap gap-4 justify-center mb-16 sm:mb-20"
        >
          <a
            href="#packages"
            className="group bg-gradient-gold text-white font-semibold px-8 py-4 rounded-xl text-sm hover:shadow-gold hover:scale-[1.02] transition-all duration-300 inline-flex items-center gap-2"
          >
            {ctaPrimary}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#contact"
            className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-sm hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300 inline-flex items-center"
          >
            {ctaSecondary}
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 max-w-4xl mx-auto">
            {stats.map((stat: any, i: number) => {
              const IconComp = defaultIcons[i % defaultIcons.length];
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 + i * 0.1 }}
                  className={`flex items-center gap-3 ${i < stats.length - 1 ? "md:border-r md:border-primary/10" : ""} md:pr-4`}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                    <IconComp className="h-4.5 w-4.5 text-gold-light" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-heading font-bold text-white leading-none">{stat.value}</p>
                    <p className="text-[11px] text-white/60 mt-1">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
