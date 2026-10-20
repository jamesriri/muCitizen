"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/security";
import { Priority, Role } from "@/types";
import {
  createRequestSchema,
  isAllowedAttachmentType,
  MAX_ATTACHMENT_SIZE_BYTES,
} from "../schemas/request.schema";
import { RequestService } from "../services/request.service";

export interface CreateRequestActionResult {
  success: boolean;
  referenceNumber?: string;
  error?: string;
}

export async function submitRequestAction(
  formData: FormData,
): Promise<CreateRequestActionResult> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Unauthorized. Please sign in to submit a request.",
    };
  }
  if (session.role !== Role.CITIZEN) {
    return {
      success: false,
      error: "Only citizen accounts can submit service requests.",
    };
  }

  const rawLat = formData.get("latitude");
  const rawLng = formData.get("longitude");

  const payload = {
    title: formData.get("title") as string,
    categoryId: formData.get("categoryId") as string,
    priority: (formData.get("priority") as Priority) || Priority.MEDIUM,
    description: formData.get("description") as string,
    locationAddress: formData.get("locationAddress") as string,
    latitude: rawLat ? parseFloat(rawLat as string) : null,
    longitude: rawLng ? parseFloat(rawLng as string) : null,
  };

  const parsed = createRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  const imageEntry = formData.get("image");
  if (imageEntry !== null && typeof imageEntry === "string") {
    return { success: false, error: "The uploaded attachment is invalid." };
  }

  const file = imageEntry;
  if (file && file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return { success: false, error: "Image must be 5 MB or smaller." };
  }
  if (file && !isAllowedAttachmentType(file.type)) {
    return {
      success: false,
      error: "Choose a PNG, JPEG, or WebP image.",
    };
  }

  try {
    const created = await RequestService.createRequest(
      parsed.data,
      session.userId,
      file,
    );

    revalidatePath("/my-requests");
    revalidatePath("/incidents");

    return {
      success: true,
      referenceNumber: created.referenceNumber,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to record service request.",
    };
  }
}
