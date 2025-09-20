import { supportedLocales } from "./supportedLocales";

export function getSanitizedBrowserLanguageIfSupportedOrEnglish() {
  const lang = navigator.language;
  const sanitizedLang = lang.split("-")[0];
  return supportedLocales.includes(sanitizedLang) ? sanitizedLang : "en";
}
