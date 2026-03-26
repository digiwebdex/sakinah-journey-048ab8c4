import { motion } from "framer-motion";
import { Shield, Headphones, Hotel, Car, BookOpen, Users, Plane, CreditCard, Heart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const facilities = [
  { icon: Shield, key: "facilities.visa" },
  { icon: Plane, key: "facilities.flight" },
  { icon: Hotel, key: "facilities.hotel" },
  { icon: Car, key: "facilities.transport" },
  { icon: BookOpen, key: "facilities.training" },
  { icon: Users, key: "facilities.guide" },
  { icon: Headphones, key: "facilities.support" },
  { icon: CreditCard, key: "facilities.transparent" },
  { icon: Heart, key: "facilities.customized" },
];

const FacilitiesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="facilities" className="py-24 bg-background islamic-border-top">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-[0.3em] uppercase">
            {t("facilities.label")}
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 mb-4">
            {t("facilities.heading")} <span className="text-gradient-gold">{t("facilities.headingHighlight")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("facilities.description")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {facilities.map((item, i) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <IconComp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">{t(`${item.key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`${item.key}.desc`)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
