import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { db } from "@/lib/db";
import { SocialAccountType } from "@prisma/client";
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

    const response = await axios.get("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${res.data.access_token}`,
      },
    });
    await db.$transaction(async (tx) => {
      const socialAccount = await tx.socialAccount.create({
        data: {
          type: SocialAccountType.LINKEDIN,
          userId: session?.user?.id || " ",
          username: response.data.vanityName || "linkedin_account",
        },
      });
      await tx.linkedInAccount.create({
        data: {
          socialAccountId: socialAccount.id,
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
          uuid: response.data.id,
          lastRefreshedAt: new Date(),
        },
      });
    });
    return redirect("/dashboard/accounts");
  } catch (e) {
    console.log(e);
    return redirect("/dashboard/accounts");
  }
};
