"use server";

import { ServerActionResponse } from "@/app/types/server-action-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const deleteApiKey = async ({
  id,
}: {
  id: string;
}): Promise<ServerActionResponse<void>> => {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You must be logged in to delete an API key",
    };
  }

  await db.apiKey.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return {
    ok: true,
    data: undefined,
  };
};
