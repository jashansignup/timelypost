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
  try {
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

    if (post.status === "POSTED") {
      return {
        status: "ok",
        message: "Post already posted",
      };
    }

    const now = new Date().getTime();
    const scheduledTime = post.scheduledAt.getTime();
    const timeDiff = now - scheduledTime;

    if (timeDiff < -60 * 1000) {
      return {
        status: "error",
        message: "Post is scheduled for the future",
      };
    }

    if (timeDiff > 30 * 60 * 1000) {
      await db.post.update({
        where: { id: postId },
        data: {
          status: "FAILED",
          error: "Post scheduling window expired (more than 30 minutes late)",
        },
      });
      return {
        status: "error",
        message: "Post scheduling window expired",
      };
    }

    const safeText = quillHtmlToUnicode(post.text);

    const results: { account: string; success: boolean; error?: string }[] = [];

    for (const account of post.socialAccount) {
      try {
        if (account.type === "X") {
          await postOnX(account, post, safeText);
        } else if (account.type === "LINKEDIN") {
          await postOnLinkedIn(account, post, safeText);
        }
        results.push({ account: account.type, success: true });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);
        console.error(`Failed to post to ${account.type}:`, errorMessage);
        results.push({
          account: account.type,
          success: false,
          error: errorMessage,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failedResults = results.filter((r) => !r.success);

    if (successCount === results.length) {
      await db.post.update({
        where: { id: postId },
        data: {
          status: "POSTED",
          postedAt: new Date(),
        },
      });
      return {
        status: "ok",
        message: "Post posted successfully to all accounts",
      };
    } else if (successCount > 0) {
      const errorSummary = failedResults
        .map((r) => `${r.account}: ${r.error}`)
        .join("; ");
      await db.post.update({
        where: { id: postId },
        data: {
          status: "POSTED",
          postedAt: new Date(),
          error: `Partial success. Failed accounts: ${errorSummary}`,
        },
      });
      return {
        status: "ok",
        message: `Post partially successful. ${successCount}/${results.length} accounts posted.`,
      };
    } else {
      const errorSummary = failedResults
        .map((r) => `${r.account}: ${r.error}`)
        .join("; ");
      await db.post.update({
        where: { id: postId },
        data: {
          status: "FAILED",
          error: errorSummary,
        },
      });
      return {
        status: "error",
        message: "Post failed to post to all accounts",
      };
    }
  } catch (error: unknown) {
    const body = JSON.parse(event.body || "{}");
    const errorMessage = error instanceof Error ? error.message : String(error);

    try {
      await db.post.update({
        where: { id: body.postId },
        data: {
          status: "FAILED",
          error: errorMessage,
        },
      });
    } catch (dbError) {
      console.error("Failed to update post status:", dbError);
    }

    return {
      status: "error",
      message: `Post failed: ${errorMessage}`,
    };
  }
}

// try {
//   (async () => {
//     const res = await handler({
//       body: JSON.stringify({
//         postId: "cmfmf28rt000dpu4kki4kxw70",
//         secret: process.env.API_SECRET,
//       }),
//     });
//     console.log(res);
//   })();
// } catch (error) {
//   console.error(error);
// }
