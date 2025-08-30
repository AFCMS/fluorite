import { useRef, useState, useCallback, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  getStoredVolume,
  getStoredMuteState,
  storeVolume,
  storeMuteState,
  formatTime,
} from "../utils";

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isSeeking: boolean;
  videoSrc: string;
}

interface VideoPlayerHook extends VideoState {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  // Control methods
  togglePlayPause: () => void;
  handleSeek: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSeekStart: () => void;
  handleSeekEnd: () => void;
  handleVolumeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  loadVideo: (src: string) => void;
  seekBy: (deltaSeconds: number) => void;
  // Utility methods
  formatTime: (time: number) => string;
}

export const useVideoPlayer = (): VideoPlayerHook => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize volume and mute state from localStorage
  const [volume, setVolume] = useState(() => getStoredVolume());
  const [isMuted, setIsMuted] = useState(() => getStoredMuteState());

  // Keep track of the last non-zero volume for unmuting
  const lastVolumeRef = useRef(volume > 0 ? volume : 1);

  // Other video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");

  // Apply stored volume and mute state when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;
  }, [videoSrc, volume, isMuted]);

  // Video event handlers with smooth progress updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;

    const updateProgress = () => {
      if (!video.paused && !video.ended && !isSeeking) {
        setCurrentTime(video.currentTime);
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Apply stored volume settings
      video.volume = isMuted ? 0 : volume;
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

    const handleVolumeChange = () => {
      // Update state when volume changes externally (e.g., through browser controls)
      if (!isSeeking) {
        const newVolume = video.volume;
        const newMuted = video.muted || newVolume === 0;

        setVolume(newVolume);
        setIsMuted(newMuted);

        // Store the changes
        storeVolume(newVolume);
        storeMuteState(newMuted);

        // Update last non-zero volume
        if (newVolume > 0) {
          lastVolumeRef.current = newVolume;
        }
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("volumechange", handleVolumeChange);

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
      video.removeEventListener("volumechange", handleVolumeChange);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [videoSrc, isSeeking, volume, isMuted]);

  // Control methods
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);
  }, []);

  const handleVolumeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      storeVolume(newVolume);

      // Update last non-zero volume
      if (newVolume > 0) {
        lastVolumeRef.current = newVolume;
      }

      if (videoRef.current) {
        videoRef.current.volume = newVolume;

        if (newVolume === 0 && !isMuted) {
          setIsMuted(true);
          storeMuteState(true);
        } else if (newVolume > 0 && isMuted) {
          setIsMuted(false);
          storeMuteState(false);
        }
      }
    },
    [isMuted],
  );

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    storeMuteState(newMutedState);

    if (newMutedState) {
      // Muting: set volume to 0
      videoRef.current.volume = 0;
    } else {
      // Unmuting: restore to last non-zero volume or current volume if it's > 0
      const volumeToRestore = volume > 0 ? volume : lastVolumeRef.current;
      videoRef.current.volume = volumeToRestore;

      // Update the volume state if we're using the lastVolumeRef value
      if (volume === 0) {
        setVolume(volumeToRestore);
        storeVolume(volumeToRestore);
      }
    }
  }, [isMuted, volume]);

  const loadVideo = useCallback((src: string) => {
    setVideoSrc(src);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seekBy = useCallback((deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.min(
      Math.max(0, video.currentTime + deltaSeconds),
      video.duration || Number.MAX_VALUE,
    );
    video.currentTime = target;
    setCurrentTime(target);
  }, []);

  return {
    // State
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isSeeking,
    videoSrc,
    // Methods
    togglePlayPause,
    handleSeek,
    handleSeekStart,
    handleSeekEnd,
    handleVolumeChange,
    toggleMute,
    loadVideo,
    seekBy,
    formatTime,
  };
};
