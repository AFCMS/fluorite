import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useEffectEvent, useRef } from "react";
import type { RefObject } from "react";

import {
  // State atoms
  videoUrlAtom,
  isPlayingAtom,
  showControlsAtom,
  isFullscreenAtom,
  isDragOverAtom,
  videoMetadataAtom,
  hasVideoMetadataAtom,

  // Action atoms
  videoFileSetAtom,
  togglePlayPauseAtom,
  seekToAtom,
  setVolumeAtom,
  setMuteAtom,
  toggleMuteAtom,
  togglePictureInPictureAtom,
  registerVideoElementAtom,

  // Effects
  videoUrlCleanupEffect,
  mediaInfoInitEffect,
  mediaInfoExtractEffect,
  mediaInfoMetadataAtom,
} from "../store/video";

// Hook for video actions (play, pause, seek, etc.)
export function useVideoActions() {
  const setVideoFile = useSetAtom(videoFileSetAtom);
  const togglePlayPause = useSetAtom(togglePlayPauseAtom);
  const seekTo = useSetAtom(seekToAtom);
  const setVolume = useSetAtom(setVolumeAtom);
  const toggleMute = useSetAtom(toggleMuteAtom);
  const registerVideoElement = useSetAtom(registerVideoElementAtom);
  const togglePictureInPicture = useSetAtom(togglePictureInPictureAtom);
  const setMute = useSetAtom(setMuteAtom);

  return {
    setVideoFile,
    togglePlayPause,
    seekTo,
    setVolume,
    setMute,
    toggleMute,
    togglePictureInPicture,
    registerVideoElement,
  };
}

export function useVideoLifecycleEffects() {
  useAtomValue(videoUrlCleanupEffect);
  useAtomValue(mediaInfoInitEffect);
  useAtomValue(mediaInfoExtractEffect);
}

// Hook for video URL
export function useVideoUrl() {
  return useAtomValue(videoUrlAtom);
}

// Hook for video metadata
export function useVideoMetadata() {
  return {
    metadata: useAtomValue(videoMetadataAtom),
    hasMetadata: useAtomValue(hasVideoMetadataAtom),
  };
}

// Hook for MediaInfo detailed metadata
export function useMediaInfoMetadata() {
  return useAtomValue(mediaInfoMetadataAtom);
}

interface UIControlsOptions {
  readonly videoRef: RefObject<HTMLVideoElement | null>;
  readonly fileInputRef: RefObject<HTMLInputElement | null>;
  readonly controlsPinned: boolean;
  readonly onToggleVideoInfo: () => void;
  readonly onCloseVideoInfo: () => void;
  readonly onTogglePlayPause: () => void;
  readonly onSeek: (time: number) => void;
  readonly onTogglePictureInPicture: () => void;
}

// Single owner for keyboard, fullscreen, and controls visibility lifecycles.
export function useUIControls(options: UIControlsOptions) {
  const [showControls, setShowControls] = useAtom(showControlsAtom);
  const [isFullscreen, setIsFullscreen] = useAtom(isFullscreenAtom);
  const [isDragOver, setIsDragOver] = useAtom(isDragOverAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const videoUrl = useAtomValue(videoUrlAtom);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current !== null) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, []);

  const hideControlsAfter = useCallback(
    (delay: number) => {
      clearControlsTimeout();
      if (options.controlsPinned || !isPlaying || !videoUrl) return;

      controlsTimeoutRef.current = setTimeout(() => {
        controlsTimeoutRef.current = null;
        setShowControls(false);
      }, delay);
    },
    [
      clearControlsTimeout,
      isPlaying,
      options.controlsPinned,
      setShowControls,
      videoUrl,
    ],
  );

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    hideControlsAfter(3000);
  }, [hideControlsAfter, setShowControls]);

  const hideControlsSoon = useCallback(() => {
    hideControlsAfter(1000);
  }, [hideControlsAfter]);

  // Keep the anchor stable while an anchored control is open.
  useEffect(() => {
    if (options.controlsPinned || !isPlaying || !videoUrl) {
      setShowControls(true);
      clearControlsTimeout();
    }
  }, [
    clearControlsTimeout,
    isPlaying,
    options.controlsPinned,
    setShowControls,
    videoUrl,
  ]);

  useEffect(() => clearControlsTimeout, [clearControlsTimeout]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn("Failed to toggle fullscreen:", error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "f" || event.key === "F") {
      event.preventDefault();
      void toggleFullscreen();
      return;
    }

    if (event.key === "o" || event.key === "O") {
      event.preventDefault();
      options.fileInputRef.current?.click();
      return;
    }

    if (event.key === "i" || event.key === "I") {
      event.preventDefault();
      options.onToggleVideoInfo();
      return;
    }

    if (
      (event.key === "p" || event.key === "P") &&
      document.pictureInPictureEnabled
    ) {
      event.preventDefault();
      options.onTogglePictureInPicture();
      return;
    }

    if (event.key === "Escape") {
      options.onCloseVideoInfo();
      return;
    }

    if (!videoUrl) return;

    const video = options.videoRef.current;
    if (event.key === "ArrowRight" && video) {
      event.preventDefault();
      options.onSeek(Math.min(video.currentTime + 5, video.duration));
    } else if (event.key === "ArrowLeft" && video) {
      event.preventDefault();
      options.onSeek(Math.max(video.currentTime - 5, 0));
    } else if (
      event.key === " " ||
      event.key === "Space" ||
      event.code === "Space"
    ) {
      const targetTag = (event.target as HTMLElement).tagName;
      if (targetTag !== "BUTTON") {
        event.preventDefault();
        options.onTogglePlayPause();
      }
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

  return {
    showControls: showControls || options.controlsPinned,
    showControlsTemporarily,
    hideControlsSoon,
    isFullscreen,
    toggleFullscreen,
    isDragOver,
    setIsDragOver,
  };
}
