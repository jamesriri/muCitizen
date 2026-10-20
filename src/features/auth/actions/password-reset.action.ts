"use server";

import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import { PasswordResetService } from "../services/password-reset.service";

export interface PasswordResetActionResult {
  success: boolean;
  message?: string;
  devResetUrl?: string;
}

export async function requestPasswordResetAction(
  data: unknown
): Promise<PasswordResetActionResult> {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid email address",
    };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      message:
        "Password recovery email delivery is not configured. Please contact portal support.",
    };
  }

  let token: string | null;
  try {
    token = await PasswordResetService.createResetToken(parsed.data.email);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2021"
    ) {
      return {
        success: false,
        message:
          "Password recovery storage is not initialized. Apply the pending database migration and try again.",
      };
    }
    throw error;
  }

  let devResetUrl: string | undefined;
  if (token) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    devResetUrl = `${appUrl}/reset-password?token=${token}`;
  }
    
  return {
    success: true,
    message:
      "If an account exists for that email, a recovery link is ready. For privacy, this page does not confirm whether an account exists.",
    devResetUrl,
  };
}

export async function completePasswordResetAction(
  data: unknown
): Promise<PasswordResetActionResult> {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input data",
    };
  }

  try {
    await PasswordResetService.resetPassword(parsed.data.token, parsed.data.newPassword);
    return {
      success: true,
      message: "Password updated successfully! You can now sign in with your new credentials.",
    };
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2021"
    ) {
      return {
        success: false,
        message:
          "Password recovery storage is not initialized. Apply the pending database migration and try again.",
      };
    }
    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please request a new recovery link.",
    };
  }
}
