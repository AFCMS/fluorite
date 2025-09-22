module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4173"],
      startServerCommand: "pnpm run preview",
      startServerReadyPattern: "Local:",
      numberOfRuns: 3,
      settings: {
        // Mobile PWA settings
        emulatedFormFactor: "mobile",
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        // Include all categories to ensure PWA runs when possible
        onlyCategories: ["performance", "accessibility", "best-practices", "seo", "pwa"],
      },
    },
    assert: {
      assertions: {
        // Category-level assertions
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        
        // PWA category (only fails if it runs - allows for HTTP local testing)
        "categories:pwa": ["warn", { minScore: 0.8 }],
        
        // Performance budgets (adjusted for video player PWA)
        "resource-summary:document:size": ["warn", { maxNumericValue: 100000 }],
        "resource-summary:script:size": ["warn", { maxNumericValue: 500000 }],
        "resource-summary:stylesheet:size": ["warn", { maxNumericValue: 50000 }],
        "resource-summary:total:size": ["warn", { maxNumericValue: 3500000 }],
        
        // Core Web Vitals (development-friendly thresholds)
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 400 }],
        
        // Essential web standards
        "viewport": "error",
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