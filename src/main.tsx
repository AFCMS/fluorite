import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";

import App from "./App.tsx";

import "./index.css";
import { dynamicActivate } from "./utils/i18n_loader.ts";
import { getLanguage } from "./utils/get_language.ts";

const sanitizedBrowserLanguageIfSupportedOrEnglish = getLanguage();
await dynamicActivate(sanitizedBrowserLanguageIfSupportedOrEnglish);

const isAnalyticsEnabled =
  import.meta.env.VITE_DISABLE_VERCEL_ANALYTICS !== "true";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAnalyticsEnabled && <Analytics />}
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </StrictMode>,
);
