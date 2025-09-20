export interface MediaInfoMetadata {
  title?: string;
  /**
   * Codec format (e.g., AV1, H.264) of the first video track.
   */
  videoCodec?: string;
  videoHeight?: number;
  videoWidth?: number;
  /**
   * Frame rate (in frames per second) of the first video track.
   */
  videoFrameRate?: number;
  videoBitrate?: number;
  videoColorSpace?: string;
  videoProfile?: string;
  videoBitDepth?: number;
  /**
   * Codec format (e.g., AAC, Opus) of the first audio track.
   */
  audioCodec?: string;
  audioBitrate?: number;
  audioSampleRate?: number;
  audioChannels?: number;

  // File/container level
  containerFormat?: string;
  fileSize?: number;
  fileName?: string;
  duration?: number; // seconds
}
