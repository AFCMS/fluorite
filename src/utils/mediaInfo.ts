export interface MediaInfoMetadata {
  readonly title?: string;
  /**
   * Codec format (e.g., AV1, H.264) of the first video track.
   */
  readonly videoCodec?: string;
  readonly videoHeight?: number;
  readonly videoWidth?: number;
  /**
   * Frame rate (in frames per second) of the first video track.
   */
  readonly videoFrameRate?: number;
  readonly videoBitrate?: number;
  readonly videoColorSpace?: string;
  readonly videoProfile?: string;
  readonly videoBitDepth?: number;
  /**
   * Codec format (e.g., AAC, Opus) of the first audio track.
   */
  readonly audioCodec?: string;
  readonly audioBitrate?: number;
  readonly audioSampleRate?: number;
  readonly audioChannels?: number;

  // File/container level
  readonly containerFormat?: string;
  readonly fileSize?: number;
  readonly fileName?: string;
  readonly duration?: number; // seconds
}
