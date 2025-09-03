import { Client } from "@upstash/qstash";

const qstashClient = new Client();

export async function schedulePost(postId: string, scheduledAt: Date) {
  await qstashClient.publish({
    url: `${process.env.AWS_LAMBDA_ENDPOINT}`,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postId,
      secret: process.env.AWS_LAMBDA_SECRET!,
    }),
    notBefore: scheduledAt.getTime() - Date.now(),
  });
}
