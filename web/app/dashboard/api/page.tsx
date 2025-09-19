import { auth } from "@/lib/auth";
import ClientView from "./client-view";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth");
  }
  const apiKeys = await db.apiKey.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const safeApiKeys = apiKeys.map((k) => ({
    ...k,
    description: k.description ?? null,
    createdAt: k.createdAt.toISOString(),
    updatedAt: k.updatedAt.toISOString(),
  }));

  return <ClientView apiKeys={safeApiKeys} />;
}
