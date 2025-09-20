import { HiXMark } from "react-icons/hi2";
import type { MediaInfoMetadata } from "../utils/mediaInfo";
import {
  formatFileSize,
  formatResolution,
  formatBitrate,
  formatSampleRate,
  formatTime,
} from "../utils/format";

interface VideoInfoOverlayProps {
  isVisible: boolean;
  metadata: MediaInfoMetadata | null;
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
    { label: "Duration", value: formatTime(metadata.duration ?? 0) },
    {
      label: "Resolution",
      value: formatResolution(
        metadata.videoWidth ?? 0,
        metadata.videoHeight ?? 0,
      ),
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

  const hasVideoDetails = [
    metadata.videoCodec,
    metadata.videoFrameRate,
    metadata.videoBitrate,
    metadata.videoColorSpace,
    metadata.videoBitDepth,
  ].some((v) => v != null);

  const hasAudioDetails = [
    metadata.audioCodec,
    metadata.audioBitrate,
    metadata.audioChannels,
    metadata.audioSampleRate,
  ].some((v) => v != null);

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
              className="flex items-start justify-between gap-4 border-b border-gray-700 pb-2"
            >
              <span className="shrink-0 whitespace-nowrap text-gray-300">
                {item.label}:
              </span>
              <span className="text-right font-medium break-words text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Video / Audio technical details */}
        {(hasVideoDetails || hasAudioDetails) && (
          <div className="mt-6 space-y-6">
            {/* Video Details */}
            {hasVideoDetails && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">
                  Video Details
                </h3>
                <div className="space-y-2 text-sm">
                  {metadata.videoCodec && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Codec:
                      </span>
                      <span className="text-right">
                        {metadata.videoProfile
                          ? `${metadata.videoCodec} (${metadata.videoProfile})`
                          : metadata.videoCodec}
                      </span>
                    </div>
                  )}
                  {metadata.videoBitrate && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Bitrate:
                      </span>
                      <span className="text-right">
                        {formatBitrate(metadata.videoBitrate)}
                      </span>
                    </div>
                  )}
                  {metadata.videoFrameRate && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Frame Rate:
                      </span>
                      <span className="text-right">
                        {metadata.videoFrameRate.toFixed(2)} fps
                      </span>
                    </div>
                  )}
                  {metadata.videoColorSpace && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Color Space:
                      </span>
                      <span className="text-right">
                        {metadata.videoColorSpace}
                      </span>
                    </div>
                  )}
                  {metadata.videoBitDepth && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Bit Depth:
                      </span>
                      <span className="text-right">
                        {metadata.videoBitDepth} bits
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audio Details */}
            {hasAudioDetails && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">
                  Audio Details
                </h3>
                <div className="space-y-2 text-sm">
                  {metadata.audioCodec && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Codec:
                      </span>
                      <span className="text-right">{metadata.audioCodec}</span>
                    </div>
                  )}
                  {metadata.audioBitrate && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Bitrate:
                      </span>
                      <span className="text-right">
                        {formatBitrate(metadata.audioBitrate)}
                      </span>
                    </div>
                  )}
                  {metadata.audioChannels && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Channels:
                      </span>
                      <span className="text-right">
                        {metadata.audioChannels}
                      </span>
                    </div>
                  )}
                  {metadata.audioSampleRate && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 whitespace-nowrap text-gray-400">
                        Sample Rate:
                      </span>
                      <span className="text-right">
                        {formatSampleRate(metadata.audioSampleRate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
