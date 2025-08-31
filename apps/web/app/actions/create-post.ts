"use server";

import { db } from "@/lib/db";
import { createPostSchema } from "@/zod-schemas/create-post-schema";

export const createPost = async (data: unknown) => {
  const validatedData = createPostSchema.parse(data);
  const post = await db.post.create({
    data: {
      text: validatedData.text,
      scheduledAt: new Date(),
      media: {
        connect: validatedData.mediaIds.map((mediaId) => ({
          id: mediaId,
        })),
      },
      socialAccount: {
        connect: validatedData.accountIds.map((accountId) => ({
          id: accountId,
        })),
      },
    },
  });
  return post;
};
