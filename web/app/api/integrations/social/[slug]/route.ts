import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { XAuth } from "./auth-functions/x-auth";
import { LinkedInAuth } from "./auth-functions/linkedin-auth";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  const slug = (await params).slug;

  if (!session?.user) {
    redirect("/login");
  }

  if (slug === "x") {
    return XAuth(req, session);
  }
  if (slug === "linkedin") {
    return LinkedInAuth(req, session);
  }

  return redirect("/dashboard/accounts");
}
