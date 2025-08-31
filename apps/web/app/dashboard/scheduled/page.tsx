import ClientView from "./client-view";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
export default async function page() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/auth");
  }
  const scheduledPosts = await db.post.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      socialAccount: true,
    },
  });

  return <ClientView posts={scheduledPosts} />;
}
