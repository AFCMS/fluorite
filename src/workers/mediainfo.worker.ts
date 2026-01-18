import mediaInfoFactory from "mediainfo.js";
import type { MediaInfo } from "mediainfo.js";
import mediaInfoWasmUrl from "mediainfo.js/MediaInfoModule.wasm?url";

// Keep types in sync with app
export interface MediaInfoMetadata {
  title?: string;
  videoCodec?: string;
  videoHeight?: number;
  videoWidth?: number;
  videoFrameRate?: number;
  videoBitrate?: number;
  videoColorSpace?: string;
  videoProfile?: string;
  videoBitDepth?: number;
  audioCodec?: string;
  audioBitrate?: number;
  audioSampleRate?: number;
  audioChannels?: number;
  containerFormat?: string;
  fileSize?: number;
  fileName?: string;
  duration?: number;
}

type WorkerRequest =
  | { id: number; type: "warmup" }
  | { id: number; type: "analyze"; file: File };

type WorkerResponse =
  | { id: number; type: "ready" }
  | { id: number; type: "metadata"; metadata: MediaInfoMetadata | null }
  | { id: number; type: "error"; message: string };

let miInstance: MediaInfo | null = null;

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[, ]/g, "");
    const match = /^[0-9]+(?:\.[0-9]+)?/.exec(cleaned);
    if (match) return Number(match[0]);
  }
  return undefined;
};

async function ensureMediaInfo(): Promise<MediaInfo> {
  if (miInstance) return miInstance;
  miInstance = await mediaInfoFactory({
    format: "object" as const,
    locateFile: (path, prefix) =>
      path === "MediaInfoModule.wasm" ? mediaInfoWasmUrl : `${prefix}${path}`,
  });
  return miInstance;
}

interface WorkerTrackShape {
  "@type"?: string;
  Title?: string;
  Format?: string;
  CodecID?: string;
  Height?: string | number;
  Width?: string | number;
  FrameRate?: string | number;
  BitRate?: string | number;
  ColorSpace?: string;
  SamplingRate?: string | number;
}

self.onmessage = async (evt: MessageEvent<WorkerRequest>) => {
  const msg = evt.data;
  try {
    switch (msg.type) {
      case "warmup": {
        await ensureMediaInfo();
        const res: WorkerResponse = { id: msg.id, type: "ready" };
        self.postMessage(res);
        return;
      }
      case "analyze": {
        const mi = await ensureMediaInfo();
        const file = msg.file;

        const result = await mi.analyzeData(
          file.size,
          async (chunkSize: number, offset: number) => {
            const blob = file.slice(offset, offset + chunkSize);
            const buf = await blob.arrayBuffer();
            return new Uint8Array(buf);
          },
        );

        const mediaObj = result as unknown as {
          media?: { track?: WorkerTrackShape[] };
        };
        const tracks = mediaObj.media?.track ?? [];

        const general = tracks.find((t) => t["@type"] === "General");
        const video = tracks.find((t) => t["@type"] === "Video");
        const audio = tracks.find((t) => t["@type"] === "Audio");

        const metadata: MediaInfoMetadata = {
          title: general?.Title ?? undefined,
          videoCodec: video?.Format ?? video?.CodecID,
          videoHeight: parseNumber(video?.Height),
          videoWidth: parseNumber(video?.Width),
          videoFrameRate: parseNumber(video?.FrameRate),
          videoBitrate: parseNumber(video?.BitRate),
          videoColorSpace: video?.ColorSpace ?? undefined,
          audioCodec: audio?.Format ?? audio?.CodecID,
          audioBitrate: parseNumber(audio?.BitRate),
          audioSampleRate: parseNumber(audio?.SamplingRate),
        };

        const res: WorkerResponse = { id: msg.id, type: "metadata", metadata };
        self.postMessage(res);
        return;
      }
    }
  } catch (e) {
    const res: WorkerResponse = {
      id: msg.id,
      type: "error",
      message: e instanceof Error ? e.message : String(e),
    };
    self.postMessage(res);
  }
};

export {};
