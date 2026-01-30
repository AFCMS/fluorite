import { useState, type ChangeEvent } from "react";
import { useLingui } from "@lingui/react/macro";
import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiFolderOpen,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
  HiInformationCircle,
  HiArrowPath,
} from "react-icons/hi2";

import {
  useVideoActions,
  useVideoUrl,
  useVideoState,
  useUIControls,
} from "../hooks";
import { formatTime } from "../utils/format";
import { SettingsPopover } from "./Settings/SettingsPopover";

interface ControlBarProps {
  onOpenFile: () => void;
  onToggleVideoInfo: () => void;
}

export default function ControlBar(props: ControlBarProps) {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  // Get data from atoms via hooks
  const videoActions = useVideoActions();
  const videoUrl = useVideoUrl();
  const videoState = useVideoState();
  const uiControls = useUIControls();
  const isEnded =
    !!videoUrl &&
    !videoState.isPlaying &&
    videoState.duration > 0 &&
    videoState.currentTime >= Math.max(0, videoState.duration - 0.2);

  // Local handlers
  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(event.target.value);
    videoActions.seekTo(time);
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);

    // If user drags slider and volume > 0, unmute first
    if (volume > 0 && videoState.isMuted) {
      videoActions.setMute(false);
    }

    // Set the volume
    videoActions.setVolume(volume);
  };

  const handleMouseEnterControls = () => {
    uiControls.showControlsTemporarily();
  };

  // Lingui macro
  const { t } = useLingui();

  return (
    <div
      className={`absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 via-black/60 to-transparent px-4 py-0 text-blue-100 transition-all duration-300 ${
        uiControls.showControls
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
      onMouseEnter={handleMouseEnterControls}
      onMouseLeave={() => {
        /* Auto-hide handled by useUIControls */
      }}
    >
      {/* Progress Bar */}
      <div className="flex items-center space-x-3">
        <span className="min-w-10 font-mono text-sm">
          {formatTime(videoState.currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={videoState.duration || 0}
          step="0.1"
          value={videoState.currentTime}
          onChange={handleSeek}
          onKeyDown={(e) => {
            // Prevent arrow / home / end / page keys from moving the slider while focused
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "PageUp",
                "PageDown",
              ].includes(e.key)
            ) {
              e.preventDefault();
            }
          }}
          className="range-styled w-full"
          disabled={!videoUrl}
          aria-label="Seek"
        />
        <span className="min-w-10 font-mono text-sm">
          {formatTime(videoState.duration)}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Play/Pause Button */}
          <button
            onClick={videoActions.togglePlayPause}
            disabled={!videoUrl}
            className="button-styled h-12 w-12"
            title={
              videoState.isPlaying ? t`Pause` : isEnded ? t`Replay` : t`Play`
            }
          >
            {videoState.isPlaying ? (
              <HiPause className="h-7 w-7" />
            ) : isEnded ? (
              <HiArrowPath className="h-7 w-7" />
            ) : (
              <HiPlay className="h-7 w-7" />
            )}
          </button>

          {/* Volume Controls */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => {
              setIsVolumeHovered(true);
            }}
            onMouseLeave={() => {
              setIsVolumeHovered(false);
            }}
          >
            <button
              onClick={videoActions.toggleMute}
              disabled={!videoUrl}
              className="button-styled h-12 w-12"
              title={videoState.isMuted ? t`Unmute` : t`Mute`}
            >
              {videoState.effectiveVolume === 0 ? (
                <HiSpeakerXMark className="h-5 w-5" />
              ) : (
                <HiSpeakerWave className="h-5 w-5" />
              )}
            </button>
            <div
              className={`flex h-12 items-center justify-center overflow-hidden transition-all duration-300 ${
                isVolumeHovered
                  ? "ml-2 max-w-20 opacity-100"
                  : "ml-0 max-w-0 opacity-0"
              }`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={videoState.effectiveVolume}
                onChange={handleVolumeChange}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                disabled={!videoUrl}
                className="range-styled w-20 overflow-visible"
                aria-label={t`Volume`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={props.onToggleVideoInfo}
            disabled={!videoUrl}
            className="button-styled h-12 w-12"
            title={t`Video Information` + " (I)"}
          >
            <HiInformationCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              void uiControls.toggleFullscreen();
            }}
            className="button-styled h-12 w-12"
            title={
              uiControls.isFullscreen
                ? t`Exit fullscreen` + " (F)"
                : t`Enter fullscreen` + " (F)"
            }
          >
            {uiControls.isFullscreen ? (
              <HiArrowsPointingIn className="h-5 w-5" />
            ) : (
              <HiArrowsPointingOut className="h-5 w-5" />
            )}
          </button>
          <SettingsPopover />
          <button
            onClick={props.onOpenFile}
            className="button-styled h-12 w-12"
            title={t`Open File` + " (O)"}
          >
            <HiFolderOpen className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
