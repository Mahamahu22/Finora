"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Load translations
import en from "./locales/en.json";
import ta from "./locales/ta.json";

const savedLang =
  typeof window !== "undefined" ? localStorage.getItem("language") : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
  },
  lng: savedLang || "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
