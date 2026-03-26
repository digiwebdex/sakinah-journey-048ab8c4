import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Language, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("rk_language");
    if (saved === "en") return "en";
    return "bn"; // Default to Bangla
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("rk_language", lang);
  }, []);

  const t = useCallback(
    (key: string) => translations[language][key] || translations.bn[key] || translations.en[key] || key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for HMR or components rendered outside provider
    return {
      language: "bn" as Language,
      setLanguage: () => {},
      t: (key: string) => translations.bn[key] || translations.en[key] || key,
    };
  }
  return context;
};
