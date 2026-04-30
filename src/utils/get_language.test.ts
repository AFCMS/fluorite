import { describe, it, expect, vi, beforeEach } from "vitest";
import * as detectModule from "@lingui/detect-locale";

import { isSupportedLocale, getLanguage } from "./get_language";

vi.mock("@lingui/detect-locale");

type FromStorageFn = (
  key: string,
  options?: { useSessionStorage: boolean },
) => string;
type FromNavigatorFn = (navigator?: unknown) => string;

describe("get_language", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isSupportedLocale", () => {
    it("should return true for supported locale 'en'", () => {
      expect(isSupportedLocale("en")).toBe(true);
    });

    it("should return true for supported locale 'fr'", () => {
      expect(isSupportedLocale("fr")).toBe(true);
    });

    it("should return false for unsupported locale", () => {
      expect(isSupportedLocale("de")).toBe(false);
    });

    it("should return false for unsupported locale 'es'", () => {
      expect(isSupportedLocale("es")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isSupportedLocale("")).toBe(false);
    });
  });

  describe("getLanguage", () => {
    it("should return language from storage when available", () => {
      const mockFromStorage: FromStorageFn = () => "fr";
      const mockFromNavigator: FromNavigatorFn = () => "";

      vi.mocked(detectModule.fromStorage).mockImplementation(mockFromStorage);
      vi.mocked(detectModule.fromNavigator).mockImplementation(
        mockFromNavigator,
      );
      vi.mocked(detectModule.detect).mockReturnValue("fr");

      expect(getLanguage()).toBe("fr");
    });

    it("should return language from navigator when storage is empty", () => {
      const mockFromStorage: FromStorageFn = () => "";
      const mockFromNavigator: FromNavigatorFn = () => "en";

      vi.mocked(detectModule.fromStorage).mockImplementation(mockFromStorage);
      vi.mocked(detectModule.fromNavigator).mockImplementation(
        mockFromNavigator,
      );
      vi.mocked(detectModule.detect).mockReturnValue("en");

      expect(getLanguage()).toBe("en");
    });

    it("should extract language code from locale variant (en-US -> en)", () => {
      vi.mocked(detectModule.detect).mockReturnValue("en-US");

      expect(getLanguage()).toBe("en");
    });

    it("should extract language code from locale variant (fr-FR -> fr)", () => {
      vi.mocked(detectModule.detect).mockReturnValue("fr-FR");

      expect(getLanguage()).toBe("fr");
    });

    it("should return default fallback when detection returns null", () => {
      vi.mocked(detectModule.detect).mockReturnValue(null);

      expect(getLanguage()).toBe("en");
    });

    it("should return default fallback for unsupported detected locale", () => {
      vi.mocked(detectModule.detect).mockReturnValue("de");

      expect(getLanguage()).toBe("en");
    });

    it("should return default fallback for unsupported locale variant", () => {
      vi.mocked(detectModule.detect).mockReturnValue("de-DE");

      expect(getLanguage()).toBe("en");
    });

    it("should handle complex locale strings with multiple dashes", () => {
      vi.mocked(detectModule.detect).mockReturnValue("en-US-x-private");

      expect(getLanguage()).toBe("en");
    });

    it("should work with all supported locales", () => {
      const supportedLanguages = ["en", "fr"];

      supportedLanguages.forEach((lang) => {
        vi.mocked(detectModule.detect).mockReturnValue(lang);
        expect(getLanguage()).toBe(lang);
      });
    });
  });
});
