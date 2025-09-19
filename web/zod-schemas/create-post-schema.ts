import * as z from "zod";
const baseSchema = z.object({
  text: z.string().min(1).max(280),
  // Media ids so that perfect image of video can be attached
  mediaIds: z.array(z.string()),
  // Linkedin or other platforms account ids those users wanna to share
  accountIds: z.array(z.string()).min(1, {
    message: "At least one account is required",
  }),
  // If true, post now else schedule
  postNow: z.boolean(),
  scheduledAt: z.coerce.date(),
});

export const updatePostSchema = baseSchema
  .merge(z.object({ id: z.string() }))
  .refine(
    (data) => {
      if (data.postNow) {
        return data.scheduledAt >= new Date(Date.now() + 60000);
      }
      return true;
    },
    {
      message: "Scheduled date must be at least 1 minute from now",
    }
  );

export const createPostSchema = baseSchema.refine(
  (data) => {
    if (data.postNow) {
      return data.scheduledAt >= new Date(Date.now() + 60000);
    }
    return true;
  },
  {
    message: "Scheduled date must be at least 1 minute from now",
  }
);
