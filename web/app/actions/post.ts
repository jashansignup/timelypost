"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ServerActionResponse } from "../types/server-action-response";
import { Post } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const deletePost = async (
  postId: string
): Promise<ServerActionResponse<Post>> => {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    };
  }
  const post = await db.post.delete({
    where: {
      id: postId,
    },
  });
  revalidatePath("/dashboard/scheduled");
  return {
    ok: true,
    data: post,
  };
};
