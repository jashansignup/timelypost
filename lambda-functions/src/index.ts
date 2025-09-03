import { db } from "./db.js";
import dotenv from "dotenv";
import { quillHtmlToUnicode } from "./unicode-converter.js";
import { postOnX } from "./post-functions/post-on-x.js";
dotenv.config();

interface handlerProps {
  postId: string;
}
export async function handler({ postId }: handlerProps) {
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
    return;
  }
  const diff = Math.abs(post.scheduledAt.getTime() - new Date().getTime());
  // if diff is more then the 5min the return
  if (diff > 60 * 1000) {
    return;
  }

  const safeText = quillHtmlToUnicode(post.text);

  for (const account of post.socialAccount) {
    if (account.type === "X") {
      await postOnX(account, post, safeText);
    }
  }
  await db.post.update({
    where: {
      id: postId,
    },
    data: {
      posted: true,
      postedAt: new Date(),
    },
  });

  return;
}
