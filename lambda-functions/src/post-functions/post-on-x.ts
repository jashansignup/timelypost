import type { SocialAccount, Post, Media, MediaFormat } from "@prisma/client";
import { TwitterApi, EUploadMimeType } from "twitter-api-v2";
import axios from "axios";
import { db } from "../db";
import { withRetry } from "../utils/retry";

function getMimeTypeFromFormat(format: MediaFormat): EUploadMimeType {
  const formatMap: Record<MediaFormat, EUploadMimeType> = {
    JPEG: EUploadMimeType.Jpeg,
    PNG: EUploadMimeType.Png,
    MP4: EUploadMimeType.Mp4,
    MOV: EUploadMimeType.Mp4,
    MKV: EUploadMimeType.Mp4,
  };
  return formatMap[format] || EUploadMimeType.Jpeg;
}

export const postOnX = async (
  account: SocialAccount,
  post: Post & { media: Media[] },
  safeText: string
) => {
  const xAccount = await db.xAccount.findUnique({
    where: {
      socialAccountId: account.id,
    },
  });
  if (!xAccount) {
    throw new Error("X Account not found");
  }
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: xAccount.accessToken,
    accessSecret: xAccount.accessSecretToken,
  });

  const mediaIds: string[] = [];
  for (const media of post.media) {
    const mediaId = await withRetry(
      async () => {
        const response = await axios.get(media.url, {
          responseType: "arraybuffer",
          timeout: 60000,
        });

        const mimeType = getMimeTypeFromFormat(media.format);
        const isVideo = media.type === "VIDEO";

        return client.v1.uploadMedia(Buffer.from(response.data), {
          mimeType: mimeType,
          type: isVideo ? "longvideo" : undefined,
        });
      },
      { maxAttempts: 3, initialDelayMs: 2000 }
    );
    mediaIds.push(mediaId);
  }

  await withRetry(
    async () => {
      await client.v2.tweet(safeText, {
        ...(mediaIds.length > 0
          ? {
              media: {
                media_ids: mediaIds as [string],
              },
            }
          : {}),
      });
    },
    { maxAttempts: 3, initialDelayMs: 2000 }
  );
};
