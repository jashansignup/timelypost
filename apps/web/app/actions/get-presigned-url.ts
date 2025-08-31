"use server";
import { auth } from "@/lib/auth";
import { ServerActionResponse } from "../types/server-action-response";
import { generatePreSignedUrlS3 } from "@/lib/s3-config";
import { getUploadPathConfig } from "@/lib/constants";

export const getPresignedUrl = async ({
  name,
  size,
  contentType,
  pathKey,
}: {
  name: string;
  size: number;
  contentType: string;
  pathKey: string;
}): Promise<ServerActionResponse<{ url: string; id: string }>> => {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    };
  }
  const uploadConfig = getUploadPathConfig(pathKey);

  if (!uploadConfig.allowedMimeTypes.includes(contentType)) {
    return {
      ok: false,
      error: "Invalid content type",
      description:
        "The content type is not allowed. Allowed types are: " +
        uploadConfig.allowedMimeTypes.join(", "),
    };
  }

  if (size > uploadConfig.maxSizeBytes) {
    return {
      ok: false,
      error: "File size too large",
      description:
        "The file size is too large. The maximum allowed size is " +
        uploadConfig.maxSizeBytes / 1024 / 1024 +
        " MB.",
    };
  }

  const res = await generatePreSignedUrlS3({
    path: uploadConfig.path,
    fileName: name,
    contentType,
    pathKey,
    // TODO: fix it using the very vague type
    type: contentType.includes("image") ? "IMAGE" : "VIDEO",
    size,
  });
  return {
    ok: true,
    data: {
      url: res.url,
      id: res.redisStoreId,
    },
  };
};
