/**
 * Utility functions for the video player application
 */

export const STORAGE_KEYS = {
  VOLUME: "videoPlayer.volume",
  IS_MUTED: "videoPlayer.isMuted",
  LAST_POSITION: "videoPlayer.lastPosition",
  PLAYBACK_RATE: "videoPlayer.playbackRate",
} as const;

/**
 * Safely get a value from localStorage with error handling
 */
export const getFromStorage = (key: string, defaultValue = ""): string => {
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Safely set a value in localStorage with error handling
 */
export const setInStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to store ${key} in localStorage:`, error);
  }
};

/**
 * Get volume from localStorage with validation
 */
export const getStoredVolume = (): number => {
  const stored = getFromStorage(STORAGE_KEYS.VOLUME);
  if (stored) {
    const volume = parseFloat(stored);
    return isNaN(volume) ? 1 : Math.max(0, Math.min(1, volume));
  }
  return 1; // Default volume
};

/**
 * Store volume in localStorage
 */
export const storeVolume = (volume: number): void => {
  setInStorage(STORAGE_KEYS.VOLUME, volume.toString());
};

/**
 * Get mute state from localStorage
 */
export const getStoredMuteState = (): boolean => {
  return getFromStorage(STORAGE_KEYS.IS_MUTED) === "true";
};

/**
 * Store mute state in localStorage
 */
export const storeMuteState = (isMuted: boolean): void => {
  setInStorage(STORAGE_KEYS.IS_MUTED, isMuted.toString());
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Check if a file is a video file
 */
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
