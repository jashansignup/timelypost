"use server";

import { auth } from "@/lib/auth";
import { ServerActionResponse } from "../types/server-action-response";
import { db } from "@/lib/db";
import { Media } from "@prisma/client";
import { getMediaTypeAndFormatFromRaw } from "@/lib/media-helper";
import { deleteFromS3 } from "@/lib/s3-config";

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

  // const mediaDetialsString = await redis.get(mediaId);
  const media = await db.s3PreSignedUrl.findUnique({
    where: {
      uuid: mediaId,
    },
  });

  if (!media) {
    return {
      ok: false,
      error: "Media not found",
      description: "The media you are trying to access does not exist",
    };
  }

  const mediaTypeAndFormat = getMediaTypeAndFormatFromRaw(media.contentType);
  if (!mediaTypeAndFormat) {
    return {
      ok: false,
      error: "Invalid media type",
      description: "The media type is not allowed",
    };
  }

  await db.media.create({
    data: {
      url: media.publicUrl as string,
      type: mediaTypeAndFormat.type,
      format: mediaTypeAndFormat.format,
      size: media.size as unknown as number,
      name: media.name as string,
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

export const deleteMedia = async ({
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

  const media = await db.media.delete({
    where: { id: mediaId, userId: session.user.id },
  });

  await deleteFromS3(media.url);

  return {
    ok: true,
    data: {
      id: mediaId,
    },
  };
};
