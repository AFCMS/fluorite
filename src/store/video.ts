import { atom, type Getter, type Setter } from "jotai";
import { atomEffect } from "jotai-effect";
import { atomWithReset, atomWithStorage } from "jotai/utils";

import { isVideoFile } from "../utils";
import type { MediaInfoMetadata } from "../utils/mediaInfo";
// MediaInfo is offloaded to a Web Worker to keep heavy parsing off the main thread.
// mediainfo.js is built without dynamic eval, so CSP does not need 'unsafe-eval'.
// oxlint-disable-next-line import/default
import MediainfoWorker from "../workers/mediainfo.worker?worker";

// DATA ATOMS
export const videoFileAtom = atomWithReset<File | null>(null);
export const videoUrlAtom = atomWithReset<string | null>(null);
export const videoErrorAtom = atomWithReset<string | null>(null);
export const videoElementAtom = atom<HTMLVideoElement | null>(null);

// PLAYBACK STATE ATOMS
export const isPlayingAtom = atom(false);
export const currentTimeAtom = atom(0);
export const durationAtom = atom(0);
export const volumeAtom = atomWithStorage("fluorite:volume", 1);
export const isMutedAtom = atomWithStorage("fluorite:muted", false);
export const isSeekingAtom = atom(false);
export const playbackRateAtom = atomWithStorage("fluorite:playbackRate", 1);
export const loopAtom = atomWithStorage("fluorite:loop", false);

// UI STATE ATOMS
export const showControlsAtom = atom(true);
export const isFullscreenAtom = atom(false);
export const isDragOverAtom = atom(false);
export const settingsPopoverOpenAtom = atom(false);

// DERIVED ATOMS
export const videoIsLoadedAtom = atom(
  (get) => !!(get(videoFileAtom) && get(videoUrlAtom)),
);

export const canPlayAtom = atom(
  (get) => !!(get(videoUrlAtom) && get(videoElementAtom)),
);

export const isEndedAtom = atom((get) => {
  if (!get(videoUrlAtom) || get(isPlayingAtom)) return false;

  const duration = get(durationAtom);
  return duration > 0 && get(currentTimeAtom) >= Math.max(0, duration - 0.2);
});

// METADATA ATOMS
export const videoMetadataAtom = atom<MediaInfoMetadata | null>(null);

export const hasVideoMetadataAtom = atom(
  (get) => get(videoMetadataAtom) !== null,
);

// Worker instance and a request counter for correlating responses
const mediaInfoWorkerAtom = atom<Worker | null>(null);
let workerReqId = 0;
export const mediaInfoMetadataAtom = atom<MediaInfoMetadata | null>(null);

// Initialize a single MediaInfo instance for the app lifecycle and clean it up on unmount
export const mediaInfoInitEffect = atomEffect((_get: Getter, set: Setter) => {
  // Lazily create one worker
  const worker = new MediainfoWorker();
  set(mediaInfoWorkerAtom, worker);

  worker.postMessage({ id: ++workerReqId, type: "warmup" });

  return () => {
    try {
      worker.terminate();
    } catch {
      // ignore
    }
    set(mediaInfoWorkerAtom, null);
  };
});

// EFFECT: Extract detailed metadata with MediaInfo when a file is set
export const mediaInfoExtractEffect = atomEffect((get: Getter, set: Setter) => {
  const worker = get(mediaInfoWorkerAtom);
  const file = get(videoFileAtom);

  if (!worker || !file) {
    set(mediaInfoMetadataAtom, null);
    return;
  }

  let canceled = false;
  const id = ++workerReqId;

  interface WorkerMsg {
    id?: number;
    type?: string;
    metadata?: MediaInfoMetadata | null;
    message?: string;
  }
  const handleMessage = (evt: MessageEvent<WorkerMsg>) => {
    const data = evt.data;
    if (data.id !== id) return;
    if (canceled) return;
    if (data.type === "metadata") {
      set(mediaInfoMetadataAtom, data.metadata ?? null);
      worker.removeEventListener("message", handleMessage);
    } else if (data.type === "error") {
      console.warn("MediaInfo worker error:", data.message);
      set(mediaInfoMetadataAtom, null);
      worker.removeEventListener("message", handleMessage);
    }
  };

  worker.addEventListener("message", handleMessage);
  worker.postMessage({ id, type: "analyze", file });

  return () => {
    canceled = true;
    try {
      worker.removeEventListener("message", handleMessage);
    } catch {
      // ignore
    }
  };
});

// ACTION ATOMS
export const videoFileSetAtom = atom(null, (_get, set, file: File) => {
  if (!isVideoFile(file)) {
    set(videoErrorAtom, "Invalid video file");
    return;
  }

  const url = URL.createObjectURL(file);
  set(videoFileAtom, file);
  set(videoUrlAtom, url);
  set(videoErrorAtom, null);

  // Reset playback state
  set(isPlayingAtom, false);
  set(currentTimeAtom, 0);
  set(durationAtom, 0);

  // Reset metadata (will be populated when video loads)
  set(videoMetadataAtom, null);
  set(mediaInfoMetadataAtom, null);
});

