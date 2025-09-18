"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { schedulePost } from "@/lib/upstash";
import { createPostSchema } from "@/zod-schemas/create-post-schema";
import * as z from "zod";

const idSchema = z.object({
  id: z.string(),
});

export const updatePost = async (data: unknown) => {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    };
  }
  const schema = idSchema.merge(createPostSchema);
  const parsedResponse = schema.safeParse(data);
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

  const post = await db.post.update({
    where: {
      id: validatedData.id,
    },
    data: {
      text: validatedData.text,
      scheduledAt: validatedData.scheduledAt,
      posted: false,
      socialAccount: {
        connect: validatedData.accountIds.map((accountId) => ({
          id: accountId,
        })),
      },
    },
  });
  await schedulePost(post.id, validatedData.scheduledAt);

  return {
    ok: true,
    data: post,
  };
};
