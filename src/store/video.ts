import { atom, type Getter, type Setter } from "jotai";
import { atomWithReset, atomWithStorage } from "jotai/utils";
import { atomEffect } from "jotai-effect";

// MediaInfo is offloaded to a Web Worker to keep heavy parsing off the main thread.
// mediainfo.js is built without dynamic eval, so CSP does not need 'unsafe-eval'.
import MediainfoWorker from "../workers/mediainfo.worker?worker";

import { isVideoFile } from "../utils";
import type { MediaInfoMetadata } from "../utils/mediaInfo";

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
  const isSettingsPopoverOpen = get(settingsPopoverOpenAtom);

  if (!element || isSettingsPopoverOpen) {
    // No element registered or settings popover is open; nothing to toggle
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

// EFFECT ATOMS
export const videoUrlCleanupEffect = atomEffect((get) => {
  const url = get(videoUrlAtom);
  return () => {
    if (url) URL.revokeObjectURL(url);
  };
});

// Direct atom setters for manual video state updates
export const updateDurationAtom = atom(null, (_get, set, duration: number) => {
  set(durationAtom, duration);
});

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

// Keep the effect for URL cleanup only
export const videoElementSyncEffect = atomEffect((get, set) => {
  const element = get(videoElementAtom);
  if (!element) return;

  // Sync stored volume/mute state with video element when element is registered
  const storedVolume = get(volumeAtom);
  const storedMuted = get(isMutedAtom);
  const storedPlaybackRate = get(playbackRateAtom);
  const storedLoop = get(loopAtom);

  element.volume = storedVolume;
  element.muted = storedMuted;
  element.playbackRate = storedPlaybackRate;
  element.loop = storedLoop;

  const handleLoadedMetadata = () => {
    set(updateDurationAtom, element.duration);

    // Extract video metadata when metadata is loaded
    const file = get(videoFileAtom);
    if (file) {
      const ext = file.name.split(".").pop()?.toUpperCase();
      const metadata: MediaInfoMetadata = {
        duration: element.duration || 0,
        fileName: file.name,
        fileSize: file.size,
        containerFormat: file.type
          ? file.type.replace("video/", "").toUpperCase()
          : ext,
        // width/height from element if available
        videoWidth: element.videoWidth || undefined,
        videoHeight: element.videoHeight || undefined,
      };
      set(videoMetadataAtom, metadata);
    }
  };

  const handleTimeUpdate = () => {
    set(updateCurrentTimeAtom, element.currentTime);
  };

  const handlePlay = () => {
    set(updatePlayStateAtom, true);
  };

  const handlePause = () => {
    set(updatePlayStateAtom, false);
  };

  const handleEnded = () => {
    set(updatePlayStateAtom, false);
  };

  const handleVolumeChange = () => {
    // Only sync volume changes from external sources (not our programmatic changes)
    const currentVolume = get(volumeAtom);
    const currentMuted = get(isMutedAtom);

    // If element volume changed and doesn't match our current volume, update atoms
    if (element.volume !== currentVolume && element.volume > 0) {
      set(setVolumeAtom, element.volume);
    }

    // Update mute state if it changed
    if (element.muted !== currentMuted) {
      set(setMuteAtom, element.muted);
    }
  };

  const handleRateChange = () => {
    const currentRate = get(playbackRateAtom);
    if (element.playbackRate !== currentRate) {
      set(setPlaybackRateAtom, element.playbackRate);
    }
  };

  element.addEventListener("loadedmetadata", handleLoadedMetadata);
  element.addEventListener("timeupdate", handleTimeUpdate);
  element.addEventListener("play", handlePlay);
  element.addEventListener("pause", handlePause);
  element.addEventListener("ended", handleEnded);
  element.addEventListener("volumechange", handleVolumeChange);
  element.addEventListener("ratechange", handleRateChange);

  return () => {
    element.removeEventListener("loadedmetadata", handleLoadedMetadata);
    element.removeEventListener("timeupdate", handleTimeUpdate);
    element.removeEventListener("play", handlePlay);
    element.removeEventListener("pause", handlePause);
    element.removeEventListener("ended", handleEnded);
    element.removeEventListener("volumechange", handleVolumeChange);
    element.removeEventListener("ratechange", handleRateChange);
  };
});
