const validUploadPathKeys = ["media"];
export const S3_BUCKET_ENDPOINT = process.env.NEXT_PUBLIC_S3_BUCKET_ENDPOINT!;
const uploadPathConfig: {
  name: (typeof validUploadPathKeys)[number];
  function: () => {
    path: string;
    maxSizeBytes: number;
    allowedMimeTypes: string[];
  };
}[] = [
  {
    name: "media",
    function: () => ({
      path: "meida",
      maxSizeBytes: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: ["image/png", "image/jpeg", "video/mp4"] as const,
    }),
  },
];

export const getUploadPathConfig = (pathKey: string) => {
  const config = uploadPathConfig.find((config) => config.name === pathKey);
  if (!config) {
    throw new Error(`Invalid path key: ${pathKey}`);
  }
  return config.function();
};

export const S3_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "video/mp4",
] as const;

export const S3_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".mp4"] as const;
