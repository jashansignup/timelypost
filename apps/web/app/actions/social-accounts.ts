"use server";

import { redirect } from "next/navigation";
import TwitterApi from "twitter-api-v2";
import { cookies } from "next/headers";
import { SocialAccountType } from "@repo/database";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
});
export const connectAccount = async (type: SocialAccountType) => {
  if (type !== "X") {
    throw new Error("Invalid account type");
  }
  const response = await client.generateAuthLink(
    "http://localhost:3000/api/integrations/social/x"
  );
  const cookieStore = await cookies();
  cookieStore.set("oauth_token_secret", response.oauth_token_secret);

  redirect(response.url);
};

export const deleteAccount = async (id: string) => {
  const session = await auth();
  if (!session?.user) {
    throw new Error("User not found");
  }
  await db.socialAccount.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });
  revalidatePath("/dashboard/accounts");
  return true;
};
