import { describe, it, expect, vi, beforeEach } from "vitest";
import { dynamicActivate } from "./i18n_loader";
import * as linguiCore from "@lingui/core";

vi.mock("@lingui/core");

vi.mock("./../locales/en/messages.po", () => ({
  messages: { hello: "Hello" },
}));

vi.mock("./../locales/fr/messages.po", () => ({
  messages: { hello: "Bonjour" },
}));

describe("i18n_loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dynamicActivate", () => {
    it("should load and activate English locale", async () => {
      const mockLoad = vi.fn();
      const mockActivate = vi.fn();

      vi.mocked(linguiCore.i18n).load = mockLoad;
      vi.mocked(linguiCore.i18n).activate = mockActivate;

      await dynamicActivate("en");

      expect(mockLoad).toHaveBeenCalledOnce();
      expect(mockLoad).toHaveBeenCalledWith("en", { hello: "Hello" });
      expect(mockActivate).toHaveBeenCalledOnce();
      expect(mockActivate).toHaveBeenCalledWith("en");
    });

    it("should load and activate French locale", async () => {
      const mockLoad = vi.fn();
      const mockActivate = vi.fn();

      vi.mocked(linguiCore.i18n).load = mockLoad;
      vi.mocked(linguiCore.i18n).activate = mockActivate;

      await dynamicActivate("fr");

      expect(mockLoad).toHaveBeenCalledOnce();
      expect(mockLoad).toHaveBeenCalledWith("fr", { hello: "Bonjour" });
      expect(mockActivate).toHaveBeenCalledOnce();
      expect(mockActivate).toHaveBeenCalledWith("fr");
    });

    it("should call load before activate", async () => {
      const callOrder: string[] = [];

      const mockLoad = vi.fn(() => {
        callOrder.push("load");
      });
      const mockActivate = vi.fn(() => {
        callOrder.push("activate");
      });

      vi.mocked(linguiCore.i18n).load = mockLoad;
      vi.mocked(linguiCore.i18n).activate = mockActivate;

      await dynamicActivate("en");

      expect(callOrder).toEqual(["load", "activate"]);
    });

    it("should handle dynamic imports correctly", async () => {
      const mockLoad = vi.fn();
      const mockActivate = vi.fn();

      vi.mocked(linguiCore.i18n).load = mockLoad;
      vi.mocked(linguiCore.i18n).activate = mockActivate;

      await dynamicActivate("en");

      const [locale, messages] = vi.mocked(linguiCore.i18n).load.mock.calls[0];
      expect(locale).toBe("en");
      expect(messages).toHaveProperty("hello");
    });
  });
});
