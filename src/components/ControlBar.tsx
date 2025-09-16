import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiFolderOpen,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
  HiInformationCircle,
} from "react-icons/hi2";

interface ControlBarProps {
  showControls: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  videoSrc: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTogglePlayPause: () => void;
  onSeek: (e: ChangeEvent<HTMLInputElement>) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onVolumeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleVideoInfo: () => void;
  onOpenFile: () => void;
  formatTime: (time: number) => string;
}

export default function ControlBar(props: ControlBarProps) {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  return (
    <div
      className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-4 py-0 text-blue-100 transition-all duration-300 ${
        props.showControls
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {/* Progress Bar */}
      <div className="flex items-center space-x-3">
        <span className="min-w-[40px] font-mono text-sm">
          {props.formatTime(props.currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={props.duration || 0}
          step="0.1"
          value={props.currentTime}
          onChange={props.onSeek}
          onMouseDown={props.onSeekStart}
          onMouseUp={props.onSeekEnd}
          onTouchStart={props.onSeekStart}
          onTouchEnd={props.onSeekEnd}
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
          disabled={!props.videoSrc}
        />
        <span className="min-w-[40px] font-mono text-sm">
          {props.formatTime(props.duration)}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Play/Pause Button */}
          <button
            onClick={props.onTogglePlayPause}
            disabled={!props.videoSrc}
            className="button-styled h-12 w-12"
          >
            {props.isPlaying ? (
              <HiPause className="h-7 w-7" />
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
              onClick={props.onToggleMute}
              disabled={!props.videoSrc}
              className="button-styled h-12 w-12"
            >
              {props.isMuted || props.volume === 0 ? (
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
                value={props.isMuted ? 0 : props.volume}
                onChange={props.onVolumeChange}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
                disabled={!props.videoSrc}
                className="range-styled w-20 overflow-visible"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={props.onToggleVideoInfo}
            disabled={!props.videoSrc}
            className="button-styled h-12 w-12"
            title="Video Information"
          >
            <HiInformationCircle className="h-5 w-5" />
          </button>
          <button
            onClick={props.onToggleFullscreen}
            className="button-styled h-12 w-12"
            title={props.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {props.isFullscreen ? (
              <HiArrowsPointingIn className="h-5 w-5" />
            ) : (
              <HiArrowsPointingOut className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={props.onOpenFile}
            className="button-styled h-12 w-12"
          >
            <HiFolderOpen className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
