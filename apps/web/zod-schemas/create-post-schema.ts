import * as z from "zod";

export const createPostSchema = z.object({
  text: z.string().min(1).max(280),
  mediaIds: z.array(z.string()),
  accountIds: z.array(z.string()).min(1, {
    message: "At least one account is required",
  }),
  scheduledAt: z.date().refine((date) => date >= new Date(), {
    message: "Scheduled date must be at least 1 minute from now",
  }),
  isScheduled: z.boolean(),
});
