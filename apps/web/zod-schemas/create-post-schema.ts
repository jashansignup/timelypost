import * as z from "zod";

export const createPostSchema = z.object({
  text: z.string().min(1).max(280),
  mediaIds: z.array(z.string()),
  accountIds: z.array(z.string()),
});
