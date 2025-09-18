export const formatBitrate = (bitrate: number): string => {
  if (bitrate >= 1_000_000) {
    return `${(bitrate / 1_000_000).toFixed(1)} Mbps`;
  } else if (bitrate >= 1_000) {
    return `${(bitrate / 1_000).toFixed(0)} Kbps`;
  }
  return `${bitrate.toString()} bps`;
};

export const formatSampleRate = (sampleRate: number): string => {
  if (sampleRate >= 1_000) {
    return `${(sampleRate / 1_000).toFixed(1)} kHz`;
  }
  return `${sampleRate.toString()} Hz`;
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2)).toString()} ${sizes[i]}`;
};

/**
 * Format resolution with aspect ratio
 */
export const formatResolution = (width: number, height: number): string => {
  if (!width || !height) return "Unknown";

  // Calculate aspect ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const aspectWidth = width / divisor;
  const aspectHeight = height / divisor;

  return `${width.toString()}×${height.toString()} (${aspectWidth.toString()}:${aspectHeight.toString()})`;
};

export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString()}:${seconds.toString().padStart(2, "0")}`;
};