export const togglePlayPauseAtom = atom(null, (get) => {
  const element = get(videoElementAtom);

  if (!element) {
    return;
  }

  // Use the video element's paused property directly instead of atom state
  // to avoid race conditions with events
  if (element.paused) {
    element.play().catch(console.error);
  } else {
    element.pause();
  }
});

export const seekToAtom = atom(null, (get, set, time: number) => {
  const element = get(videoElementAtom);
  if (!element) {
    // No element registered; cannot seek
    return;
  }
  element.currentTime = time;
  set(currentTimeAtom, time);
});

// Derived atom for the "real" applied volume (0 if muted, volume otherwise)
export const effectiveVolumeAtom = atom((get) => {
  const volume = get(volumeAtom);
  const isMuted = get(isMutedAtom);
  return isMuted ? 0 : volume;
});

export const setVolumeAtom = atom(null, (get, set, volume: number) => {
  const element = get(videoElementAtom);
  const clamped = Math.max(0, Math.min(1, volume));

  set(volumeAtom, clamped);

  // Apply the effective volume to the element
  if (element) {
    const isMuted = get(isMutedAtom);
    element.volume = isMuted ? 0 : clamped;
  }
});

export const setPlaybackRateAtom = atom(null, (get, set, rate: number) => {
  const element = get(videoElementAtom);
  const clamped = Math.max(0.25, Math.min(4, rate));
  set(playbackRateAtom, clamped);
  if (element) {
    element.playbackRate = clamped;
  }
});

export const setLoopAtom = atom(null, (get, set, loop: boolean) => {
  const element = get(videoElementAtom);
  set(loopAtom, loop);
  if (element) {
    element.loop = loop;
  }
});

export const setMuteAtom = atom(null, (get, set, muted: boolean) => {
  const element = get(videoElementAtom);

  set(isMutedAtom, muted);

  // Apply the effective volume to the element
  if (element) {
    const volume = get(volumeAtom);
    element.volume = muted ? 0 : volume;
    element.muted = muted;
  }
});

export const toggleMuteAtom = atom(null, (get, set) => {
  const isMuted = get(isMutedAtom);
  set(setMuteAtom, !isMuted);
});

export const toggleLoopAtom = atom(null, (get, set) => {
  const loop = get(loopAtom);
  set(setLoopAtom, !loop);
});

export const togglePictureInPictureAtom = atom(null, async (get) => {
  const element = get(videoElementAtom);

  if (!element) {
    return;
  }

  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await element.requestPictureInPicture();
    }
  } catch (error) {
    console.error("Failed to toggle Picture-in-Picture:", error);
  }
});

export const registerVideoElementAtom = atom(
  null,
  (get, set, element: HTMLVideoElement | null) => {
    set(videoElementAtom, element);
    if (!element) return;

    element.volume = get(volumeAtom);
    element.muted = get(isMutedAtom);
    element.playbackRate = get(playbackRateAtom);
    element.loop = get(loopAtom);
  },
);

// EFFECT ATOMS
export const videoUrlCleanupEffect = atomEffect((get) => {
  const url = get(videoUrlAtom);
  return () => {
    if (url) URL.revokeObjectURL(url);
  };
});

// Direct atom setters for video element events
export const updateLoadedMetadataAtom = atom(
  null,
  (get, set, element: HTMLVideoElement) => {
    set(durationAtom, element.duration);

    const file = get(videoFileAtom);
    if (!file) return;

    const ext = file.name.split(".").pop()?.toUpperCase();
    set(videoMetadataAtom, {
      duration: element.duration || 0,
      fileName: file.name,
      fileSize: file.size,
      containerFormat: file.type
        ? file.type.replace("video/", "").toUpperCase()
        : ext,
      videoWidth: element.videoWidth || undefined,
      videoHeight: element.videoHeight || undefined,
    });
  },
);

export const updateCurrentTimeAtom = atom(null, (get, set, time: number) => {
  if (!get(isSeekingAtom)) {
    set(currentTimeAtom, time);
  }
});

export const updatePlayStateAtom = atom(null, (_get, set, playing: boolean) => {
  set(isPlayingAtom, playing);
});

export const updateVolumeStateAtom = atom(
  null,
  (_get, set, { volume, muted }: { volume: number; muted: boolean }) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set(volumeAtom, clamped);
    set(isMutedAtom, muted);
  },
);

export const updatePlaybackRateStateAtom = atom(
  null,
  (_get, set, rate: number) => {
    set(playbackRateAtom, Math.max(0.25, Math.min(4, rate)));
  },
);
