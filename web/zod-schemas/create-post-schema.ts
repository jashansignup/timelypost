import * as z from "zod";

export const createPostSchema = z
  .object({
    text: z.string().min(1).max(280),
    mediaIds: z.array(z.string()),
    accountIds: z.array(z.string()).min(1, {
      message: "At least one account is required",
    }),
    scheduledAt: z.date(),
    isScheduled: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isScheduled) {
        return data.scheduledAt >= new Date(Date.now() + 60000);
      }
      return true;
    },
    {
      message: "Scheduled date must be at least 1 minute from now",
    }
  );
