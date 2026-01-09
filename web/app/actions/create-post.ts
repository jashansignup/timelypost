"use server";

import { db } from "@/lib/db";
import { createPostSchema } from "@/zod-schemas/create-post-schema";
import { ServerActionResponse } from "../types/server-action-response";
import { Post } from "@prisma/client";
import { auth } from "@/lib/auth";
import { schedulePost } from "@/lib/upstash";
import z from "zod";
export const createPost = async (
  data: z.infer<typeof createPostSchema>
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
  const validMediaIds = await db.media.findMany({
    where: {
      id: {
        in: validatedData.mediaIds,
      },
      userId: session.user.id,
    },
  });
  if (validMediaIds.length !== validatedData.mediaIds.length) {
    return {
      ok: false,
      error: "Invalid Media",
      description: "The media you provided is invalid",
    };
  }
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
      scheduledAt: validatedData.postNow
        ? new Date()
        : validatedData.scheduledAt,
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

  const messageId = await schedulePost(post.id, post.scheduledAt);
  await db.post.update({
    where: {
      id: post.id,
    },
    data: {
      scheduleId: messageId,
    },
  });
  return {
    ok: true,
    data: post,
  };
};
