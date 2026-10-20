"use server";

import * as bcrypt from "bcryptjs";
import { db } from "@/lib/db/prisma";
import { setSessionCookie } from "@/lib/security";
import { Role } from "@/types/domain";
import { loginSchema } from "@/lib/validations";
import { ActionResponse } from "@/types";
import { getDashboardPath } from "@/lib/config/navigation";

export async function signinAction(data: unknown): Promise<ActionResponse> {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input data" };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid email or password combination" };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return { error: "Invalid email or password combination" };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as Role,
  });

  return { success: true, redirectTo: getDashboardPath(user.role as Role) };
}
