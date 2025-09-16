import { Media, Post, SocialAccount } from "@prisma/client";
import axios, { Axios } from "axios";
import { db } from "../db";

export const postOnLinkedIn = async (
  account: SocialAccount,
  post: Post & { media: Media[] },
  safeText: string
) => {
  const mediaArray: {
    mediaAsset: unknown;
    type: "STILLIMAGE" | "VIDEO";
  }[] = [];
  const linkedInAccount = await db.linkedInAccount.findUnique({
    where: {
      socialAccountId: account.id,
    },
  });
  if (!linkedInAccount) {
    throw new Error("Linkedin Account not found");
  }
  for (const media of post.media) {
    const uploadUrlResponse = await axios.post(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: `urn:li:person:${linkedInAccount.uuid}`, // or org URN if posting as a company
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${linkedInAccount.accessToken}`,
          "LinkedIn-Version": "202508",
        },
      }
    );
    const uploadUrl =
      uploadUrlResponse.data.value.uploadMechanism[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ].uploadUrl;
    const mediaAsset = uploadUrlResponse.data.value.asset;

    const buffer = await axios.get(media.url, {
      responseType: "arraybuffer",
    });
    console.log(buffer ? "buffer found" : "buffer not found");
    const uploadResponse = await axios.put(uploadUrl, buffer.data, {
      headers: {
        "Content-Type": media.type === "IMAGE" ? "image/jpeg" : "video/mp4",
        "Content-Length": buffer.data.length,
      },
    });
    if (uploadResponse.status === 201) {
      mediaArray.push({
        mediaAsset,
        type: media.type === "IMAGE" ? "STILLIMAGE" : "VIDEO",
      });
    }
  }
  if (mediaArray.length > 1) {
    await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        lifecycleState: "PUBLISHED",
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: safeText,
            },
            shareMediaCategory: "IMAGE",
            media: mediaArray.map((media) => ({
              status: "READY",
              media: media.mediaAsset,
            })),
            shareCategorization: {},
          },
        },
        author: `urn:li:person:${linkedInAccount.uuid}`,
      },
      {
        headers: {
          Authorization: `Bearer ${linkedInAccount.accessToken}`,
          "LinkedIn-Version": "202508",
        },
      }
    );
  } else {
    await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        lifecycleState: "PUBLISHED",
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: safeText,
            },
            shareMediaCategory: "NONE",
            shareCategorization: {},
          },
        },
        author: `urn:li:person:${linkedInAccount.uuid}`,
      },
      {
        headers: {
          Authorization: `Bearer ${linkedInAccount.accessToken}`,
          "LinkedIn-Version": "202508",
        },
      }
    );
  }
};
