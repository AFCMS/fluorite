import type { ChangeEvent } from "react";
import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiFolderOpen,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
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
  onOpenFile: () => void;
  formatTime: (time: number) => string;
}

export default function ControlBar(props: ControlBarProps) {
  return (
    <div
      className={`absolute right-0 bottom-0 left-0 space-y-3 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 text-white transition-all duration-300 ${
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
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={props.duration || 0}
            value={props.currentTime}
            onChange={props.onSeek}
            onMouseDown={props.onSeekStart}
            onMouseUp={props.onSeekEnd}
            onTouchStart={props.onSeekStart}
            onTouchEnd={props.onSeekEnd}
            className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600"
            disabled={!props.videoSrc}
          />
        </div>
        <span className="min-w-[40px] font-mono text-sm">
          {props.formatTime(props.duration)}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <button
            onClick={props.onTogglePlayPause}
            disabled={!props.videoSrc}
            className="rounded-full p-2 transition-colors duration-200 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {props.isPlaying ? (
              <HiPause className="h-6 w-6" />
            ) : (
              <HiPlay className="h-6 w-6" />
            )}
          </button>

          {/* Volume Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={props.onToggleMute}
              disabled={!props.videoSrc}
              className="rounded-full p-2 transition-colors duration-200 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {props.isMuted || props.volume === 0 ? (
                <HiSpeakerXMark className="h-5 w-5" />
              ) : (
                <HiSpeakerWave className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={props.isMuted ? 0 : props.volume}
              onChange={props.onVolumeChange}
              disabled={!props.videoSrc}
              className="slider h-1 w-20 cursor-pointer appearance-none rounded-lg bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={props.onToggleFullscreen}
            className="rounded-full p-2 transition-colors duration-200 hover:bg-white/20"
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
            className="flex items-center space-x-2 rounded-md bg-white/20 px-4 py-2 text-sm transition-colors duration-200 hover:bg-white/30"
          >
            <HiFolderOpen className="h-4 w-4" />
            <span>Open File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
