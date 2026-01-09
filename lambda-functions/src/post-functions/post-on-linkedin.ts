import { Media, Post, SocialAccount } from "@prisma/client";
import axios from "axios";
import { db } from "../db";
import { htmlToText } from "html-to-text";

const LINKEDIN_API_VERSION = "202508";

export const postOnLinkedIn = async (
  account: SocialAccount,
  post: Post & { media: Media[] },
  safeText: string
) => {
  const linkedInAccount = await db.linkedInAccount.findUnique({
    where: { socialAccountId: account.id },
  });
  if (!linkedInAccount) {
    throw new Error("LinkedIn account not found");
  }
  const text = htmlToText(post.text, { wordwrap: false });

  const apiHeaders = {
    Authorization: `Bearer ${linkedInAccount.accessToken}`,
    "LinkedIn-Version": LINKEDIN_API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
  } as const;

  const ownerUrn = `urn:li:person:${linkedInAccount.uuid}`;

  const publishTextPost = async () => {
    await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        lifecycleState: "PUBLISHED",
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: text },
            shareMediaCategory: "NONE",
            shareCategorization: {},
          },
        },
        author: ownerUrn,
      },
      { headers: apiHeaders }
    );
  };

  const images = (post.media || []).filter((m) => m.type === "IMAGE");
  const videos = (post.media || []).filter((m) => m.type === "VIDEO");

  if (!images.length && !videos.length) {
    return publishTextPost();
  }

  if (videos.length > 0) {
    const video = videos[0];
    try {
      await uploadAndPostVideo(video, text, ownerUrn, apiHeaders);
      return;
    } catch (err) {
      console.error("LinkedIn video upload failed:", err);
      if (!images.length) {
        return publishTextPost();
      }
    }
  }

  const registerImageUpload = async () => {
    const res = await axios.post(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: ownerUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      },
      { headers: apiHeaders }
    );

    const mechanism =
      res.data.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ];
    return {
      uploadUrl: mechanism.uploadUrl as string,
      asset: res.data.value.asset as string,
    };
  };

  const uploadedAssets: string[] = [];
  for (const img of images) {
    try {
      const { uploadUrl, asset } = await registerImageUpload();
      const fileResp = await axios.get(img.url, {
        responseType: "arraybuffer",
      });
      const contentType = getContentTypeFromFormat(img.format);
      await axios.put(uploadUrl, fileResp.data, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": fileResp.data.length,
        },
      });
      uploadedAssets.push(asset);
    } catch (err) {
      console.error("LinkedIn image upload failed:", err);
    }
  }

  if (!uploadedAssets.length) {
    return publishTextPost();
  }

  await axios.post(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      lifecycleState: "PUBLISHED",
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: text },
          shareMediaCategory: "IMAGE",
          media: uploadedAssets.map((asset) => ({
            status: "READY",
            media: asset,
          })),
          shareCategorization: {},
        },
      },
      author: ownerUrn,
    },
    { headers: apiHeaders }
  );
};

function getContentTypeFromFormat(format: string): string {
  const formatMap: Record<string, string> = {
    JPEG: "image/jpeg",
    PNG: "image/png",
    MP4: "video/mp4",
    MOV: "video/quicktime",
    MKV: "video/x-matroska",
  };
  return formatMap[format] || "application/octet-stream";
}

async function uploadAndPostVideo(
  video: Media,
  text: string,
  ownerUrn: string,
  apiHeaders: Record<string, string>
) {
  const fileResp = await axios.get(video.url, {
    responseType: "arraybuffer",
  });
  const videoData = fileResp.data as Buffer;
  const fileSizeBytes = videoData.length;

  const initResponse = await axios.post(
    "https://api.linkedin.com/rest/videos?action=initializeUpload",
    {
      initializeUploadRequest: {
        owner: ownerUrn,
        fileSizeBytes: fileSizeBytes,
        uploadCaptions: false,
        uploadThumbnail: false,
      },
    },
    {
      headers: {
        ...apiHeaders,
        "Content-Type": "application/json",
      },
    }
  );

  const { value } = initResponse.data;
  const videoUrn = value.video as string;
  const uploadInstructions = value.uploadInstructions as Array<{
    uploadUrl: string;
    firstByte: number;
    lastByte: number;
  }>;

  const uploadedPartIds: string[] = [];
  for (const instruction of uploadInstructions) {
    const { uploadUrl, firstByte, lastByte } = instruction;
    const chunk = videoData.slice(firstByte, lastByte + 1);

    const uploadResponse = await axios.put(uploadUrl, chunk, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    const etag = uploadResponse.headers["etag"];
    if (etag) {
      uploadedPartIds.push(etag);
    }
  }

  await axios.post(
    "https://api.linkedin.com/rest/videos?action=finalizeUpload",
    {
      finalizeUploadRequest: {
        video: videoUrn,
        uploadToken: "",
        uploadedPartIds: uploadedPartIds,
      },
    },
    {
      headers: {
        ...apiHeaders,
        "Content-Type": "application/json",
      },
    }
  );

  await waitForVideoProcessing(videoUrn, apiHeaders);

  await axios.post(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      lifecycleState: "PUBLISHED",
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: text },
          shareMediaCategory: "VIDEO",
          media: [
            {
              status: "READY",
              media: videoUrn,
            },
          ],
          shareCategorization: {},
        },
      },
      author: ownerUrn,
    },
    { headers: apiHeaders }
  );
}

async function waitForVideoProcessing(
  videoUrn: string,
  apiHeaders: Record<string, string>,
  maxAttempts: number = 30,
  delayMs: number = 2000
): Promise<void> {
  const videoId = videoUrn.replace("urn:li:video:", "");

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/rest/videos/${videoId}`,
        { headers: apiHeaders }
      );

      const status = response.data.status;
      if (status === "AVAILABLE") {
        return;
      }
      if (status === "PROCESSING_FAILED") {
        throw new Error(
          `Video processing failed: ${response.data.processingFailureReason || "Unknown reason"}`
        );
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        throw err;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Video processing timed out");
}
