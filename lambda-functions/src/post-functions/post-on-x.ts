import type { SocialAccount, Post, Media } from "@prisma/client";
import { TwitterApi } from "twitter-api-v2";
import axios from "axios";

export const postOnX = async (
  account: SocialAccount,
  post: Post & { media: Media[] },
  safeText: string
) => {
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: account.accessToken,
    accessSecret: account.accessSecret,
  });
  let mediaIds: string[] = [];
  if (post.media) {
    for (const media of post.media) {
      const response = await axios.get(media.url, {
        responseType: "arraybuffer",
      });
      const mediaId = await client.v1.uploadMedia(response.data, {
        mimeType: media.type,
      });
      mediaIds.push(mediaId);
    }
    await client.v2.tweet(safeText, {
      ...(mediaIds.length > 0
        ? {
            media: {
              media_ids: mediaIds as [string],
            },
          }
        : {}),
    });
  }
};
