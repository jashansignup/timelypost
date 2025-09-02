import { Client } from "@upstash/qstash";
import { BASE_URL } from "./constants";

const qstashClient = new Client();

export async function schedulePost(postId: string) {
  const res = await qstashClient.publish({
    url: `${BASE_URL}/api/test`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERSONAL_API_KEY}`,
    },
    body: JSON.stringify({
      postId,
    }),
    notBefore: 1000,
  });
  console.log(res);
}
