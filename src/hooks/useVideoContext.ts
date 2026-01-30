import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import {
  // State atoms
  videoUrlAtom,
  videoElementAtom,
  isPlayingAtom,
  currentTimeAtom,
  durationAtom,
  volumeAtom,
  isMutedAtom,
  isSeekingAtom,
  playbackRateAtom,
  showControlsAtom,
  isFullscreenAtom,
  isDragOverAtom,
  effectiveVolumeAtom,
  videoMetadataAtom,
  hasVideoMetadataAtom,

  // Action atoms
  videoFileSetAtom,
  togglePlayPauseAtom,
  seekToAtom,
  setVolumeAtom,
  setMuteAtom,
  toggleMuteAtom,
  setPlaybackRateAtom,
  setLoopAtom,
  toggleLoopAtom,

  // Effects
  videoUrlCleanupEffect,
  videoElementSyncEffect,
  mediaInfoInitEffect,
  mediaInfoExtractEffect,
  mediaInfoMetadataAtom,
  loopAtom,
} from "../store/video";

// Hook for video actions (play, pause, seek, etc.)
export function useVideoActions() {
  const setVideoFile = useSetAtom(videoFileSetAtom);
  const togglePlayPause = useSetAtom(togglePlayPauseAtom);
  const seekTo = useSetAtom(seekToAtom);
  const setVolume = useSetAtom(setVolumeAtom);
  const toggleMute = useSetAtom(toggleMuteAtom);
  const setVideoElement = useSetAtom(videoElementAtom);
  const setPlaybackRate = useSetAtom(setPlaybackRateAtom);
  const setLoop = useSetAtom(setLoopAtom);
  const toggleLoop = useSetAtom(toggleLoopAtom);

  // Trigger effects
  useAtom(videoUrlCleanupEffect);
  useAtom(videoElementSyncEffect);
  useAtom(mediaInfoInitEffect);
  useAtom(mediaInfoExtractEffect);

  const registerVideoElement = useCallback(
    (element: HTMLVideoElement | null) => {
      setVideoElement(element);
    },
    [setVideoElement],
  );

  return {
    setVideoFile,
    togglePlayPause,
    seekTo,
    setVolume,
    setMute: useSetAtom(setMuteAtom),
    toggleMute,
    setPlaybackRate,
    setLoop,
    toggleLoop,
    registerVideoElement,
  };
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

// Hook for video playback state
export function useVideoState() {
  return {
    isPlaying: useAtomValue(isPlayingAtom),
    currentTime: useAtomValue(currentTimeAtom),
    duration: useAtomValue(durationAtom),
    volume: useAtomValue(volumeAtom),
    effectiveVolume: useAtomValue(effectiveVolumeAtom),
    isMuted: useAtomValue(isMutedAtom),
    isSeeking: useAtomValue(isSeekingAtom),
    playbackRate: useAtomValue(playbackRateAtom),
    loop: useAtomValue(loopAtom),
    metadata: useAtomValue(videoMetadataAtom),
    hasMetadata: useAtomValue(hasVideoMetadataAtom),
    mediaInfo: useAtomValue(mediaInfoMetadataAtom),
  };
}

// Hook for UI controls
export function useUIControls() {
  const [showControls, setShowControls] = useAtom(showControlsAtom);
  const [isFullscreen, setIsFullscreen] = useAtom(isFullscreenAtom);
  const [isDragOver, setIsDragOver] = useAtom(isDragOverAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const videoUrl = useAtomValue(videoUrlAtom);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Only hide controls if video is playing and loaded
    if (isPlaying && videoUrl) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [setShowControls, isPlaying, videoUrl]);

  // Auto-show controls on mouse movement
  useEffect(() => {
    const handleMouseMove = () => {
      showControlsTemporarily();
    };

    const handleMouseLeave = () => {
      if (isPlaying && videoUrl) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 1000); // Hide faster when mouse leaves
      }
    };

    // Add event listeners to document for global mouse detection
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControlsTemporarily, isPlaying, videoUrl, setShowControls]);

  // Show controls when video is paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying, setShowControls]);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (error) {
      console.warn("Failed to enter fullscreen:", error);
    }
  }, [setIsFullscreen]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.warn("Failed to exit fullscreen:", error);
    }
  }, [setIsFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [setIsFullscreen]);

  return {
    showControls,
    setShowControls,
    showControlsTemporarily,
    isFullscreen,
    toggleFullscreen,
    isDragOver,
    setIsDragOver,
  };
}
