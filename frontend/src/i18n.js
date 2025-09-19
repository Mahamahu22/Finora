"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Load translations
import en from "./locales/en.json";
import ta from "./locales/ta.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
    },
    lng: "en", // ✅ default only
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

// ✅ After init, set language from localStorage on client
if (typeof window !== "undefined") {
  const savedLang = localStorage.getItem("language") || "en";
  if (i18n.language !== savedLang) {
    i18n.changeLanguage(savedLang);
  }
}

export default i18n;
