"use server";

import { ServerActionResponse } from "@/app/types/server-action-response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const createApiKey = async ({
  name,
}: {
  name: string;
}): Promise<
  ServerActionResponse<{
    key: string;
    secret: string;
  }>
> => {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return {
      ok: false,
      error: "Unauthorized",
      description: "You must be logged in to create an API key",
    };
  }

  if (!name) {
    return {
      ok: false,
      error: "Name is required",
      description: "Please provide a name for the API key",
    };
  }

  const key = crypto.randomUUID();
  const secret = crypto.randomUUID();

  const apiKey = await db.apiKey.create({
    data: {
      name,
      key: key,
      secret: bcrypt.hashSync(secret, 10),
      userId: session.user.id,
    },
  });

  return {
    ok: true,
    data: {
      key: apiKey.key,
      // Return plaintext secret once; do not expose hashed secret
      secret: secret,
    },
  };
};
