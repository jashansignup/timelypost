import ClientView from "./client-view";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const page = async () => {
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
};

export default page;
