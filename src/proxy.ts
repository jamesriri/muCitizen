import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/security";
import { getDashboardPath } from "@/lib/config";
import { Role } from "@/types";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAuthPage =
    ["/login", "/register", "/signup", "/forgot-password", "/reset-password", "/auth"].some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
  const isCitizenRoute =
    pathname === "/requests" ||
    pathname === "/my-requests" ||
    pathname === "/my-analytics";
  const isStaffRoute =
    pathname === "/analytics" || pathname === "/incidents" || pathname === "/map";
  const isSuperAdminRoute = pathname === "/staff" || pathname === "/audit";
  const isAccountRoute = pathname === "/accounts" || pathname.startsWith("/accounts/");
  const isProtectedRoute =
    isCitizenRoute || isStaffRoute || isSuperAdminRoute || isAccountRoute;

  if (isAuthPage && session) {
    return NextResponse.redirect(
      new URL(getDashboardPath(session.role), request.url),
    );
  }

  if (isProtectedRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isCitizen = session.role === Role.CITIZEN;
    const hasRoleAccess =
      (!isCitizenRoute || isCitizen) &&
      (!isStaffRoute || session.role !== Role.CITIZEN) &&
      (!isSuperAdminRoute || session.role === Role.SUPER_ADMIN);
    if (!hasRoleAccess) {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.role), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
