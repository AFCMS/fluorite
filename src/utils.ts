export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith("video/");
};
