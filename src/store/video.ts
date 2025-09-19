import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { atomEffect } from "jotai-effect";
import mediaInfoFactory from "mediainfo.js";
import type { MediaInfo } from "mediainfo.js";

import { isVideoFile } from "../utils";
import {
  getStoredVolume,
  setStoredVolume,
  getStoredMuted,
  setStoredMuted,
} from "../utils/storage";
import type { MediaInfoMetadata, VideoMetadata } from "../utils/mediaInfo";

// DATA ATOMS
export const videoFileAtom = atomWithReset<File | null>(null);
export const videoUrlAtom = atomWithReset<string | null>(null);
export const videoErrorAtom = atomWithReset<string | null>(null);
export const videoElementAtom = atom<HTMLVideoElement | null>(null);

// PLAYBACK STATE ATOMS
export const isPlayingAtom = atom(false);
export const currentTimeAtom = atom(0);
export const durationAtom = atom(0);
export const volumeAtom = atom(getStoredVolume());
export const isMutedAtom = atom(getStoredMuted());
export const isSeekingAtom = atom(false);

// UI STATE ATOMS
export const showControlsAtom = atom(true);
export const isFullscreenAtom = atom(false);
export const isDragOverAtom = atom(false);

// DERIVED ATOMS
export const videoIsLoadedAtom = atom(
  (get) => !!(get(videoFileAtom) && get(videoUrlAtom)),
);

export const canPlayAtom = atom(
  (get) => !!(get(videoUrlAtom) && get(videoElementAtom)),
);

// METADATA ATOMS
export const videoMetadataAtom = atom<VideoMetadata | null>(null);

export const hasVideoMetadataAtom = atom(
  (get) => get(videoMetadataAtom) !== null,
);

export const mediaInfoInstanceAtom = atom<MediaInfo | null>(null);
export const mediaInfoMetadataAtom = atom<MediaInfoMetadata | null>(null);

// Initialize a single MediaInfo instance for the app lifecycle and clean it up on unmount
export const mediaInfoInitEffect = atomEffect((_get, set) => {
  let instance: MediaInfo | null = null;
  let closed = false;

  // Create the MediaInfo instance (object format is easier to consume programmatically)
  void mediaInfoFactory({
    format: "object" as const,
  })
    .then((mi) => {
      if (closed) {
        // If effect already cleaned up, immediately close the created instance
        try {
          mi.close();
        } catch {
          // ignore
        }
        return;
      }
      instance = mi;
      set(mediaInfoInstanceAtom, mi);
    })
    .catch((error: unknown) => {
      console.error("Failed to initialize MediaInfo:", error);
      set(mediaInfoInstanceAtom, null);
    });

  return () => {
    closed = true;
    if (instance) {
      try {
        instance.close();
      } catch {
        // ignore
      }
    }
    set(mediaInfoInstanceAtom, null);
  };
});

// Helper to parse numeric strings that may contain units (e.g., "1 920 pixels", "48 000 KHz")
const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[, ]/g, "");
    const match = /^[0-9]+(?:\.[0-9]+)?/.exec(cleaned);
    if (match) return Number(match[0]);
  }
  return undefined;
};

// Minimal shape of mediainfo.js object output when using { format: 'object' }
interface MediaInfoTrack {
  "@type"?: string;
  Title?: string;
  Format?: string;
  CodecID?: string;
  Height?: string | number;
  Width?: string | number;
  FrameRate?: string | number;
  BitRate?: string | number;
  ColorSpace?: string;
  SamplingRate?: string | number;
}

interface MediaInfoObjectResult {
  media?: {
    track?: MediaInfoTrack[];
  };
}

