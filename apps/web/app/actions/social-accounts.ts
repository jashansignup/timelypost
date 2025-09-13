"use server";

import { redirect } from "next/navigation";
import TwitterApi from "twitter-api-v2";
import { cookies } from "next/headers";
import { SocialAccountType } from "@repo/database";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { BASE_URL } from "@/lib/constants";
import axios from "axios";

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
});
export const connectAccount = async (type: SocialAccountType) => {
  if (type === "X") {
    console.log(`i am running x`);
    const response = await client.generateAuthLink(
      "http://localhost:3000/api/integrations/social/x"
    );
    const cookieStore = await cookies();
    cookieStore.set("oauth_token_secret", response.oauth_token_secret);
    redirect(response.url);
  } else if (type === "LINKEDIN") {
    console.log(`i am running linkedin`);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: `${BASE_URL}/api/integrations/social/linkedin`,
      scope: "openid profile email w_member_social r_basicprofile ",
      state: Math.random().toString(36).substring(2, 15),
    });

    const redirectUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    redirect(redirectUrl);
  }
  throw new Error("Invalid account type");
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

// export const updateAccount = async (id: string) => {
//   const session = await auth();
//   if (!session?.user) {
//     throw new Error("User not found");
//   }
//   const account = await db.socialAccount.findUnique({
//     where: {
//       id,
//       userId: session.user.id,
//     },
//   });
//   if (!account) {
//     throw new Error("Account not found");
//   }
//   if (account.type === "LINKEDIN") {
//     const response = await axios.get("https://api.linkedin.com/v2/me", {
//       headers: {
//         Authorization: `Bearer ${account.accessToken}`,
//       },
//     });
//     console.log(response.data);
//     await db.socialAccount.update({
//       where: {
//         id,
//         userId: session.user.id,
//       },
//       data: {
//         username: response.data.vanityName,
//       },
//     });
//     revalidatePath("/dashboard/accounts");
//   }
//   return true;
// };
