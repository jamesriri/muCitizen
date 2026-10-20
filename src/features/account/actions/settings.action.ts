"use server";

import * as bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";
import { getSession } from "@/lib/security";
import {
  changePasswordSchema,
  notificationPreferencesSchema,
} from "@/lib/validations";

export async function updatePasswordAction(data: unknown) {
  const parsed = changePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid password details.",
    };
  }

  const session = await getSession();
  if (!session) {
    return { success: false, message: "Please sign in again to update your password." };
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  });
  if (!user) {
    return { success: false, message: "Your account could not be found." };
  }

  const currentPasswordMatches = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!currentPasswordMatches) {
    return { success: false, message: "Your current password is incorrect." };
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return {
      success: false,
      message: "Choose a new password that differs from your current password.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({
    where: { id: session.userId },
    data: { passwordHash },
  });

  return { success: true, message: "Your password has been updated." };
}

export async function updateNotificationPreferencesAction(data: unknown) {
  const parsed = notificationPreferencesSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid notification settings.",
    };
  }

  const session = await getSession();
  if (!session) {
    return { success: false, message: "Please sign in again to update your settings." };
  }

  await db.user.update({
    where: { id: session.userId },
    data: parsed.data,
    select: { id: true },
  });

  return { success: true, message: "Notification preferences saved." };
}
