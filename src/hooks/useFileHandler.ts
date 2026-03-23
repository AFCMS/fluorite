import { useRef, useCallback } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { isVideoFile } from "../utils";

interface FileHandlerHook {
  readonly fileInputRef: React.RefObject<HTMLInputElement | null>;
  readonly urlRef: React.RefObject<string>;
  readonly handleFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly handleDragOver: (event: DragEvent) => void;
  readonly handleDragLeave: (event: DragEvent) => void;
  readonly handleDrop: (event: DragEvent) => void;
  readonly openFileDialog: () => void;
  readonly processFile: (file: File) => void;
}

interface FileHandlerOptions {
  readonly onVideoFile: (file: File) => void;
  readonly onDragStateChange: (isDragOver: boolean) => void;
}

export const useFileHandler = ({
  onVideoFile,
  onDragStateChange,
}: FileHandlerOptions): FileHandlerHook => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef("");

  const handleVideoFile = useCallback(
    (file: File) => {
      if (!isVideoFile(file)) {
        alert("Please select a video file");
        return;
      }

      // Revoke previous object URL to prevent memory leaks
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }

      const url = URL.createObjectURL(file);
      urlRef.current = url;
      onVideoFile(file);
    },
    [onVideoFile],
  );

  const handleFileInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleVideoFile(file);
      }
    },
    [handleVideoFile],
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      onDragStateChange(true);
    },
    [onDragStateChange],
  );

  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      onDragStateChange(false);
    },
    [onDragStateChange],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      onDragStateChange(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        handleVideoFile(file);
      }
    },
    [handleVideoFile, onDragStateChange],
  );

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    urlRef,
    handleFileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFileDialog,
    processFile: handleVideoFile,
  };
};
