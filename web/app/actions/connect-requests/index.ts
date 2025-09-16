"use server";
import { SocialAccountType } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { connectX } from "./connect-x";
import { connectLinkedin } from "./connect-linkedin";
import { ServerActionResponse } from "@/app/types/server-action-response";

export const connectAccount = async (
  type: SocialAccountType
): Promise<ServerActionResponse<{ url: string }>> => {
  try {
    if (type === "X") {
      const res = connectX();
      return res;
    } else if (type === "LINKEDIN") {
      const res = connectLinkedin();
      return res;
    }
    return {
      ok: false,
      error: "Invalid account type",
      description: "The account type is not allowed",
    };
  } catch {
    return {
      ok: false,
      error: "Internal server error",
      description: "An error occurred while connecting to the account",
    };
  }
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
