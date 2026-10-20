import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@/types/domain";
import { getDashboardPath } from "@/lib/config/navigation";

const SESSION_COOKIE_NAME = "mu-citizen_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "NEXTAUTH_SECRET must be defined with at least 32 characters in env file",
    );
  }

  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  expiresAt: number;
}

// encryption and signing to compact JWTs
export async function signSessionToken(
  payload: Omit<SessionPayload, "expiresAt">,
): Promise<string> {
  const secretKey = getJwtSecretKey();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

  return new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey);
}


export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const secretKey = getJwtSecretKey();
      
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
      
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  payload: Omit<SessionPayload, "expiresAt">,
): Promise<void> {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  return verifySessionToken(token);
}

export async function requireRole(
  allowedRoles: readonly Role[],
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!allowedRoles.includes(session.role)) {
    redirect(getDashboardPath(session.role));
  }
  return session;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };
