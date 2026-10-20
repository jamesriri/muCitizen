"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/security";
import { AdminRequestService } from "../services/admin-request.service";
import { ActionResponse, RequestStatus, Role } from "@/types";

export async function updateRequestStatusAction(
  formData: FormData
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || (session.role !== Role.SUPER_ADMIN && session.role !== Role.OFFICER)) {
    return { success: false, error: "Unauthorized access." };
  }

  const requestId = formData.get("requestId") as string;
  const newStatus = formData.get("newStatus") as RequestStatus;
  const comment = formData.get("comment") as string;
  const isInternal = formData.get("isInternal") === "true";

  if (!requestId || !newStatus) {
    return { success: false, error: "Missing required parameters." };
  }

  try {
    await AdminRequestService.updateStatus({
      requestId,
      newStatus,
      comment,
      actorId: session.userId,
      isInternal,
    });

    revalidatePath("/analytics");
    revalidatePath("/incidents");
    revalidatePath("/my-requests");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update incident status.",
    };
  }
}
