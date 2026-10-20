import { z } from "zod";
import { Priority } from "@/types/domain";

export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export function isAllowedAttachmentType(
  type: string,
): type is (typeof ALLOWED_ATTACHMENT_TYPES)[number] {
  return ALLOWED_ATTACHMENT_TYPES.some((allowedType) => allowedType === type);
}

export const createRequestSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title cannot exceed 120 characters")
    .trim(),
  categoryId: z.string().min(1, "Please select an incident category"),
  priority: z.enum(Priority),
  description: z
    .string()
    .min(20, "Please provide a detailed description (min 20 characters)")
    .max(2000, "Description is too long (max 2000 characters)")
    .trim(),
  locationAddress: z
    .string()
    .min(5, "Location address or landmark is required (min 5 characters)")
    .max(255, "Address cannot exceed 255 characters")
    .trim(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