// EFFECT: Extract detailed metadata with MediaInfo when a file is set
export const mediaInfoExtractEffect = atomEffect((get, set) => {
  const mi = get(mediaInfoInstanceAtom);
  const file = get(videoFileAtom);

  // If no instance or file, clear metadata and stop
  if (!mi || !file) {
    set(mediaInfoMetadataAtom, null);
    return;
  }

  let canceled = false;

  // analyzeData reads the file in chunks via the provided reader
  void mi
    .analyzeData(file.size, async (chunkSize: number, offset: number) => {
      const blob = file.slice(offset, offset + chunkSize);
      const buf = await blob.arrayBuffer();
      return new Uint8Array(buf);
    })
    .then((result: unknown) => {
      if (canceled) return;

      // result is the object output by mediainfo.js
      const mediaObj = result as MediaInfoObjectResult;
      const tracks = mediaObj.media?.track ?? [];

      const general: MediaInfoTrack | undefined = tracks.find(
        (t) => t["@type"] === "General",
      );
      const video: MediaInfoTrack | undefined = tracks.find(
        (t) => t["@type"] === "Video",
      );
      const audio: MediaInfoTrack | undefined = tracks.find(
        (t) => t["@type"] === "Audio",
      );

      const mapped: MediaInfoMetadata = {
        title: general?.Title,
        videoCodec: video?.Format ?? video?.CodecID,
        videoHeight: parseNumber(video?.Height),
        videoWidth: parseNumber(video?.Width),
        videoFrameRate: parseNumber(video?.FrameRate),
        videoBitrate: parseNumber(video?.BitRate),
        videoColorSpace: video?.ColorSpace,
        audioCodec: audio?.Format ?? audio?.CodecID,
        audioBitrate: parseNumber(audio?.BitRate),
        audioSampleRate: parseNumber(audio?.SamplingRate),
      };

      set(mediaInfoMetadataAtom, mapped);
    })
    .catch((err: unknown) => {
      if (canceled) return;
      console.warn("MediaInfo analyzeData failed:", err);
      set(mediaInfoMetadataAtom, null);
    });

  return () => {
    canceled = true;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const togglePlayPauseAtom = atom(null, (get, _set) => {
  const element = get(videoElementAtom);

  if (!element) {
    console.log("togglePlayPause: No video element found");
    return;
  }

  console.log("togglePlayPause: Current paused state:", element.paused);

  // Use the video element's paused property directly instead of atom state
  // to avoid race conditions with events
  if (element.paused) {
    console.log("togglePlayPause: Starting playback");
    element.play().catch(console.error);
  } else {
    console.log("togglePlayPause: Pausing playback");
    element.pause();
  }
});

export const seekToAtom = atom(null, (get, set, time: number) => {
  const element = get(videoElementAtom);
  if (!element) {
    console.log("seekTo: No video element found");
    return;
  }

  console.log("seekTo: Seeking to", time);
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

  set(volumeAtom, volume);
  setStoredVolume(volume); // Persist to localStorage

  // Apply the effective volume to the element
  if (element) {
    const isMuted = get(isMutedAtom);
    element.volume = isMuted ? 0 : volume;
  }
});

export const setMuteAtom = atom(null, (get, set, muted: boolean) => {
  const element = get(videoElementAtom);

  set(isMutedAtom, muted);
  setStoredMuted(muted); // Persist to localStorage

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

// EFFECT ATOMS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const videoUrlCleanupEffect = atomEffect((get, _set) => {
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
    set(volumeAtom, volume);
    set(isMutedAtom, muted);

    // Persist to localStorage when volume/mute state changes
    setStoredVolume(volume);
    setStoredMuted(muted);
  },
);

// Keep the effect for URL cleanup only
export const videoElementSyncEffect = atomEffect((get, set) => {
  const element = get(videoElementAtom);
  if (!element) return;

  // Sync stored volume/mute state with video element when element is registered
  const storedVolume = get(volumeAtom);
  const storedMuted = get(isMutedAtom);

  element.volume = storedVolume;
  element.muted = storedMuted;

  const handleLoadedMetadata = () => {
    set(updateDurationAtom, element.duration);

    // Extract video metadata when metadata is loaded
    const file = get(videoFileAtom);
    if (file) {
      const metadata: VideoMetadata = {
        duration: element.duration || 0,
        fileName: file.name,
        fileSize: file.size,
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

  element.addEventListener("loadedmetadata", handleLoadedMetadata);
  element.addEventListener("timeupdate", handleTimeUpdate);
  element.addEventListener("play", handlePlay);
  element.addEventListener("pause", handlePause);
  element.addEventListener("ended", handleEnded);
  element.addEventListener("volumechange", handleVolumeChange);

  return () => {
    element.removeEventListener("loadedmetadata", handleLoadedMetadata);
    element.removeEventListener("timeupdate", handleTimeUpdate);
    element.removeEventListener("play", handlePlay);
    element.removeEventListener("pause", handlePause);
    element.removeEventListener("ended", handleEnded);
    element.removeEventListener("volumechange", handleVolumeChange);
  };
});
