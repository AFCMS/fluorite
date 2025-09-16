import { useState, useEffect, useRef, useCallback } from "react";

interface UIControlsHook {
  showControls: boolean;
  isFullscreen: boolean;
  isDragOver: boolean;
  showVideoInfo: boolean;
  toggleFullscreen: () => Promise<void>;
  setShowControls: (show: boolean) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  toggleVideoInfo: () => void;
  onMouseEnterControls: () => void;
  onMouseLeaveControls: () => void;
}

export const useUIControls = (
  isPlaying: boolean,
  videoSrc: string,
  onOpenFile?: () => void,
): UIControlsHook => {
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showVideoInfo, setShowVideoInfo] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  // Control bar auto-hide functionality
  useEffect(() => {
    const resetHideTimer = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      setShowControls(true);

      // Only hide controls if video is playing
      if (isPlaying && videoSrc) {
        hideTimeoutRef.current = window.setTimeout(() => {
          setShowControls(false);
        }, 3000); // Hide after 3 seconds
      }
    };

    const handleMouseMove = () => {
      resetHideTimer();
    };

    const handleMouseLeave = () => {
      if (isPlaying && videoSrc) {
        hideTimeoutRef.current = window.setTimeout(() => {
          setShowControls(false);
        }, 1000); // Hide faster when mouse leaves
      }
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Initialize timer
    resetHideTimer();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPlaying, videoSrc]);

  // Show controls when video is paused
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  }, []);

  // Track fullscreen changes and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle fullscreen with F key (when not in input fields)
      if (
        event.key === "f" &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)
      ) {
        event.preventDefault();
        void toggleFullscreen();
      }
      // Open file dialog with O key (when not in input fields)
      if (
        event.key === "o" &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)
      ) {
        event.preventDefault();
        onOpenFile?.();
      }
      // Show video info with I key (when not in input fields)
      if (
        event.key === "i" &&
        videoSrc &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)
      ) {
        event.preventDefault();
        setShowVideoInfo(prev => !prev);
      }
      // Also support F11 (browser fullscreen)
      if (event.key === "F11") {
        event.preventDefault();
        void toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen, onOpenFile, videoSrc]);

  const toggleVideoInfo = useCallback(() => {
    setShowVideoInfo(prev => !prev);
  }, []);

  const onMouseEnterControls = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const onMouseLeaveControls = useCallback(() => {
    if (isPlaying && videoSrc) {
      hideTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  }, [isPlaying, videoSrc]);

  return {
    showControls,
    isFullscreen,
    isDragOver,
    showVideoInfo,
    toggleFullscreen,
    setShowControls,
    setIsDragOver,
    toggleVideoInfo,
    onMouseEnterControls,
    onMouseLeaveControls,
  };
};
