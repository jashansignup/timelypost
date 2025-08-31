"use server";

import { db } from "@/lib/db";
import { createPostSchema } from "@/zod-schemas/create-post-schema";
import { ServerActionResponse } from "../types/server-action-response";
import { Post } from "@repo/database";
import { auth } from "@/lib/auth";
import { quillHtmlToUnicode } from "@/lib/unicode-converter";
import { Queue } from "bullmq";
import { redis } from "@/lib/db";

const postQueue = new Queue("post-queue", {
  connection: {
    url: process.env.VALKEY_URL!,
  },
});

export const createPost = async (
  data: unknown
): Promise<ServerActionResponse<Post>> => {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    };
  }
  const parsedResponse = createPostSchema.safeParse(data);
  if (!parsedResponse.success) {
    if (parsedResponse.error.errors[0].code === "custom") {
      return {
        ok: false,
        error: "Invalid Time",
        description: "Their Should have at least 1 minute from now",
      };
    }
    return {
      ok: false,
      error: "Invalid data",
      description: "The data you provided is invalid",
    };
  }
  const validatedData = parsedResponse.data;

  const validAccountIds = await db.socialAccount.findMany({
    where: {
      id: {
        in: validatedData.accountIds,
      },
      userId: session.user.id,
    },
  });

  if (validAccountIds.length !== validatedData.accountIds.length) {
    return {
      ok: false,
      error: "Invalid Account",
      description: "The account you provided is invalid",
    };
  }

  const post = await db.post.create({
    data: {
      userId: session.user.id!,
      text: validatedData.text,
      scheduledAt: validatedData.isScheduled
        ? validatedData.scheduledAt
        : new Date(),
      // TODO: fix the media make sure media belongs to user
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

  if (
    !validatedData.isScheduled ||
    validatedData.scheduledAt.getTime() < new Date().getTime() + 60 * 1000
  ) {
    const delay = post.scheduledAt.getTime() - Date.now();
    await postQueue.add(
      "post",
      {
        postId: post.id,
      },
      {
        // delay: Math.max(delay, 0),
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }
  return {
    ok: true,
    data: post,
  };
};
