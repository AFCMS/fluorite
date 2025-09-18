import { HiXMark } from "react-icons/hi2";
import { type VideoMetadata } from "../utils";
import {
  formatFileSize,
  formatResolution,
  formatBitrate,
  formatSampleRate,
  formatTime,
} from "../utils/format";

interface VideoInfoOverlayProps {
  isVisible: boolean;
  metadata: VideoMetadata | null;
  onClose: () => void;
}

export default function VideoInfoOverlay({
  isVisible,
  metadata,
  onClose,
}: VideoInfoOverlayProps) {
  if (!isVisible || !metadata) return null;

  const infoItems = [
    { label: "File Name", value: metadata.fileName ?? "Unknown" },
    { label: "Duration", value: formatTime(metadata.duration) },
    {
      label: "Resolution",
      value: formatResolution(metadata.videoWidth, metadata.videoHeight),
    },
    { label: "Container Format", value: metadata.containerFormat ?? "Unknown" },
    {
      label: "File Size",
      value: metadata.fileSize ? formatFileSize(metadata.fileSize) : "Unknown",
    },
  ];

  // Filter out unknown/empty values
  const validInfoItems = infoItems.filter(
    (item) => item.value && item.value !== "Unknown",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-gray-900/95 p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Video Information</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Information List */}
        <div className="space-y-4">
          {validInfoItems.map((item, index) => (
            <div
              key={index}
              className="flex justify-between border-b border-gray-700 pb-2"
            >
              <span className="text-gray-300">{item.label}:</span>
              <span className="font-medium text-white">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Additional technical info if available */}
        {(metadata.videoCodec ??
          metadata.audioCodec ??
          metadata.videoBitrate ??
          metadata.audioBitrate) && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-300">
              Technical Details
            </h3>
            <div className="space-y-2 text-sm">
              {metadata.videoCodec && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Video Codec:</span>
                  <span>
                    {metadata.videoProfile
                      ? `${metadata.videoCodec} (${metadata.videoProfile})`
                      : metadata.videoCodec}
                  </span>
                </div>
              )}
              {metadata.audioCodec && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Audio Codec:</span>
                  <span>{metadata.audioCodec}</span>
                </div>
              )}
              {metadata.videoFrameRate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Frame Rate:</span>
                  <span>{metadata.videoFrameRate.toFixed(2)} fps</span>
                </div>
              )}
              {metadata.videoBitrate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Video Bitrate:</span>
                  <span>{formatBitrate(metadata.videoBitrate)}</span>
                </div>
              )}
              {metadata.audioBitrate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Audio Bitrate:</span>
                  <span>{formatBitrate(metadata.audioBitrate)}</span>
                </div>
              )}
              {metadata.audioChannels && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Audio Channels:</span>
                  <span>{metadata.audioChannels}</span>
                </div>
              )}
              {metadata.audioSampleRate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Sample Rate:</span>
                  <span>{formatSampleRate(metadata.audioSampleRate)}</span>
                </div>
              )}
              {metadata.videoColorSpace && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Color Space:</span>
                  <span>{metadata.videoColorSpace}</span>
                </div>
              )}
              {metadata.videoBitDepth && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Bit Depth:</span>
                  <span>{metadata.videoBitDepth} bits</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Encoding information */}
        {(metadata.encoder ?? metadata.creationTime) && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-300">
              Encoding Information
            </h3>
            <div className="space-y-2 text-sm">
              {metadata.encoder && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Encoder:</span>
                  <span
                    className="max-w-48 truncate text-right"
                    title={metadata.encoder}
                  >
                    {metadata.encoder}
                  </span>
                </div>
              )}
              {metadata.creationTime && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span>
                    {new Date(metadata.creationTime).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
