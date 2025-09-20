import { db } from "@/lib/db";
import { schedulePost } from "@/lib/upstash";
import { createPostSchema } from "@/zod-schemas/create-post-schema";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const body = await req.json();
  const headers = req.headers;
  const ApiKey = headers.get("X-Api-Key");
  const ApiSecret = headers.get("X-Api-Secret");
  if (!ApiKey || !ApiSecret) {
    return Response.json({
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    });
  }
  const apiKey = await db.apiKey.findUnique({
    where: {
      key: ApiKey,
    },
  });
  if (!apiKey) {
    return Response.json({
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    });
  }

  const isApiSecretValid = bcrypt.compareSync(ApiSecret, apiKey.secret);
  if (!isApiSecretValid) {
    return Response.json({
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    });
  }
  const user = await db.user.findUnique({
    where: {
      id: apiKey.userId,
    },
  });
  if (!user) {
    return Response.json({
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    });
  }
  const parsedResponse = createPostSchema.safeParse(body);
  if (parsedResponse.error) {
    const formattedErrors = parsedResponse.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    if (parsedResponse.error.errors[0].code === "custom") {
      return Response.json({
        error: "Invalid Time",
        description: "Their Should have at least 1 minute from now",
      });
    }
    return Response.json({
      error: "Invalid data",
      description: formattedErrors,
    });
  }
  const validatedData = parsedResponse.data;

  const validAccountIds = await db.socialAccount.findMany({
    where: {
      id: {
        in: validatedData.accountIds,
      },
    },
  });

  if (validAccountIds.length !== validatedData.accountIds.length) {
    return Response.json({
      error: "Invalid Account",
      description: "The account you provided is invalid",
    });
  }
  const validMediaIds = await db.media.findMany({
    where: {
      id: {
        in: validatedData.mediaIds,
      },
      userId: user.id,
    },
  });
  if (validMediaIds.length !== validatedData.mediaIds.length) {
    return Response.json({
      ok: false,
      error: "Invalid Media",
      description: "The media you provided is invalid",
    });
  }

  const post = await db.post.create({
    data: {
      userId: user.id,
      text: validatedData.text,
      scheduledAt: validatedData.postNow
        ? new Date()
        : validatedData.scheduledAt,
      media: {
        connect: validatedData.mediaIds.map((mediaId) => ({
          id: mediaId,
        })),
      },
      socialAccount: {
        connect: validatedData.accountIds.map((accountId) => ({
          id: accountId,
        })),
      },
    },
  });

  await schedulePost(post.id, post.scheduledAt);

  return Response.json({
    ok: true,
    data: post,
  });
}

export async function GET() {
  return Response.json({
    ok: true,
  });
}
