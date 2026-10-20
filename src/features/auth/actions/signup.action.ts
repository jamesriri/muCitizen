"use server";

import * as bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/security";
import { Role } from "@/types/domain";
import { ActionResponse } from "@/types";

export interface SignupInput {
  first_name: string;
  last_name: string;
  national_id: string;
  phone_number: string;
  email: string;
  password: string;
  confirm_password?: string;
  county?: string;
  residence_address?: string;
}

export async function signupAction(data: SignupInput): Promise<ActionResponse> {
  try {
    const existingEmail = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      return { error: "An account with this email address already exists." };
    }

    const existingId = await db.user.findUnique({
      where: { nationalId: data.national_id },
    });
    if (existingId) {
      return { error: "An account with this National ID already exists." };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const fullName = `${data.first_name} ${data.last_name}`.trim();

    const newUser = await db.user.create({
      data: {
        email: data.email,
        fullName,
        nationalId: data.national_id,
        phoneNumber: data.phone_number,
        passwordHash,
        role: "CITIZEN",
      },
    });

    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role as Role,
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to create user account.",
    };
  }
}
