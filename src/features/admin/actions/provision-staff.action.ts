"use server";

import { revalidatePath } from "next/cache";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db/prisma";
import { getSession } from "@/lib/security";
import { Role } from "@/types";

export interface ProvisionStaffResult {
  success: boolean;
  temporaryPassword?: string;
  error?: string;
}

export async function provisionStaffAction(
  formData: FormData
): Promise<ProvisionStaffResult> {
  const session = await getSession();
  if (!session || session.role !== Role.SUPER_ADMIN) {
    return { success: false, error: "Unauthorized. Super Admin access required." };
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const nationalId = (formData.get("nationalId") as string)?.trim();
  const role = (formData.get("role") as Role) || Role.OFFICER;

  if (!fullName || !email || !nationalId) {
    return { success: false, error: "All profile fields are required." };
  }

  try {
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email }, { nationalId }],
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A user with this Email Address or ID Number is already registered.",
      };
    }

    // temp password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let temporaryPassword = "P@";
    for (let i = 0; i < 10; i++) {
      temporaryPassword += chars.charAt(crypto.randomInt(0, chars.length));
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    await db.user.create({
      data: {
        fullName,
        email,
        nationalId,
        role,
        passwordHash,
      },
    });

    revalidatePath("/staff");
    revalidatePath("/incidents");

    return {
      success: true,
      temporaryPassword,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to provision staff account.",
    };
  }
}
