import { useLingui } from "@lingui/react/macro";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiFilm } from "react-icons/hi2";
import { useRegisterSW } from "virtual:pwa-register/react";

import {
  useUIControls,
  useVideoActions,
  useVideoLifecycleEffects,
  useVideoUrl,
} from "../hooks";
import { useMediaInfoMetadata } from "../hooks";
import {
  updateCurrentTimeAtom,
  updateLoadedMetadataAtom,
  updatePlaybackRateStateAtom,
  updatePlayStateAtom,
  updateVolumeStateAtom,
  settingsPopoverOpenAtom,
  isPlayingAtom,
  durationAtom,
  videoMetadataAtom,
} from "../store/video";
import { isVideoFile } from "../utils";
import type { MediaInfoMetadata } from "../utils/mediaInfo";
import ControlBar from "./ControlBar";
import VideoInfoOverlay from "./VideoInfoOverlay";

const BASE_NAME_REGEX = /\.[^.]+$/;

export default function VideoPlayerApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serviceWorkerUpdateIntervalRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const settingsPopoverOpen = useAtomValue(settingsPopoverOpenAtom);
  const justClosedPopoverRef = useRef(false);

  // Detect when popover closes and set flag to prevent immediate actions
  useEffect(() => {
    if (!settingsPopoverOpen) {
      justClosedPopoverRef.current = true;
      const timer = setTimeout(() => {
        justClosedPopoverRef.current = false;
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [settingsPopoverOpen]);

  // Get video context data
  useVideoLifecycleEffects();
  const videoActions = useVideoActions();
  const videoUrl = useVideoUrl();
  const isPlaying = useAtomValue(isPlayingAtom);
  const duration = useAtomValue(durationAtom);
  const videoMetadata = useAtomValue(videoMetadataAtom);
  const mediaInfo = useMediaInfoMetadata();
  const dragCounterRef = useRef(0);

  // Manual atom setters for video state
  const setLoadedMetadata = useSetAtom(updateLoadedMetadataAtom);
  const setCurrentTime = useSetAtom(updateCurrentTimeAtom);
  const setPlayState = useSetAtom(updatePlayStateAtom);
  const setVolumeState = useSetAtom(updateVolumeStateAtom);
  const setPlaybackRateState = useSetAtom(updatePlaybackRateStateAtom);
  const registerVideoElement = videoActions.registerVideoElement;

  const setVideoElementRef = useCallback(
    (element: HTMLVideoElement | null) => {
      videoRef.current = element;
      registerVideoElement(element);
    },
    [registerVideoElement],
  );

  const uiControls = useUIControls({
    videoRef,
    fileInputRef,
    onToggleVideoInfo: () => {
      setShowInfo((visible) => !visible);
    },
    onCloseVideoInfo: () => {
      setShowInfo(false);
    },
    onTogglePlayPause: videoActions.togglePlayPause,
    onSeek: videoActions.seekTo,
    onTogglePictureInPicture: () => {
      void videoActions.togglePictureInPicture();
    },
  });

  // File handling

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isVideoFile(file)) {
      videoActions.setVideoFile(file);
      const baseName = file.name.replace(BASE_NAME_REGEX, "");
      document.title = baseName;
    }
  };

  const openFileDialog = () => {
    if (!settingsPopoverOpen && !justClosedPopoverRef.current) {
      fileInputRef.current?.click();
    }
  };

  // Build merged metadata for overlay
  const overlayMetadata: MediaInfoMetadata | null = useMemo(() => {
    if (!videoUrl) return null;

    const fileName = videoMetadata?.fileName;
    const fileSize = videoMetadata?.fileSize;

    // Prefer MediaInfo dimensions, fallback to actual video element dimensions
    const width = mediaInfo?.videoWidth ?? videoMetadata?.videoWidth;
    const height = mediaInfo?.videoHeight ?? videoMetadata?.videoHeight;

    // Derive a simple container format from file name if available
    const containerFormat = fileName
      ? fileName.split(".").pop()?.toUpperCase()
      : undefined;

    const merged: MediaInfoMetadata = {
      duration: duration || 0,
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
  }, [mediaInfo, duration, videoMetadata, videoUrl]);

  // Drag and drop handling
  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounterRef.current += 1;
    uiControls.setIsDragOver(true);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      uiControls.setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounterRef.current = 0;
    uiControls.setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isVideoFile(file)) {
        videoActions.setVideoFile(file);
        const baseName = file.name.replace(BASE_NAME_REGEX, "");
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
      if (!r) return;
      if (serviceWorkerUpdateIntervalRef.current !== null) {
        clearInterval(serviceWorkerUpdateIntervalRef.current);
      }
      serviceWorkerUpdateIntervalRef.current = setInterval(
        () => {
          r.update().catch((err: unknown) => {
            console.warn("SW periodic update check failed", err);
          });
        },
        60 * 60 * 1000,
      );
    },
  });

  useEffect(() => {
    return () => {
      if (serviceWorkerUpdateIntervalRef.current !== null) {
        clearInterval(serviceWorkerUpdateIntervalRef.current);
        serviceWorkerUpdateIntervalRef.current = null;
      }
    };
  }, []);

  // Lingui macro
  const { t } = useLingui();

  /* oxlint-disable jsx-a11y/no-noninteractive-element-interactions -- The file input and open-file button provide an accessible alternative to drag and drop. */
  /* oxlint-disable jsx-a11y/media-has-caption -- Local video files may contain embedded captions; the app has no separate caption source to attach. */
  return (
    <main
      className={`relative h-screen w-screen overflow-hidden transition-colors duration-200 ${
        uiControls.isDragOver ? "bg-blue-900/20" : "bg-black"
      } ${
        videoUrl && isPlaying && !uiControls.showControls
          ? "cursor-none"
          : "cursor-default"
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerMove={uiControls.showControlsTemporarily}
      onPointerLeave={uiControls.hideControlsSoon}
    >
      <input
        ref={fileInputRef}
        type="file"
        name="videoFile"
        id="videoFile"
        accept="video/*"
        onChange={handleFileInput}
        className="peer sr-only"
      />

      {videoUrl ? (
        <video
          ref={setVideoElementRef}
          src={videoUrl}
          autoPlay
          className="h-full w-full object-contain"
          onLoadedMetadata={(event) => {
            setLoadedMetadata(event.currentTarget);
          }}
          onTimeUpdate={(event) => {
            setCurrentTime(event.currentTarget.currentTime);
          }}
          onPlay={() => {
            setPlayState(true);
          }}
          onPause={() => {
            setPlayState(false);
          }}
          onEnded={() => {
            setPlayState(false);
          }}
          onVolumeChange={(event) => {
            setVolumeState({
              volume: event.currentTarget.volume,
              muted: event.currentTarget.muted,
            });
          }}
          onRateChange={(event) => {
            setPlaybackRateState(event.currentTarget.playbackRate);
          }}
          onClick={() => {
            if (!settingsPopoverOpen && !justClosedPopoverRef.current) {
              videoActions.togglePlayPause();
            }
          }}
        />
      ) : (
        <div className="group relative flex h-full w-full flex-col items-center justify-center text-white peer-focus-visible:ring-2 peer-focus-visible:ring-white peer-focus-visible:ring-inset">
          <div className="pointer-events-none space-y-8 text-center">
            <div className="space-y-4">
              <div className="flex justify-center text-6xl">
                <img
                  src="/fluorite.svg"
                  className="h-16 w-16"
                  alt="Fluorite logo"
                  fetchPriority="high"
                />
              </div>
              <h1 className="text-4xl font-bold">Fluorite</h1>
              <p className="text-xl text-gray-300 group-hover:text-white">
                {t`Drop a video file anywhere or click here to open one`}
              </p>
            </div>
          </div>
          <label
            htmlFor="videoFile"
            aria-label={t`Open video file`}
            className="absolute inset-0 cursor-pointer"
          />
        </div>
      )}

      <ControlBar
        onToggleVideoInfo={() => {
          setShowInfo(true);
        }}
        onOpenFile={openFileDialog}
        onShowControls={uiControls.showControlsTemporarily}
        onToggleFullscreen={() => {
          void uiControls.toggleFullscreen();
        }}
        showControls={uiControls.showControls}
        isFullscreen={uiControls.isFullscreen}
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
    </main>
  );
}
