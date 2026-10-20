"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/security";
import { ActionResponse, Role } from "@/types";
import { AdminRequestService } from "../services/admin-request.service";

export async function assignOfficerAction(
  formData: FormData
): Promise<ActionResponse> {
  const session = await getSession();
  if (!session || (session.role !== Role.SUPER_ADMIN && session.role !== Role.OFFICER)) {
    return { success: false, error: "Unauthorized access." };
  }

  const requestId = formData.get("requestId") as string;
  const officerId = formData.get("officerId") as string;

  if (!requestId || !officerId) {
    return { success: false, error: "Missing incident or officer identifier." };
  }

  try {
    await AdminRequestService.assignOfficer({
      requestId,
      officerId,
      actorId: session.userId,
    });

    revalidatePath("/analytics");
    revalidatePath("/incidents");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to assign officer.",
    };
  }
}
