import { MediaFormat, MediaType } from "@repo/database";

export const MEDIA_TYPES: MediaType[] = ["IMAGE", "VIDEO"];
export const MEDIA_FORMATS: MediaFormat[] = [
  "JPEG",
  "PNG",
  "MP4",
  "MOV",
  "MKV",
];

// single source of truth
const MEDIA_MAP: Record<string, { type: MediaType; format: MediaFormat }> = {
  "image/jpeg": { type: "IMAGE", format: "JPEG" },
  "image/png": { type: "IMAGE", format: "PNG" },
  "video/mp4": { type: "VIDEO", format: "MP4" },
  "video/quicktime": { type: "VIDEO", format: "MOV" },
  "video/x-matroska": { type: "VIDEO", format: "MKV" },
};

// reverse lookup (format → raw MIME)
const FORMAT_TO_RAW: Record<MediaFormat, string> = Object.entries(
  MEDIA_MAP
).reduce(
  (acc, [raw, { format }]) => {
    acc[format] = raw;
    return acc;
  },
  {} as Record<MediaFormat, string>
);

/**
 * Get media type & format from raw MIME string
 */
export const getMediaTypeAndFormatFromRaw = (
  raw: string
): { type: MediaType; format: MediaFormat } | null => MEDIA_MAP[raw] ?? null;

/**
 * Get raw MIME string from format
 */
export const getRawFormatFromFormat = (format: MediaFormat): string | null =>
  FORMAT_TO_RAW[format] ?? null;

/**
 * Get media type directly from format
 */
export const getMediaTypeFromFormat = (format: MediaFormat): MediaType | null =>
  MEDIA_MAP[FORMAT_TO_RAW[format] ?? ""]?.type ?? null;
