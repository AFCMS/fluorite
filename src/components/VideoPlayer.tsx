import { useEffect, useMemo, useRef, useState } from "react";
import { HiFilm } from "react-icons/hi2";

import { useRegisterSW } from "virtual:pwa-register/react";

import ControlBar from "./ControlBar";
import VideoInfoOverlay from "./VideoInfoOverlay";
import {
  useVideoActions,
  useVideoUrl,
  useVideoState,
  useUIControls,
} from "../hooks";
import { useMediaInfoMetadata } from "../hooks";
import type { MediaInfoMetadata } from "../utils/mediaInfo";
import { isVideoFile } from "../utils";
import { useSetAtom } from "jotai";
import {
  updateDurationAtom,
  updateCurrentTimeAtom,
  updatePlayStateAtom,
  updateVolumeStateAtom,
} from "../store/video";
import { useLingui } from "@lingui/react/macro";

export default function VideoPlayerApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Get video context data
  const videoActions = useVideoActions();
  const videoUrl = useVideoUrl();
  const videoState = useVideoState();
  const uiControls = useUIControls();
  const mediaInfo = useMediaInfoMetadata();
  const dragCounter = useRef(0);

  // Manual atom setters for video state
  const setDuration = useSetAtom(updateDurationAtom);
  const setCurrentTime = useSetAtom(updateCurrentTimeAtom);
  const setPlayState = useSetAtom(updatePlayStateAtom);
  const setVolumeState = useSetAtom(updateVolumeStateAtom);

  // Register the video element when it mounts and set up event listeners
  useEffect(() => {
    if (videoRef.current) {
      videoActions.registerVideoElement(videoRef.current);

      const video = videoRef.current;

      // Set up event listeners manually
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      const handlePlay = () => {
        setPlayState(true);
      };

      const handlePause = () => {
        setPlayState(false);
      };

      const handleEnded = () => {
        setPlayState(false);
      };

      const handleVolumeChange = () => {
        setVolumeState({ volume: video.volume, muted: video.muted });
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("volumechange", handleVolumeChange);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("volumechange", handleVolumeChange);
      };
    }
  }, [videoActions, setDuration, setCurrentTime, setPlayState, setVolumeState]);

  // File handling
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isVideoFile(file)) {
      videoActions.setVideoFile(file);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      document.title = baseName;
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Build merged metadata for overlay
  const overlayMetadata: MediaInfoMetadata | null = useMemo(() => {
    if (!videoUrl) return null;

    const fileName = videoState.metadata?.fileName;
    const fileSize = videoState.metadata?.fileSize;

    // Prefer MediaInfo dimensions, fallback to actual video element dimensions
    const width = mediaInfo?.videoWidth ?? videoRef.current?.videoWidth ?? 0;
    const height = mediaInfo?.videoHeight ?? videoRef.current?.videoHeight ?? 0;

    // Derive a simple container format from file name if available
    const containerFormat = fileName
      ? fileName.split(".").pop()?.toUpperCase()
      : undefined;

    const merged: MediaInfoMetadata = {
      duration: videoState.duration || 0,
      videoWidth: width,
      videoHeight: height,
      videoFrameRate: mediaInfo?.videoFrameRate,
      videoCodec: mediaInfo?.videoCodec,
      audioCodec: mediaInfo?.audioCodec,
      containerFormat,
      fileSize,
      fileName,
      videoBitrate: mediaInfo?.videoBitrate,
      videoColorSpace: mediaInfo?.videoColorSpace,
      videoProfile: mediaInfo?.videoProfile,
      videoBitDepth: mediaInfo?.videoBitDepth,
      audioBitrate: mediaInfo?.audioBitrate,
      audioChannels: mediaInfo?.audioChannels,
      audioSampleRate: mediaInfo?.audioSampleRate,
    };

    return merged;
  }, [mediaInfo, videoState.duration, videoState.metadata, videoUrl]);

  // Drag and drop handling
  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounter.current += 1;
    uiControls.setIsDragOver(true);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      uiControls.setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounter.current = 0;
    uiControls.setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isVideoFile(file)) {
        videoActions.setVideoFile(file);
        const baseName = file.name.replace(/\.[^.]+$/, "");
        document.title = baseName;
      }
    }
  };

  // File Handler for PWA
  useEffect(() => {
    if (window.launchQueue) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (launchParams.files?.length) {
          const handles: FileSystemFileHandle[] = launchParams.files;
          for (const handle of handles) {
            try {
              const file = await handle.getFile();
              videoActions.setVideoFile(file);
            } catch (e) {
              console.warn("Failed to load file from handle", e);
            }
            return;
          }
        }
      });
    }
  }, [videoActions]);

  // Auto-play when video loads
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const video = videoRef.current;
      video.autoplay = true;
      video
        .play()
        .then(() => {
          // Video started playing automatically
        })
        .catch(console.error);
    }
  }, [videoUrl]);

  // Keyboard shortcuts: Left/Right arrow seek 5s
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Toggle fullscreen with "F" anywhere
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        void uiControls.toggleFullscreen();
        return;
      }

      // Open file dialog with "O" anywhere
      if (e.key === "o" || e.key === "O") {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }

      // Toggle info overlay with "I" anywhere
      if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        setShowInfo((prev) => !prev);
        return;
      }

      // Close info overlay with Escape (don't block browser fullscreen exit)
      if (e.key === "Escape") {
        // No preventDefault here to allow native behaviors (e.g., exit fullscreen)
        setShowInfo(false);
        return;
      }

      if (!videoUrl) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const video = videoRef.current;
        if (video) {
          const newTime = Math.min(video.currentTime + 5, video.duration);
          videoActions.seekTo(newTime);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const video = videoRef.current;
        if (video) {
          const newTime = Math.max(video.currentTime - 5, 0);
          videoActions.seekTo(newTime);
        }
      } else if (e.key === " " || e.key === "Space" || e.code === "Space") {
        // Avoid double toggle if focused on an actual button (space triggers click)
        const targetTag = (e.target as HTMLElement).tagName;
        if (targetTag !== "BUTTON") {
          e.preventDefault();
          videoActions.togglePlayPause();
        }
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [videoActions, videoUrl, uiControls, setShowInfo]);

  // Service Worker registration and update handling
  const { updateServiceWorker } = useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      void updateServiceWorker(true)
        .then(() => {
          window.location.reload();
        })
        .catch((err: unknown) => {
          console.error("SW update failed", err);
        });
    },
    onRegisteredSW(_swUrl, r) {
      setInterval(
        () => {
          if (r && typeof r.update === "function") {
            r.update().catch((err: unknown) => {
              console.warn("SW periodic update check failed", err);
            });
          }
        },
        60 * 60 * 1000,
      );
    },
  });

  // Lingui macro
  const { t } = useLingui();

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden transition-colors duration-200 ${
        uiControls.isDragOver ? "bg-blue-900/20" : "bg-black"
      } ${
        videoUrl && videoState.isPlaying && !uiControls.showControls
          ? "cursor-none"
          : "cursor-default"
      }`}
      onDragEnter={handleDragEnter}
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

      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full object-contain"
          onClick={videoActions.togglePlayPause}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-white">
          <div className="space-y-8 text-center" onClick={openFileDialog}>
            <div className="space-y-4">
              <div className="flex justify-center text-6xl">
                <img
                  src="/fluorite.svg"
                  className="h-16 w-16"
                  alt="Fluorite logo"
                />
              </div>
              <h1 className="text-4xl font-bold">Fluorite</h1>
              <p className="text-xl text-gray-300">
                {t`Drop a video file anywhere or click here to open one`}
              </p>
            </div>
          </div>
        </div>
      )}

      <ControlBar
        onToggleVideoInfo={() => {
          setShowInfo(true);
        }}
        onOpenFile={openFileDialog}
      />

      {/* Drag Overlay */}
      {uiControls.isDragOver && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl bg-gray-900/95 p-6 text-xl font-medium text-white shadow-2xl">
            <div className="space-y-2 text-center">
              <div className="flex justify-center">
                <HiFilm className="h-12 w-12" />
              </div>
              <p>{t`Drop video file here`}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Info Overlay */}
      <VideoInfoOverlay
        isVisible={showInfo}
        metadata={overlayMetadata}
        onClose={() => {
          setShowInfo(false);
        }}
      />
    </div>
  );
}
