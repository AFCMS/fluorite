import MediaInfo from 'mediainfo.js';

export interface DetailedVideoMetadata {
  // Basic information
  duration: number;
  videoWidth: number;
  videoHeight: number;
  fileSize: number;
  fileName: string;
  
  // Container information
  containerFormat: string;
  
  // Video track information
  videoCodec?: string;
  videoProfile?: string;
  videoBitrate?: number;
  videoFrameRate?: number;
  videoColorSpace?: string;
  videoBitDepth?: number;
  
  // Audio track information
  audioCodec?: string;
  audioBitrate?: number;
  audioChannels?: number;
  audioSampleRate?: number;
  
  // Additional metadata
  creationTime?: string;
  encoder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mediaInfoInstance: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initializeMediaInfo = async (): Promise<any> => {
  if (mediaInfoInstance) {
    return mediaInfoInstance;
  }

  try {
    mediaInfoInstance = await MediaInfo({
      locateFile: (path: string, prefix: string) => {
        if (path.endsWith('.wasm')) {
          return '/MediaInfoModule.wasm';
        }
        return prefix + path;
      },
    });
    return mediaInfoInstance;
  } catch (error) {
    console.error('Failed to initialize MediaInfo:', error);
    throw new Error('MediaInfo initialization failed');
  }
};

const parseMediaInfoOutput = (output: string, file: File): DetailedVideoMetadata => {
  const lines = output.split('\n');
  const metadata: DetailedVideoMetadata = {
    duration: 0,
    videoWidth: 0,
    videoHeight: 0,
    fileSize: file.size,
    fileName: file.name,
    containerFormat: '',
  };

  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('Format ')) {
      if (!metadata.containerFormat) {
        const formatMatch = /Format\s*:\s*(.+)/.exec(trimmedLine);
        if (formatMatch) {
          metadata.containerFormat = formatMatch[1].trim();
        }
      }
    }
    
    // Detect sections
    if (trimmedLine === 'Video') {
      currentSection = 'video';
      continue;
    } else if (trimmedLine === 'Audio') {
      currentSection = 'audio';
      continue;
    } else if (trimmedLine === 'Menu') {
      currentSection = 'menu';
      continue;
    }
    
