import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { db } from "@/lib/db";
import { SocialAccountType } from "@repo/database";
import { redirect } from "next/navigation";

export const LinkedInAuth = async (req: NextRequest, session: Session) => {
  try {
    if (!session.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });
    const { searchParams } = new URL(req.url);
    const res = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: `${BASE_URL}/api/integrations/social/linkedin`,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        code: searchParams.get("code")!,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // TODO: Fix the handling of hte error of hte refresh token
    await db.socialAccount.create({
      data: {
        type: SocialAccountType.LINKEDIN,
        userId: session.user.id!,
        accessToken: res.data.access_token,
        accessSecret: res.data.refresh || "not_available",
        username: user?.name || "",
      },
    });
    return redirect("/dashboard/accounts");
  } catch {
    // TODO: fix this unable to connect accoutn error

    return redirect("/dashboard/accounts");
  }
};
