import { Media, Post, SocialAccount } from "@prisma/client";
import axios from "axios";

export const postOnLinkedIn = async (
  account: SocialAccount,
  post: Post & { media: Media[] },
  safeText: string
) => {
  const mediaArray: {
    mediaAsset: unknown;
    type: "STILLIMAGE" | "VIDEO";
  }[] = [];
  for (const media of post.media) {
    // const buffer = await axios.get(media.url, {
    //   responseType: "arraybuffer",
    // });
    const uploadUrlResponse = await axios.post(
      "https://api.linkedin.com/v2/assets?action=registerUpload",
      {
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: "urn:li:person:3cy58eFgxe", // or org URN if posting as a company
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
          Authorization: `Bearer ${account.accessToken}`,
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
            text: "Test reshare text",
          },
          shareMediaCategory: "IMAGE",
          media: mediaArray.map((media) => ({
            status: "READY",
            media: media.mediaAsset,
          })),
          shareCategorization: {},
        },
      },
      author: `urn:li:person:3cy58eFgxe`,
    },
    {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "LinkedIn-Version": "202508",
      },
    }
  );
};
