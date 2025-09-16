import { Media, Post, SocialAccount } from "@prisma/client";
import axios from "axios";
import { db } from "../db";

export const postOnLinkedIn = async (
  account: SocialAccount,
  post: Post & { media: Media[] },
  safeText: string
) => {
  // Fetch LinkedIn account details for the given social account
  const linkedInAccount = await db.linkedInAccount.findUnique({
    where: { socialAccountId: account.id },
  });
  if (!linkedInAccount) {
    throw new Error("LinkedIn account not found");
  }

  // Common headers for LinkedIn API calls
  const apiHeaders = {
    Authorization: `Bearer ${linkedInAccount.accessToken}`,
    "LinkedIn-Version": "202508",
  } as const;

  // Helper: publish a text-only post
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
            shareCommentary: { text: post.text },
            shareMediaCategory: "NONE",
            shareCategorization: {},
          },
        },
        author: `urn:li:person:${linkedInAccount.uuid}`,
      },
      { headers: apiHeaders }
    );
  };

  // Filter images only (we ignore videos for now)
  const images = (post.media || []).filter((m) => m.type === "IMAGE");

  // If there are no images, publish a text-only post
  if (!images.length) {
    return publishTextPost();
  }

  // Helper: Register an image upload and return the asset URN and upload URL
  const registerImageUpload = async () => {
    const res = await axios.post(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: `urn:li:person:${linkedInAccount.uuid}`,
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
      asset: res.data.value.asset as string, // e.g., "urn:li:digitalmediaAsset:..."
    };
  };

  // Upload all images sequentially to preserve order (can be parallelized if needed)
  const uploadedAssets: string[] = [];
  for (const img of images) {
    try {
      const { uploadUrl, asset } = await registerImageUpload();
      const fileResp = await axios.get(img.url, {
        responseType: "arraybuffer",
      });
      await axios.put(uploadUrl, fileResp.data, {
        headers: {
          "Content-Type": "image/jpeg", // Adjust if you store/know exact mime type
          "Content-Length": fileResp.data.length,
        },
      });
      uploadedAssets.push(asset);
    } catch (err) {
      console.error("LinkedIn image upload failed:", err);
      // Best effort: continue with other images
    }
  }

  // If no assets ended up uploaded, fallback to text-only post
  if (!uploadedAssets.length) {
    return publishTextPost();
  }

  // Publish an image post (single or multiple)
  await axios.post(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      lifecycleState: "PUBLISHED",
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: post.text },
          shareMediaCategory: "IMAGE",
          media: uploadedAssets.map((asset) => ({
            status: "READY",
            media: asset,
          })),
          shareCategorization: {},
        },
      },
      author: `urn:li:person:${linkedInAccount.uuid}`,
    },
    { headers: apiHeaders }
  );
};
