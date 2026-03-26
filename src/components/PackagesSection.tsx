import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Clock, MapPin, Star, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import heroImage from "@/assets/hero-kaaba-golden.jpg";
import medinaImage from "@/assets/hero-medina.jpg";

const fallbackImages = [heroImage, medinaImage];

const PackagesSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .eq("show_on_website", true)
        .order("price", { ascending: true })
        .limit(6);
      setPackages(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading || packages.length === 0) return null;

  return (
    <section id="packages" className="py-24 bg-secondary/50 islamic-border-top">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">{t("packages.label")}</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 mb-4">
            {t("packages.heading")} <span className="text-gradient-gold">{t("packages.headingHighlight")}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("packages.description")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden bg-card border border-border flex flex-col group hover:shadow-luxury transition-all duration-500"
            >
              {/* Image with overlay badge */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={pkg.image_url || fallbackImages[i % fallbackImages.length]}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Type badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full capitalize shadow-md">
                    {pkg.type}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-bold text-charcoal">4.9</span>
                </div>

                {/* Price overlay */}
                <div className="absolute bottom-4 left-4">
                  <p className="text-2xl font-heading font-bold text-white drop-shadow-lg">
                    ৳{Number(pkg.price).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/80">{t("packages.perPerson")}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-heading text-xl font-bold mb-2">{pkg.name}</h3>
                
                {/* Meta info */}
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  {pkg.duration_days && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {pkg.duration_days} {t("common.days")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Plane className="h-3.5 w-3.5" />
                    {t("services.visa")}
                  </span>
                </div>

                {pkg.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{pkg.description}</p>
                )}

                {/* Features */}
                {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                  <ul className="space-y-2 mb-5 flex-1">
                    {(pkg.features as string[]).slice(0, 4).map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => navigate(`/booking?package=${pkg.id}`)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-center inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary-foreground hover:opacity-90 hover:shadow-gold transition-all duration-300 cursor-pointer mt-auto"
                >
                  {t("packages.bookNow")} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {packages.length >= 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/packages")}
              className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
            >
              {t("common.viewAll") || "View All Packages"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PackagesSection;
