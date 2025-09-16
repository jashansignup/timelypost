import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { db } from "@/lib/db";
import { SocialAccountType } from "@prisma/client";
import TwitterApi from "twitter-api-v2";
import { redirect } from "next/navigation";

export async function XAuth(req: NextRequest, session: Session) {
  if (!session.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const oauth_token = searchParams.get("oauth_token");
  const oauth_verifier = searchParams.get("oauth_verifier");
  const oauth_token_secret = req.cookies.get("oauth_token_secret")?.value;

  if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });
  const { accessToken, accessSecret, screenName } =
    await client.login(oauth_verifier);
  const user = await db.user.findUnique({
    where: {
      email: session.user.email!,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  await db.$transaction(async (tx) => {
    const socialAccount = await tx.socialAccount.create({
      data: {
        userId: user.id,
        type: SocialAccountType.X,
        username: screenName,
      },
    });
    await tx.xAccount.create({
      data: {
        socialAccountId: socialAccount.id,
        accessToken,
        accessSecretToken: accessSecret,
        lastRefreshedAt: new Date(),
      },
    });
  });
  redirect("/dashboard/accounts");
}
