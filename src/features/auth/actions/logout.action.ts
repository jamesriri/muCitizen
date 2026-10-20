"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/security";

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
