export const STORAGE_KEYS = {
  VOLUME: "videoPlayer.volume",
  IS_MUTED: "videoPlayer.isMuted",
  LAST_POSITION: "videoPlayer.lastPosition",
  PLAYBACK_RATE: "videoPlayer.playbackRate",
} as const;

export const getFromStorage = (key: string, defaultValue = ""): string => {
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setInStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to store ${key} in localStorage:`, error);
  }
};

export const getStoredVolume = (): number => {
  const stored = getFromStorage(STORAGE_KEYS.VOLUME);
  if (stored) {
    const volume = parseFloat(stored);
    return isNaN(volume) ? 1 : Math.max(0, Math.min(1, volume));
  }
  return 1; // Default volume
};

export const storeVolume = (volume: number): void => {
  setInStorage(STORAGE_KEYS.VOLUME, volume.toString());
};

export const getStoredMuteState = (): boolean => {
  return getFromStorage(STORAGE_KEYS.IS_MUTED) === "true";
};

export const storeMuteState = (isMuted: boolean): void => {
  setInStorage(STORAGE_KEYS.IS_MUTED, isMuted.toString());
};

export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith("video/");
};

/**
 * Debounce function for limiting the rate of function calls
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

/**
 * Video metadata information (legacy interface for compatibility)
 */
export interface VideoMetadata {
  duration: number;
  videoWidth: number;
  videoHeight: number;
  videoFrameRate?: number;
  videoCodec?: string;
  audioCodec?: string;
  containerFormat?: string;
  fileSize?: number;
  fileName?: string;
  // Additional detailed metadata from MediaInfo
  videoProfile?: string;
  videoBitrate?: number;
  videoColorSpace?: string;
  videoBitDepth?: number;
  audioBitrate?: number;
  audioChannels?: number;
  audioSampleRate?: number;
  creationTime?: string;
  encoder?: string;
}

/**
 * Extract metadata from video element (basic fallback)
 */
export const extractVideoMetadata = (
  video: HTMLVideoElement,
  file?: File,
): VideoMetadata => {
  const metadata: VideoMetadata = {
    duration: video.duration || 0,
    videoWidth: video.videoWidth || 0,
    videoHeight: video.videoHeight || 0,
  };

  // Add file-specific metadata if available
  if (file) {
    metadata.fileSize = file.size;
    metadata.fileName = file.name;

    // Extract container format from file type or extension
    if (file.type) {
      metadata.containerFormat = file.type.replace("video/", "").toUpperCase();
    } else {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension) {
        metadata.containerFormat = extension.toUpperCase();
      }
    }
  }

  return metadata;
};
