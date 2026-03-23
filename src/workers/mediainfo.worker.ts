import mediaInfoFactory from "mediainfo.js";
import type { MediaInfo } from "mediainfo.js";
import mediaInfoWasmUrl from "mediainfo.js/MediaInfoModule.wasm?url";

// Keep types in sync with app
export interface MediaInfoMetadata {
  readonly title?: string;
  readonly videoCodec?: string;
  readonly videoHeight?: number;
  readonly videoWidth?: number;
  readonly videoFrameRate?: number;
  readonly videoBitrate?: number;
  readonly videoColorSpace?: string;
  readonly videoProfile?: string;
  readonly videoBitDepth?: number;
  readonly audioCodec?: string;
  readonly audioBitrate?: number;
  readonly audioSampleRate?: number;
  readonly audioChannels?: number;
  readonly containerFormat?: string;
  readonly fileSize?: number;
  readonly fileName?: string;
  readonly duration?: number;
}

type WorkerRequest =
  | { readonly id: number; readonly type: "warmup" }
  | { readonly id: number; readonly type: "analyze"; readonly file: File };

type WorkerResponse =
  | { readonly id: number; readonly type: "ready" }
  | {
      readonly id: number;
      readonly type: "metadata";
      readonly metadata: MediaInfoMetadata | null;
    }
  | { readonly id: number; readonly type: "error"; readonly message: string };

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
  readonly "@type"?: string;
  readonly Title?: string;
  readonly Format?: string;
  readonly CodecID?: string;
  readonly Height?: string | number;
  readonly Width?: string | number;
  readonly FrameRate?: string | number;
  readonly BitRate?: string | number;
  readonly ColorSpace?: string;
  readonly SamplingRate?: string | number;
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
