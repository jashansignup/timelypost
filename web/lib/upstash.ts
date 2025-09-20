import { Client } from "@upstash/qstash";

const qstashClient = new Client();

export async function schedulePost(
  postId: string,
  scheduledAt: Date
): Promise<string> {
  const res = await qstashClient.publish({
    url: `${process.env.AWS_LAMBDA_ENDPOINT}`,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postId,
      secret: process.env.AWS_LAMBDA_SECRET!,
    }),
    // notBefore takes the timestamp and overrides the delay
    // https://upstash.com/docs/qstash/features/delay#absolute-delay
    notBefore: Math.floor(scheduledAt.getTime() / 1000),
  });
  return res.messageId;
}
