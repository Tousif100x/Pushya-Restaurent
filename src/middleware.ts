import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/jwt";

const ADMIN_ROUTES = ["/admin/dashboard", "/admin/settings", "/admin/menu", "/admin/profile"];
const AUTH_REQUIRED_CUSTOMER_ROUTES = ["/checkout", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Protect Admin Routes ─────────────────────────────────────────────────
  const isAdminProtected = pathname.startsWith("/admin/") && pathname !== "/admin/login";
  if (isAdminProtected) {
    const sessionCookie = request.cookies.get("session")?.value;
    const session = sessionCookie ? await decrypt(sessionCookie) : null;

    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ─── Protect Customer Auth Routes ─────────────────────────────────────────
  const isCustomerProtected = AUTH_REQUIRED_CUSTOMER_ROUTES.some((r) =>
    pathname.startsWith(r)
  );
  if (isCustomerProtected) {
    const sessionCookie = request.cookies.get("session")?.value;
    const session = sessionCookie ? await decrypt(sessionCookie) : null;
    const role = (session?.role || "").toString().toUpperCase();

    if (!session || (role !== "USER" && role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout",
    "/profile/:path*",
  ],
};
