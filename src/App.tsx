import { useEffect } from "react";
import { HiFilm } from "react-icons/hi2";
import ControlBar from "./components/ControlBar";
import { useVideoPlayer, useUIControls, useFileHandler } from "./hooks";
import "./App.css";

function App() {
  // Custom hooks for managing different aspects of the video player
  const videoPlayer = useVideoPlayer();
  const uiControls = useUIControls(videoPlayer.isPlaying, videoPlayer.videoSrc);

  const fileHandler = useFileHandler({
    onVideoFile: (file: File) => {
      const url = URL.createObjectURL(file);
      videoPlayer.loadVideo(url);
    },
    onDragStateChange: uiControls.setIsDragOver,
  });

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
      onDragOver={fileHandler.handleDragOver}
      onDragLeave={fileHandler.handleDragLeave}
      onDrop={fileHandler.handleDrop}
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
              onClick={fileHandler.openFileDialog}
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Select Video File
            </button>
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
