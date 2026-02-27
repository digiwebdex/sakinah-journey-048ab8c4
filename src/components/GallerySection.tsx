import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type GalleryItem = {
  type: "image" | "video";
  src: string;
  thumbSrc?: string;
};

const items: GalleryItem[] = [
  { type: "image", src: "/gallery/image-1.jpeg" },
  { type: "image", src: "/gallery/image-2.jpeg" },
  { type: "video", src: "/gallery/video-1.mp4" },
  { type: "image", src: "/gallery/image-3.jpeg" },
  { type: "image", src: "/gallery/image-4.jpeg" },
  { type: "video", src: "/gallery/video-2.mp4" },
  { type: "image", src: "/gallery/image-5.jpeg" },
  { type: "image", src: "/gallery/image-6.jpeg" },
];

export default function GallerySection() {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = useCallback((i: number) => setActiveIndex(i), []);
  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((c) => (c !== null && c > 0 ? c - 1 : items.length - 1)),
    []
  );
  const next = useCallback(
    () => setActiveIndex((c) => (c !== null && c < items.length - 1 ? c + 1 : 0)),
    []
  );

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">
            {bn ? "স্মৃতি" : "Memories"}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3 mb-4">
            {bn ? "আমাদের " : "Our "}
            <span className="text-gradient-gold">{bn ? "গ্যালারি" : "Gallery"}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {bn
              ? "হজ্জ ও ওমরাহ যাত্রার বিশেষ মুহূর্তগুলো আমাদের গ্যালারিতে দেখুন।"
              : "Explore special moments from our Hajj & Umrah journeys."}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/40 hover:shadow-gold transition-all"
              onClick={() => open(i)}
            >
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.src}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                {item.type === "video" ? (
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-gold opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={close}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Content */}
            <motion.div
              key={activeIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[85vh] rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {items[activeIndex].type === "image" ? (
                <img
                  src={items[activeIndex].src}
                  alt={`Gallery ${activeIndex + 1}`}
                  className="w-full h-full object-contain max-h-[85vh]"
                />
              ) : (
                <video
                  src={items[activeIndex].src}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[85vh]"
                />
              )}
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {activeIndex + 1} / {items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
