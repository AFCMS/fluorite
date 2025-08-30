import { useEffect } from "react";
import { HiFilm } from "react-icons/hi2";

import { useRegisterSW } from "virtual:pwa-register/react";

import ControlBar from "./components/ControlBar";
import { useVideoPlayer, useUIControls, useFileHandler } from "./hooks";

import "./App.css";

function App() {
  // Custom hooks for managing different aspects of the video player
  const videoPlayer = useVideoPlayer();

  const fileHandler = useFileHandler({
    onVideoFile: (file: File) => {
      const url = URL.createObjectURL(file);
      videoPlayer.loadVideo(url);

      const baseName = file.name.replace(/\.[^.]+$/, "");
      document.title = baseName;
    },
    onDragStateChange: () => {
      // Drag state changes are handled directly in the component
    },
  });

  const uiControls = useUIControls(
    videoPlayer.isPlaying,
    videoPlayer.videoSrc,
    fileHandler.openFileDialog,
  );

  // Override the drag handlers to use uiControls
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    uiControls.setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    uiControls.setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    uiControls.setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      videoPlayer.loadVideo(url);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      document.title = baseName;
    }
  };

  // File Handler
  useEffect(() => {
    if (window.launchQueue) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (launchParams.files?.length) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          const handles: FileSystemFileHandle[] = launchParams.files || [];
          for (const handle of handles) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (handle.kind === "file") {
              try {
                const file = await handle.getFile();
                fileHandler.processFile(file);
              } catch (e) {
                console.warn("Failed to load file from handle", e);
              }
              return;
            }
          }
        }
      });
    }
  }, [fileHandler]);

  // Auto-play when video loads
  useEffect(() => {
    if (videoPlayer.videoSrc && videoPlayer.videoRef.current) {
      const video = videoPlayer.videoRef.current;
      video.autoplay = true;
      video
        .play()
        .then(() => {
          // Video started playing automatically
        })
        .catch(console.error);
    }
  }, [videoPlayer.videoSrc, videoPlayer.videoRef]);

  // Keyboard shortcuts: Left/Right arrow seek 5s
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!videoPlayer.videoSrc) return;
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        videoPlayer.seekBy(5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        videoPlayer.seekBy(-5);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [videoPlayer]);

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

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden transition-colors duration-200 ${
        uiControls.isDragOver ? "bg-blue-900/20" : "bg-black"
      } ${
        videoPlayer.videoSrc &&
        videoPlayer.isPlaying &&
        !uiControls.showControls
          ? "cursor-none"
          : "cursor-default"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileHandler.fileInputRef}
        type="file"
        name="videoFile"
        id="videoFile"
        accept="video/*"
        onChange={fileHandler.handleFileInput}
        className="hidden"
      />

      {videoPlayer.videoSrc ? (
        <video
          ref={videoPlayer.videoRef}
          src={videoPlayer.videoSrc}
          className="h-full w-full object-contain"
          onClick={videoPlayer.togglePlayPause}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-white">
          <div
            className="space-y-8 text-center"
            onClick={fileHandler.openFileDialog}
          >
            <div className="space-y-4">
              <div className="flex justify-center text-6xl">
                <img
                  src="/vite.svg"
                  className="h-16 w-16"
                  alt="Fluorite logo"
                />
              </div>
              <h1 className="text-4xl font-bold">Fluorite</h1>
              <p className="text-xl text-gray-300">
                Drop a video file anywhere or click here to open one
              </p>
            </div>
          </div>
        </div>
      )}

      <ControlBar
        showControls={uiControls.showControls}
        isPlaying={videoPlayer.isPlaying}
        currentTime={videoPlayer.currentTime}
        duration={videoPlayer.duration}
        volume={videoPlayer.volume}
        isMuted={videoPlayer.isMuted}
        isFullscreen={uiControls.isFullscreen}
        videoSrc={videoPlayer.videoSrc}
        onMouseEnter={uiControls.onMouseEnterControls}
        onMouseLeave={uiControls.onMouseLeaveControls}
        onTogglePlayPause={videoPlayer.togglePlayPause}
        onSeek={videoPlayer.handleSeek}
        onSeekStart={videoPlayer.handleSeekStart}
        onSeekEnd={videoPlayer.handleSeekEnd}
        onVolumeChange={videoPlayer.handleVolumeChange}
        onToggleMute={videoPlayer.toggleMute}
        onToggleFullscreen={() => {
          void uiControls.toggleFullscreen();
        }}
        onOpenFile={fileHandler.openFileDialog}
        formatTime={videoPlayer.formatTime}
      />

      {/* SW update handled silently; add UI here if you want to notify users. */}

      {/* Drag Overlay */}
      {uiControls.isDragOver && (
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
