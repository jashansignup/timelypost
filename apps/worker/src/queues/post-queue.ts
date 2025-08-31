import type { Post } from "@repo/database";
import { Job, Queue, Worker } from "bullmq";
import { db, redis } from "../lib/db.js";
import { quillHtmlToUnicode } from "../lib/unicode-converter.js";
import { TwitterApi } from "twitter-api-v2";
import { env } from "../lib/env.js";
import axios from "axios";
export const postQueue = new Queue("post-queue", {
  connection: redis,
});

new Worker(
  "post-queue",
  async (job: Job<{ postId: string }>) => {
    try {
      console.log(`postid`, job.data.postId);
      const post = await db.post.findUnique({
        where: {
          id: job.data.postId,
        },
        include: {
          socialAccount: true,
          media: true,
        },
      });
      if (!post) {
        return;
      }
      const safeText = quillHtmlToUnicode(post.text);

      for (const account of post.socialAccount) {
        const client = new TwitterApi({
          appKey: env.X_API_KEY,
          appSecret: env.X_API_SECRET,
          accessToken: account.accessToken,
          accessSecret: account.accessSecret,
        });
        if (account.type === "X") {
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
          await db.post.update({
            where: {
              id: post.id,
            },
            data: {
              posted: true,
            },
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  {
    connection: redis,
  }
);
