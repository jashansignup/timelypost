"use server";
import TwitterApi from "twitter-api-v2";
import { cookies } from "next/headers";
import { ServerActionResponse } from "@/app/types/server-action-response";

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
});
export const connectX = async (): Promise<
  ServerActionResponse<{ url: string }>
> => {
  const response = await client.generateAuthLink(
    "http://localhost:3000/api/integrations/social/x"
  );
  const cookieStore = await cookies();
  cookieStore.set("oauth_token_secret", response.oauth_token_secret);
  return {
    ok: true,
    data: {
      url: response.url,
    },
  };
};
