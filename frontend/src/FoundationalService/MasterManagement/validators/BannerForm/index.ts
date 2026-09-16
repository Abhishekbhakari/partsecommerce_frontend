import { z } from "zod";

export const bannerFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Upload an image first"),
  link: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  placement: z.string().min(1, "Placement is required"),
  active: z.boolean().optional()
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
