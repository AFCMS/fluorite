import { useRef, useState, useCallback, useEffect } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { HiFilm } from "react-icons/hi";
import ControlBar from "./components/ControlBar";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string>("");
  const hideTimeoutRef = useRef<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isVideoFile = (file: File): boolean => {
    return file.type.startsWith("video/");
  };

  const handleVideoFile = useCallback((file: File) => {
    if (!isVideoFile(file)) {
      alert("Please select a video file");
      return;
    }

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }

    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setVideoSrc(url);
  }, []);

  // Auto-play when video loads
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      const video = videoRef.current;
      video.autoplay = true;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(console.error);
    }
  }, [videoSrc]);

  // Video event handlers with smooth progress updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;

    const updateProgress = () => {
      if (video && !video.paused && !video.ended && !isSeeking) {
        setCurrentTime(video.currentTime);
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      // Fallback for when requestAnimationFrame isn't updating
      if (!isSeeking && (video.paused || video.ended)) {
        setCurrentTime(video.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      updateProgress(); // Start smooth updates when playing
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    // Start updating if video is already playing
    if (!video.paused && !video.ended) {
      updateProgress();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [videoSrc, isSeeking]);

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

  // Show controls when video is paused or when seeking
  useEffect(() => {
    if (!isPlaying || isSeeking) {
      setShowControls(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
  }, [isPlaying, isSeeking]);

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

  // Track fullscreen changes
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
        toggleFullscreen();
      }
      // Also support F11 (browser fullscreen)
      if (event.key === "F11") {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleVideoFile(file);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleVideoFile(file);
    }
  };

  // Control handlers
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden transition-colors duration-200 ${
        isDragOver ? "bg-blue-900/20" : "bg-black"
      } ${
        videoSrc && isPlaying && !showControls
          ? "cursor-none"
          : "cursor-default"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        name="videoFile"
        id="videoFile"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className="h-full w-full object-contain"
          onClick={togglePlayPause}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-white">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center text-6xl">
                <HiFilm className="h-16 w-16 text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold">Video Player</h1>
              <p className="text-xl text-gray-300">
                Drop a video file anywhere or click to select
              </p>
            </div>
            <button
              onClick={openFileDialog}
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Select Video File
            </button>
          </div>
        </div>
      )}

      <ControlBar
        showControls={showControls}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        videoSrc={videoSrc}
        onMouseEnter={() => {
          setShowControls(true);
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }
        }}
        onMouseLeave={() => {
          if (isPlaying && videoSrc) {
            hideTimeoutRef.current = window.setTimeout(() => {
              setShowControls(false);
            }, 1000);
          }
        }}
        onTogglePlayPause={togglePlayPause}
        onSeek={handleSeek}
        onSeekStart={handleSeekStart}
        onSeekEnd={handleSeekEnd}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onOpenFile={openFileDialog}
        formatTime={formatTime}
      />

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm">
          <div className="rounded-2xl bg-blue-600 px-12 py-8 text-2xl font-medium text-white shadow-2xl">
            <div className="space-y-2 text-center">
              <div className="flex justify-center">
                <HiFilm className="h-12 w-12" />
              </div>
              <p>Drop video file here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
