import React from "react";
import ClientView from "./client-view";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();
  if (!session?.user) {
    return redirect("/auth");
  }
  const mediaItems = await db.media.findMany({
    where: {
      userId: session.user.id,
    },
  });
  return <ClientView mediaItems={mediaItems} />;
};

export default page;
