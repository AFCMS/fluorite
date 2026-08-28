import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Provider } from "jotai";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import VideoPlayer from "./VideoPlayer";

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({ updateServiceWorker: vi.fn() }),
}));

vi.mock("../workers/mediainfo.worker?worker", () => ({
  default: class MockMediaInfoWorker {
    addEventListener() {}
    postMessage() {}
    removeEventListener() {}
    terminate() {}
  },
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  i18n.loadAndActivate({ locale: "en", messages: {} });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:video"),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("connects loaded video events and controls to the media element", async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();

  await act(async () => {
    root.render(
      <I18nProvider i18n={i18n}>
        <Provider>
          <VideoPlayer />
        </Provider>
      </I18nProvider>,
    );
  });

  const fileInput =
    container.querySelector<HTMLInputElement>('input[type="file"]');
  expect(fileInput).not.toBeNull();

  const file = new File(["video"], "sample.mp4", { type: "video/mp4" });
  Object.defineProperty(fileInput, "files", {
    configurable: true,
    value: [file],
  });

  await act(async () => {
    fileInput?.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const video = container.querySelector("video");
  expect(video).not.toBeNull();
  Object.defineProperty(video, "duration", {
    configurable: true,
    value: 120,
  });
  if (video) video.currentTime = 8;

  act(() => {
    video?.dispatchEvent(new Event("loadedmetadata"));
    video?.dispatchEvent(new Event("timeupdate"));
  });

  const seek = container.querySelector<HTMLInputElement>(
    'input[aria-label="Seek"]',
  );
  expect(seek?.max).toBe("120");
  expect(seek?.value).toBe("8");

  play.mockClear();
  const playButton = container.querySelector<HTMLButtonElement>(
    'button[title="Play"]',
  );
  await act(async () => {
    playButton?.click();
  });
  expect(play).toHaveBeenCalledOnce();
});
