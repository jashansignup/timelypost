"use server";

import { auth } from "@/lib/auth";
import { ServerActionResponse } from "../types/server-action-response";
import { db, redis } from "@/lib/db";
import { Media } from "@repo/database";
import { getMediaTypeAndFormatFromRaw } from "@/lib/media-helper";

export const addMediaToUser = async ({
  mediaId,
}: {
  mediaId: string;
}): Promise<ServerActionResponse<{ id: string }>> => {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    };
  }

  const mediaDetialsString = await redis.get(mediaId);

  if (!mediaDetialsString) {
    return {
      ok: false,
      error: "Media not found",
      description: "The media you are trying to access does not exist",
    };
  }

  const mediaJson = JSON.parse(mediaDetialsString);

  const mediaTypeAndFormat = getMediaTypeAndFormatFromRaw(
    mediaJson.contentType
  );
  if (!mediaTypeAndFormat) {
    return {
      ok: false,
      error: "Invalid media type",
      description: "The media type is not allowed",
    };
  }

  await db.media.create({
    data: {
      url: mediaJson.publicUrl as string,
      type: mediaTypeAndFormat.type,
      format: mediaTypeAndFormat.format,
      size: mediaJson.size as number,
      name: mediaJson.name as string,
      userId: session.user.id as string,
    },
  });

  return {
    ok: true,
    data: {
      id: mediaId,
    },
  };
};

export const listMyMedia = async (): Promise<ServerActionResponse<Media[]>> => {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    };
  }

  const mediaItems = await db.media.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return {
    ok: true,
    data: mediaItems as unknown as Media[],
  };
};
