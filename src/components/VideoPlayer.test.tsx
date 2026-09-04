import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { Provider } from "jotai";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import VideoPlayer from "./VideoPlayer";

const workerMocks = vi.hoisted(() => ({
  constructed: vi.fn(),
  terminated: vi.fn(),
}));

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({ updateServiceWorker: vi.fn() }),
}));

vi.mock("../workers/mediainfo.worker?worker", () => ({
  default: class MockMediaInfoWorker {
    constructor() {
      workerMocks.constructed();
    }
    addEventListener() {}
    postMessage() {}
    removeEventListener() {}
    terminate() {
      workerMocks.terminated();
    }
  },
}));

let container: HTMLDivElement;
let root: Root | null;

beforeEach(() => {
  vi.clearAllMocks();
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
  if (root) {
    act(() => {
      root?.unmount();
    });
  }
  root = null;
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("connects loaded video events and controls to the media element", async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();

  await act(async () => {
    root?.render(
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
  expect(fileInput?.getAttribute("aria-label")).toBe("Open video file");
  expect(fileInput?.labels).toHaveLength(1);
  expect(fileInput?.labels?.[0]?.textContent).toBe("Open video file");

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

  const infoButton = container.querySelector<HTMLButtonElement>(
    'button[title="Video Information (I)"]',
  );
  act(() => {
    infoButton?.click();
  });

  const closeButton = document.body.querySelector<HTMLButtonElement>(
    'button[aria-label="Close"]',
  );
  expect(closeButton?.classList.contains("fluo-button-icon")).toBe(true);

  act(() => {
    closeButton?.click();
  });
  expect(
    document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Close"]',
    ),
  ).toBeNull();

  const settingsButton = container.querySelector<HTMLButtonElement>(
    'button[title="Settings"]',
  );
  act(() => {
    settingsButton?.click();
  });

  expect(document.body.textContent).toContain("Playback speed");
  const unbrandedButtons = [
    ...document.body.querySelectorAll(
      "button:not([data-headlessui-focus-guard])",
    ),
  ].filter((button) => !button.classList.contains("fluo-button-icon"));
  expect(unbrandedButtons.map((button) => button.outerHTML)).toEqual([]);

  play.mockClear();
  const playButton = container.querySelector<HTMLButtonElement>(
    'button[title="Play"]',
  );
  await act(async () => {
    playButton?.click();
  });
  expect(play).toHaveBeenCalledOnce();
});

test("owns global listeners and lifecycle effects once", async () => {
  const addEventListener = vi.spyOn(document, "addEventListener");
  const removeEventListener = vi.spyOn(document, "removeEventListener");

  await act(async () => {
    root?.render(
      <I18nProvider i18n={i18n}>
        <Provider>
          <VideoPlayer />
        </Provider>
      </I18nProvider>,
    );
  });

  const addedEvents = addEventListener.mock.calls.map(([event]) => event);
  expect(addedEvents.filter((event) => event === "keydown")).toHaveLength(1);
  expect(
    addedEvents.filter((event) => event === "fullscreenchange"),
  ).toHaveLength(1);
  expect(addedEvents).not.toContain("mousemove");
  expect(addedEvents).not.toContain("mouseleave");
  expect(workerMocks.constructed).toHaveBeenCalledOnce();

  act(() => {
    root?.unmount();
  });
  root = null;

  const removedEvents = removeEventListener.mock.calls.map(([event]) => event);
  expect(removedEvents.filter((event) => event === "keydown")).toHaveLength(1);
  expect(
    removedEvents.filter((event) => event === "fullscreenchange"),
  ).toHaveLength(1);
  expect(workerMocks.terminated).toHaveBeenCalledOnce();
});

test("cleans the controls visibility timer on unmount", async () => {
  vi.useFakeTimers();

  try {
    await act(async () => {
      root?.render(
        <I18nProvider i18n={i18n}>
          <Provider>
            <VideoPlayer />
          </Provider>
        </I18nProvider>,
      );
    });

    act(() => {
      vi.runOnlyPendingTimers();
    });

    const fileInput =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    const file = new File(["video"], "sample.mp4", { type: "video/mp4" });
    Object.defineProperty(fileInput, "files", {
      configurable: true,
      value: [file],
    });

    await act(async () => {
      fileInput?.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const video = container.querySelector("video");
    const player = container.querySelector("main");
    act(() => {
      video?.dispatchEvent(new Event("play", { bubbles: true }));
    });
    act(() => {
      player?.dispatchEvent(new Event("pointermove", { bubbles: true }));
    });

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    act(() => {
      root?.unmount();
    });
    root = null;

    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
