// @ts-nocheck
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "utils/i18n-backend.js";

i18n
  .use(Backend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    debug: false,
    lng: "ar",
    fallbackLng: "ar",
    whitelist: ["ar", "en"],
    defaultNs: "translation",
    fallbackNS: "translation",
    ns: ["errors", "policies", "enums", "translation"],
    keySeparator: "->",
  });

export default i18n;
