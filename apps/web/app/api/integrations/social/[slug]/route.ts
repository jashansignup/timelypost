import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SocialAccountType } from "@repo/database";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import TwitterApi from "twitter-api-v2";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
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
  const {
    client: loggedClient,
    accessToken,
    accessSecret,
    screenName,
    userId,
  } = await client.login(oauth_verifier);
  console.log("User tokens:", accessToken, accessSecret);

  console.log(screenName);

  const user = await db.user.findUnique({
    where: {
      email: session.user.email!,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  await db.socialAccount.create({
    data: {
      userId: user.id,
      type: SocialAccountType.X,
      username: screenName,
      accessToken,
      accessSecret,
    },
  });

  return redirect("/dashboard/accounts");
}
