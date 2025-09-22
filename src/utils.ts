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
