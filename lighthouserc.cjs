module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:8080"],
      startServerCommand: "caddy file-server --root ./dist --listen :8080",
      startServerReadyPattern: "serving static files",
      numberOfRuns: 3,
      settings: {
        formFactor: "desktop",
        throttling: {
          rttMs: 40,
          throughputKbps: 300000,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false,
        },
        gatherMode: "navigation",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      },
    },
    assert: {
      assertions: {
        // Category-level assertions
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],

        // Performance budgets (adjusted for video player PWA)
        "resource-summary:document:size": ["warn", { maxNumericValue: 100000 }],
        "resource-summary:script:size": ["warn", { maxNumericValue: 500000 }],
        "resource-summary:stylesheet:size": [
          "warn",
          { maxNumericValue: 50000 },
        ],
        "resource-summary:total:size": ["warn", { maxNumericValue: 3500000 }],

        // Core Web Vitals (development-friendly thresholds)
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 400 }],

        // Essential web standards
        viewport: "error",
        "color-contrast": "error",
        "heading-order": "warn",
        "meta-description": "warn",
        "document-title": "warn",

        // Allow HTTP for local development, enforce HTTPS in production
        "is-on-https": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
