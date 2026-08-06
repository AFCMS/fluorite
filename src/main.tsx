import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Analytics } from "@vercel/analytics/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

import "./index.css";
import { getLanguage } from "./utils/get_language.ts";
import { dynamicActivate } from "./utils/i18n_loader.ts";

const sanitizedBrowserLanguageIfSupportedOrEnglish = getLanguage();
await dynamicActivate(sanitizedBrowserLanguageIfSupportedOrEnglish);

const isAnalyticsEnabled =
  import.meta.env.VITE_DISABLE_VERCEL_ANALYTICS !== "true";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAnalyticsEnabled && <Analytics />}
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </StrictMode>,
);
