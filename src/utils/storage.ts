// Local storage helpers

export const getStoredVolume = (): number => {
  try {
    const stored = localStorage.getItem("videoPlayer.volume");
    const parsed = stored ? parseFloat(stored) : 1;
    return isNaN(parsed) ? 1 : Math.max(0, Math.min(1, parsed));
  } catch {
    return 1;
  }
};

export const getStoredMuted = (): boolean => {
  try {
    const stored = localStorage.getItem("videoPlayer.isMuted");
    return stored === "true";
  } catch {
    return false;
  }
};

export const setStoredVolume = (volume: number): void => {
  try {
    localStorage.setItem("videoPlayer.volume", volume.toString());
  } catch {
    // Ignore storage errors
  }
};

export const setStoredMuted = (muted: boolean): void => {
  try {
    localStorage.setItem("videoPlayer.isMuted", muted.toString());
  } catch {
    // Ignore storage errors
  }
};
