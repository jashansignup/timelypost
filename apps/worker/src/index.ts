import express from "express";
import { env } from "./lib/env.js";
import { db } from "./lib/db.js";
import { postQueue } from "./queues/post-queue.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/instant-add", async (req, res) => {
  const postId = req.body.postId;

  await postQueue.add(
    "post-queue",
    { postId },
    {
      delay: 0,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
  res.status(200).json({ message: "Posts added to queue" });
});

async function getPostsUnder1hour() {
  const posts = await db.post.findMany({
    where: {
      scheduledAt: {
        lte: new Date(Date.now() + 60 * 60 * 1000),
      },
      posted: false,
    },
  });
  for (const post of posts) {
    const delay = post.scheduledAt.getTime() - Date.now();
    await postQueue.add(
      "post-queue",
      { postId: post.id },
      {
        delay: Math.max(delay, 0),
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }
}

getPostsUnder1hour();
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} 🚀`);
});