    // Parse duration (general section)
    if (trimmedLine.startsWith('Duration ') && currentSection !== 'video' && currentSection !== 'audio') {
      const durationMatch = /Duration\s*:\s*(\d+) ms/.exec(trimmedLine);
      if (durationMatch) {
        metadata.duration = parseInt(durationMatch[1]) / 1000;
      } else {
        // Try to parse HH:MM:SS format
        const timeMatch = /Duration\s*:\s*(\d+):(\d+):(\d+)\.?(\d+)?/.exec(trimmedLine);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const seconds = parseInt(timeMatch[3]);
          const ms = timeMatch[4] ? parseInt(timeMatch[4]) : 0;
          metadata.duration = hours * 3600 + minutes * 60 + seconds + ms / 1000;
        }
      }
    }
    
    // Parse video information
    if (currentSection === 'video') {
      if (trimmedLine.startsWith('Format ')) {
        const formatMatch = /Format\s*:\s*(.+)/.exec(trimmedLine);
        if (formatMatch) {
          metadata.videoCodec = formatMatch[1].trim();
        }
      }
      
      if (trimmedLine.startsWith('Format profile ')) {
        const profileMatch = /Format profile\s*:\s*(.+)/.exec(trimmedLine);
        if (profileMatch) {
          metadata.videoProfile = profileMatch[1].trim();
        }
      }
      
      if (trimmedLine.startsWith('Width ')) {
        const widthMatch = /Width\s*:\s*(\d+)/.exec(trimmedLine);
        if (widthMatch) {
          metadata.videoWidth = parseInt(widthMatch[1]);
        }
      }
      
      if (trimmedLine.startsWith('Height ')) {
        const heightMatch = /Height\s*:\s*(\d+)/.exec(trimmedLine);
        if (heightMatch) {
          metadata.videoHeight = parseInt(heightMatch[1]);
        }
      }
      
      if (trimmedLine.startsWith('Frame rate ')) {
        const fpsMatch = /Frame rate\s*:\s*([\d.]+)/.exec(trimmedLine);
        if (fpsMatch) {
          metadata.videoFrameRate = parseFloat(fpsMatch[1]);
        }
      }
      
      if (trimmedLine.startsWith('Bit rate ')) {
        const bitrateMatch = /Bit rate\s*:\s*(\d+)/.exec(trimmedLine);
        if (bitrateMatch) {
          metadata.videoBitrate = parseInt(bitrateMatch[1]);
        }
      }
      
      if (trimmedLine.startsWith('Color space ')) {
        const colorSpaceMatch = /Color space\s*:\s*(.+)/.exec(trimmedLine);
        if (colorSpaceMatch) {
          metadata.videoColorSpace = colorSpaceMatch[1].trim();
        }
      }
      
      if (trimmedLine.startsWith('Bit depth ')) {
        const bitDepthMatch = /Bit depth\s*:\s*(\d+)/.exec(trimmedLine);
        if (bitDepthMatch) {
          metadata.videoBitDepth = parseInt(bitDepthMatch[1]);
        }
      }
    }
    
    // Parse audio information
    if (currentSection === 'audio') {
      if (trimmedLine.startsWith('Format ')) {
        const formatMatch = /Format\s*:\s*(.+)/.exec(trimmedLine);
        if (formatMatch) {
          metadata.audioCodec = formatMatch[1].trim();
        }
      }
      
      if (trimmedLine.startsWith('Bit rate ')) {
        const bitrateMatch = /Bit rate\s*:\s*(\d+)/.exec(trimmedLine);
        if (bitrateMatch) {
          metadata.audioBitrate = parseInt(bitrateMatch[1]);
        }
      }
      
      if (trimmedLine.startsWith('Channel(s) ')) {
        const channelsMatch = /Channel\(s\)\s*:\s*(\d+)/.exec(trimmedLine);
        if (channelsMatch) {
          metadata.audioChannels = parseInt(channelsMatch[1]);
        }
      }
      
      if (trimmedLine.startsWith('Sampling rate ')) {
        const sampleRateMatch = /Sampling rate\s*:\s*(\d+)/.exec(trimmedLine);
        if (sampleRateMatch) {
          metadata.audioSampleRate = parseInt(sampleRateMatch[1]);
        }
      }
    }
    
    // Parse general metadata
    if (trimmedLine.startsWith('Encoded date ') || trimmedLine.startsWith('Tagged date ')) {
      const dateMatch = /(Encoded date|Tagged date)\s*:\s*(.+)/.exec(trimmedLine);
      if (dateMatch && !metadata.creationTime) {
        metadata.creationTime = dateMatch[2].trim();
      }
    }
    
    if (trimmedLine.startsWith('Writing application ') || trimmedLine.startsWith('Encoder ')) {
      const encoderMatch = /(Writing application|Encoder)\s*:\s*(.+)/.exec(trimmedLine);
      if (encoderMatch && !metadata.encoder) {
        metadata.encoder = encoderMatch[2].trim();
      }
    }
  }
  
  return metadata;
};

export const extractDetailedVideoMetadata = async (file: File): Promise<DetailedVideoMetadata> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mediaInfo = await initializeMediaInfo();
    
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Analyze file with MediaInfo
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const result = await mediaInfo.analyzeData(() => uint8Array.length, (chunkSize: number, offset: number) => {
      const chunk = uint8Array.slice(offset, offset + chunkSize);
      return chunk;
    });
    
    // Parse the result
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const metadata = parseMediaInfoOutput(result, file);
    
    return metadata;
  } catch (error) {
    console.error('Failed to extract detailed metadata:', error);
    
    // Fallback to basic metadata
    return {
      duration: 0,
      videoWidth: 0,
      videoHeight: 0,
      fileSize: file.size,
      fileName: file.name,
      containerFormat: file.type ? file.type.replace('video/', '').toUpperCase() : 'Unknown',
    };
  }
};

export const formatBitrate = (bitrate: number): string => {
  if (bitrate >= 1_000_000) {
    return `${(bitrate / 1_000_000).toFixed(1)} Mbps`;
  } else if (bitrate >= 1_000) {
    return `${(bitrate / 1_000).toFixed(0)} Kbps`;
  }
  return `${bitrate.toString()} bps`;
};

export const formatSampleRate = (sampleRate: number): string => {
  if (sampleRate >= 1_000) {
    return `${(sampleRate / 1_000).toFixed(1)} kHz`;
  }
  return `${sampleRate.toString()} Hz`;
};