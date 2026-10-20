import crypto from "crypto";
import * as bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";

export class PasswordResetService {
  /**
   * Generates a single-use crypto token with 1-hour expiration
   */
  static async createResetToken(email: string): Promise<string | null> {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Verifies if a reset token is valid and unexpired
   */
  static async verifyToken(token: string) {
    const record = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      return { valid: false, message: "This recovery link is invalid or has already been used." };
    }

    if (new Date() > record.expiresAt) {
      await db.passwordResetToken.delete({ where: { token } });
      return { valid: false, message: "This recovery link has expired. Please request a new one." };
    }

    return { valid: true, email: record.email };
  }

  /**
   * Updates the user's password and burns the reset token
   */
  static async resetPassword(token: string, newPassword: string) {
    const verification = await this.verifyToken(token);
    if (!verification.valid || !verification.email) {
      throw new Error(verification.message || "Invalid or expired token");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.$transaction([
      db.user.update({
        where: { email: verification.email },
        data: { passwordHash },
      }),
      db.passwordResetToken.delete({
        where: { token },
      }),
    ]);

    return { success: true };
  }
}
