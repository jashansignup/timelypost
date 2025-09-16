import { auth } from "@/lib/auth";
import ClientView from "./client-view";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function page() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/auth");
  }
  const accounts = await db.socialAccount.findMany({
    where: {
      userId: session.user.id,
    },
  });
  return <ClientView accounts={accounts} />;
}
