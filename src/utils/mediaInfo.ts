// Simplified metadata interface - only duration for now as requested
export interface VideoMetadata {
  duration: number;
  fileName: string;
  fileSize: number;
}

// Simple metadata extraction using HTML5 video element
export const extractVideoMetadata = async (
  file: File,
): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve({
        duration: video.duration || 0,
        fileName: file.name,
        fileSize: file.size,
      });
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video metadata"));
    });

    video.src = url;
  });
};

// Keep the old interface for compatibility but mark as deprecated
/** @deprecated Use VideoMetadata instead. This will be removed in favor of simpler metadata. */
export interface DetailedVideoMetadata {
  duration: number;
  videoWidth: number;
  videoHeight: number;
  fileSize: number;
  fileName: string;
  containerFormat: string;
  videoCodec?: string;
  videoProfile?: string;
  videoBitrate?: number;
  videoFrameRate?: number;
  videoColorSpace?: string;
  videoBitDepth?: number;
  audioCodec?: string;
  audioBitrate?: number;
  audioChannels?: number;
  audioSampleRate?: number;
  creationTime?: string;
  encoder?: string;
}

/** @deprecated Use extractVideoMetadata instead. MediaInfo.js integration is temporarily disabled. */
export const extractDetailedVideoMetadata = async (
  file: File,
): Promise<DetailedVideoMetadata> => {
  // Fallback to basic metadata using HTML5 video element
  const basicMetadata = await extractVideoMetadata(file);

  return {
    ...basicMetadata,
    videoWidth: 0,
    videoHeight: 0,
    containerFormat: file.type
      ? file.type.replace("video/", "").toUpperCase()
      : "Unknown",
  };
};

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
