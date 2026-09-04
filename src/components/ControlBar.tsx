import { useLingui } from "@lingui/react/macro";
import { useState } from "react";
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
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";

import {
  useVideoActions,
  useVideoUrl,
  useVideoState,
  useUIControls,
} from "../hooks";
import { FluoButtonIcon } from "./branded/FluoButtonIcon";
import { FluoSlider } from "./branded/FluoSlider";
import { ControlBarSeek } from "./ControlBarSeek";
import { SettingsPopover } from "./Settings/SettingsPopover";

interface ControlBarProps {
  readonly onOpenFile: () => void;
  readonly onToggleVideoInfo: () => void;
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
  const handleVolumeChange = (volume: number) => {
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
      <ControlBarSeek />

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Play/Pause Button */}
          <FluoButtonIcon
            onClick={videoActions.togglePlayPause}
            disabled={!videoUrl}
            className="h-12 w-12 justify-center"
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
          </FluoButtonIcon>

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
            <FluoButtonIcon
              onClick={videoActions.toggleMute}
              disabled={!videoUrl}
              className="h-12 w-12 justify-center"
              title={videoState.isMuted ? t`Unmute` : t`Mute`}
            >
              {videoState.effectiveVolume === 0 ? (
                <HiSpeakerXMark className="h-5 w-5" />
              ) : (
                <HiSpeakerWave className="h-5 w-5" />
              )}
            </FluoButtonIcon>
            <div
              className={`flex h-12 items-center justify-center overflow-hidden transition-all duration-300 ${
                isVolumeHovered
                  ? "ml-2 max-w-20 opacity-100"
                  : "ml-0 max-w-0 opacity-0"
              }`}
            >
              <FluoSlider
                min={0}
                max={1}
                step={0.1}
                value={videoState.effectiveVolume}
                onChange={handleVolumeChange}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                disabled={!videoUrl}
                className="w-20 overflow-visible"
                aria-label={t`Volume`}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <FluoButtonIcon
            onClick={props.onToggleVideoInfo}
            disabled={!videoUrl}
            className="h-12 w-12 justify-center"
            title={t`Video Information` + " (I)"}
          >
            <HiInformationCircle className="h-5 w-5" />
          </FluoButtonIcon>
          {document.pictureInPictureEnabled && (
            <FluoButtonIcon
              onClick={() => {
                void videoActions.togglePictureInPicture();
              }}
              disabled={!videoUrl}
              className="h-12 w-12 justify-center"
              title={t`Picture-in-Picture` + " (P)"}
            >
              <HiArrowTopRightOnSquare className="h-5 w-5" />
            </FluoButtonIcon>
          )}
          <FluoButtonIcon
            onClick={() => {
              void uiControls.toggleFullscreen();
            }}
            className="h-12 w-12 justify-center"
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
          </FluoButtonIcon>
          <SettingsPopover />
          <FluoButtonIcon
            onClick={props.onOpenFile}
            className="h-12 w-12 justify-center"
            title={t`Open File` + " (O)"}
          >
            <HiFolderOpen className="h-5 w-5" />
          </FluoButtonIcon>
        </div>
      </div>
    </div>
  );
}
