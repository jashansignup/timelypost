import { db } from "./db";
import dotenv from "dotenv";
import { quillHtmlToUnicode } from "./unicode-converter";
import { postOnX } from "./post-functions/post-on-x";
import { postOnLinkedIn } from "./post-functions/post-on-linkedin";
dotenv.config();

export async function handler(event: any): Promise<{
  status: "ok" | "error";
  message?: string;
}> {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { status: "error", message: JSON.stringify(event) };
  }

  if (body.secret !== process.env.API_SECRET) {
    return { status: "error", message: JSON.stringify(event) };
  }

  const postId = body.postId;
  if (!postId) {
    return { status: "error", message: "Missing postId" };
  }

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      socialAccount: true,
      media: true,
    },
  });

  if (!post) {
    return {
      status: "error",
      message: "Post not found",
    };
  }
  const diff = Math.abs(post.scheduledAt.getTime() - new Date().getTime());
  // if diff is more then the 5min the return
  // if (diff > 5 * 60 * 1000) {
  //   return {
  //     status: "error",
  //     message: "Post is not scheduled yet",
  //   };
  // }

  const safeText = quillHtmlToUnicode(post.text);

  for (const account of post.socialAccount) {
    if (account.type === "X") {
      await postOnX(account, post, safeText);
    } else if (account.type === "LINKEDIN") {
      await postOnLinkedIn(account, post, safeText);
    }
  }
  // await db.post.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     posted: true,
  //     postedAt: new Date(),
  //   },
  // });

  return {
    status: "ok",
    message: "Post posted successfully",
  };
}

try {
  (async () => {
    const res = await handler({
      body: JSON.stringify({
        postId: "cmf9malke0005pueyow08iv4q",
        secret: process.env.API_SECRET,
      }),
    });
    console.log(res);
  })();
} catch (error) {
  console.error(error);
}
