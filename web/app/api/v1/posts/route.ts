import { db } from "@/lib/db";
import { createPostSchema } from "@/zod-schemas/create-post-schema";

export async function POST(req: Request) {
  const body = req.body;
  const headers = req.headers;

  const ApiKey = headers.get("x-api-key");
  if (!ApiKey) {
    return Response.json({
      ok: false,
      error: "Unauthorized",
      description: "You are not authorized to perform this action",
    });
  }

  const parsedResponse = createPostSchema.safeParse(body);
  if (parsedResponse.error) {
    if (parsedResponse.error.errors[0].code === "custom") {
      return Response.json({
        error: "Invalid Time",
        description: "Their Should have at least 1 minute from now",
      });
    }
    return Response.json({
      error: "Invalid data",
      description: "The data you provided is invalid",
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
}

export async function GET() {
  return Response.json({
    ok: true,
  });
}
